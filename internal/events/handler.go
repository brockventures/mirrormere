package events

import (
	"context"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"strings"
	"sync"
	"time"
)

const (
	defaultSSEWriteTimeout   = 10 * time.Second
	defaultMaxSSESubscribers = 64
)

var sseSubscribeMu sync.Mutex

// Handler constructs an http.Handler serving GET /api/events for SSE clients.
func Handler(hub *Hub) http.Handler {
	return newHandler(hub, defaultSSEWriteTimeout, defaultMaxSSESubscribers)
}

func newHandler(hub *Hub, writeTimeout time.Duration, maxSubs int) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. CORS Preflight
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Cache-Control, Last-Event-ID, Content-Type, Accept")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method != http.MethodGet {
			w.Header().Set("Allow", "GET, OPTIONS")
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// 2. http.Flusher Verification
		flusher, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "streaming unsupported", http.StatusInternalServerError)
			return
		}

		// 3. Enforce concurrent subscriber cap and subscribe BEFORE snapshot/replay to eliminate race window (Issue #199)
		ch, unsubscribe, allowed := subscribeWithLimit(r.Context(), hub, maxSubs)
		if !allowed {
			http.Error(w, "too many concurrent subscribers", http.StatusServiceUnavailable)
			return
		}
		defer unsubscribe()

		// 4. Response Headers
		w.Header().Set("Content-Type", "text/event-stream; charset=utf-8")
		w.Header().Set("Cache-Control", "no-cache, no-transform")
		w.Header().Set("Connection", "keep-alive")
		w.Header().Set("X-Accel-Buffering", "no")

		// 5. Establish bounded per-write deadline to prevent slow/stalled clients from pinning sockets
		rc := http.NewResponseController(w)
		setSSEWriteDeadline(rc, writeTimeout, hub.logger)
		w.WriteHeader(http.StatusOK)
		if !flushSSE(rc, flusher) {
			return
		}

		// 6. Initial Hydration vs Replay
		lastEventID := resolveLastEventID(r)
		initialBatch, seenReplayIDs := prepareInitialEvents(hub, lastEventID)

		// 7. Flush initial batch (hydration or replay)
		if !writeInitialBatch(w, rc, flusher, initialBatch, writeTimeout, hub.logger) {
			return
		}

		// 8-10. Live Stream & Keep-alive SSE Loop
		streamSSELoop(r.Context(), w, rc, flusher, ch, hub.cfg.HeartbeatInterval, writeTimeout, hub.logger, seenReplayIDs)
	})
}

func subscribeWithLimit(ctx context.Context, hub *Hub, maxSubs int) (<-chan *Event, func(), bool) {
	sseSubscribeMu.Lock()
	defer sseSubscribeMu.Unlock()
	if maxSubs > 0 {
		hub.mu.RLock()
		count := len(hub.subscribers)
		hub.mu.RUnlock()
		if count >= maxSubs {
			return nil, nil, false
		}
	}
	ch, unsub := hub.Subscribe(ctx)
	return ch, unsub, true
}

func setSSEWriteDeadline(rc *http.ResponseController, timeout time.Duration, logger *slog.Logger) {
	if rc == nil || timeout <= 0 {
		return
	}
	if err := rc.SetWriteDeadline(time.Now().Add(timeout)); err != nil && !errors.Is(err, http.ErrNotSupported) {
		if logger != nil {
			logger.Debug("failed to set response write deadline", "error", err)
		}
	}
}

func flushSSE(rc *http.ResponseController, flusher http.Flusher) bool {
	if rc != nil {
		if err := rc.Flush(); err != nil && !errors.Is(err, http.ErrNotSupported) {
			return false
		}
		return true
	}
	flusher.Flush()
	return true
}

func writeInitialBatch(w io.Writer, rc *http.ResponseController, flusher http.Flusher, batch []*Event, writeTimeout time.Duration, logger *slog.Logger) bool {
	setSSEWriteDeadline(rc, writeTimeout, logger)
	for _, evt := range batch {
		if _, err := w.Write(evt.Format()); err != nil {
			return false
		}
	}
	return flushSSE(rc, flusher)
}

func writeAndFlushSSE(w io.Writer, rc *http.ResponseController, flusher http.Flusher, data []byte, writeTimeout time.Duration, logger *slog.Logger) bool {
	setSSEWriteDeadline(rc, writeTimeout, logger)
	if _, err := w.Write(data); err != nil {
		return false
	}
	return flushSSE(rc, flusher)
}

func resolveLastEventID(r *http.Request) string {
	lastEventID := strings.TrimSpace(r.Header.Get("Last-Event-ID"))
	if lastEventID != "" {
		return lastEventID
	}
	lastEventID = strings.TrimSpace(r.URL.Query().Get("lastEventId"))
	if lastEventID != "" {
		return lastEventID
	}
	return strings.TrimSpace(r.URL.Query().Get("last_event_id"))
}

func prepareInitialEvents(hub *Hub, lastEventID string) ([]*Event, map[string]struct{}) {
	if lastEventID == "" {
		return hub.BuildHydration(), nil
	}
	replayed, found := hub.ReplaySince(lastEventID)
	if !found {
		// Replay missed/expired: execute full initial state hydration
		return hub.BuildHydration(), nil
	}
	seenReplayIDs := make(map[string]struct{}, len(replayed)+1)
	seenReplayIDs[lastEventID] = struct{}{}
	for _, evt := range replayed {
		seenReplayIDs[evt.ID] = struct{}{}
	}
	return replayed, seenReplayIDs
}

func drainSSEQueue(ctx context.Context, ch <-chan *Event, deliver func(*Event) bool) bool {
	for {
		select {
		case <-ctx.Done():
			return false
		case evt, ok := <-ch:
			if !ok || !deliver(evt) {
				return false
			}
		default:
			return true
		}
	}
}

func streamSSELoop(ctx context.Context, w io.Writer, rc *http.ResponseController, flusher http.Flusher, ch <-chan *Event, heartbeat, writeTimeout time.Duration, logger *slog.Logger, seenReplayIDs map[string]struct{}) {
	ticker := time.NewTicker(heartbeat)
	defer ticker.Stop()

	deliverEvent := func(evt *Event) bool {
		if seenReplayIDs != nil {
			if _, seen := seenReplayIDs[evt.ID]; seen {
				return true
			}
			seenReplayIDs = nil
		}
		return writeAndFlushSSE(w, rc, flusher, evt.Format(), writeTimeout, logger)
	}

	if !drainSSEQueue(ctx, ch, deliverEvent) {
		return
	}

	for {
		select {
		case <-ctx.Done():
			return
		case evt, ok := <-ch:
			if !ok || !deliverEvent(evt) {
				return
			}
		case t := <-ticker.C:
			if !writeAndFlushSSE(w, rc, flusher, FormatPing(t), writeTimeout, logger) {
				return
			}
		}
	}
}
