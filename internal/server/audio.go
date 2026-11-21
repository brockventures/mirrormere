package server

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net"
	"net/http"
	"net/url"
	"slices"
	"strings"
	"time"

	"github.com/azylman/mirrormere/internal/api"
)

// AudioCoordinator abstracts master audio coordinator state manipulation.
type AudioCoordinator interface {
	GetState() (int, bool)
	SetVolume(vol int) (int, bool, error)
	SetMute(muted *bool) (int, bool, error)
}

// DefaultAudioHandler serves /api/audio, /api/audio/volume, and /api/audio/mute endpoints.
type DefaultAudioHandler struct {
	coord AudioCoordinator
}

// NewDefaultAudioHandler constructs a DefaultAudioHandler backed by coord.
func NewDefaultAudioHandler(coord AudioCoordinator) *DefaultAudioHandler {
	return &DefaultAudioHandler{coord: coord}
}

// GetAudio handles GET /api/audio.
func (h *DefaultAudioHandler) GetAudio(w http.ResponseWriter, r *http.Request) {
	if !requireCORSAndMethod(w, r, "GET, HEAD, OPTIONS", http.MethodGet, http.MethodHead) {
		return
	}
	if h.coord == nil {
		writeAPIError(w, http.StatusInternalServerError, "audio coordinator not configured")
		return
	}
	vol, muted := h.coord.GetState()
	if r.Method == http.MethodHead {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		return
	}
	writeJSON(w, http.StatusOK, api.AudioStateResponse{Status: "ok", Volume: vol, Muted: muted})
}

// PostAudioVolume handles POST /api/audio/volume.
func (h *DefaultAudioHandler) PostAudioVolume(w http.ResponseWriter, r *http.Request) {
	if !requireSameOriginAndMethod(w, r, "POST, OPTIONS", http.MethodPost) {
		return
	}
	if h.coord == nil {
		writeAPIError(w, http.StatusInternalServerError, "audio coordinator not configured")
		return
	}
	var req api.AudioVolumeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Volume == nil || *req.Volume < 0 || *req.Volume > 100 {
		writeAPIError(w, http.StatusBadRequest, "invalid volume: must be an integer between 0 and 100")
		return
	}
	newVol, newMuted, err := h.coord.SetVolume(*req.Volume)
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, api.AudioStateResponse{Status: "ok", Volume: newVol, Muted: newMuted})
}

// PostAudioMute handles POST /api/audio/mute.
func (h *DefaultAudioHandler) PostAudioMute(w http.ResponseWriter, r *http.Request) {
	if !requireSameOriginAndMethod(w, r, "POST, OPTIONS", http.MethodPost) {
		return
	}
	if h.coord == nil {
		writeAPIError(w, http.StatusInternalServerError, "audio coordinator not configured")
		return
	}
	var req api.AudioMuteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil && !errors.Is(err, io.EOF) {
		writeAPIError(w, http.StatusBadRequest, "invalid payload: muted must be a boolean")
		return
	}
	var targetMuted *bool
	if len(req.Muted) > 0 {
		var b bool
		if bytes.Equal(bytes.TrimSpace(req.Muted), []byte("null")) || json.Unmarshal(req.Muted, &b) != nil {
			writeAPIError(w, http.StatusBadRequest, "invalid payload: muted must be a boolean")
			return
		}
		targetMuted = &b
	}
	newVol, newMuted, err := h.coord.SetMute(targetMuted)
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, api.AudioStateResponse{Status: "ok", Volume: newVol, Muted: newMuted})
}

func isReadOnlyMethods(allowed []string) bool {
	for _, m := range allowed {
		if m != http.MethodGet && m != http.MethodHead {
			return false
		}
	}
	return len(allowed) > 0
}

func parseHostWithoutPort(hostport string) (string, bool) {
	switch {
	case strings.HasPrefix(hostport, "[") && strings.HasSuffix(hostport, "]"):
		return hostport[1 : len(hostport)-1], true
	case strings.Contains(hostport, ":"):
		return "", false
	default:
		return hostport, true
	}
}

func defaultOriginPort(scheme string) string {
	if scheme == "https" {
		return "443"
	}
	return "80"
}

func normalizeOriginHost(scheme, hostport string) (string, string, bool) {
	hostport = strings.TrimSpace(hostport)
	if hostport == "" {
		return "", "", false
	}
	host, port, err := net.SplitHostPort(hostport)
	if err != nil {
		var ok bool
		host, ok = parseHostWithoutPort(hostport)
		if !ok {
			return "", "", false
		}
		port = defaultOriginPort(scheme)
	}
	if host == "" {
		return "", "", false
	}
	return strings.ToLower(host), port, true
}

func isSameOrigin(origin, reqHost string) bool {
	u, err := url.Parse(origin)
	if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" || u.User != nil || u.Path != "" || u.RawQuery != "" || u.Fragment != "" {
		return false
	}
	oHost, oPort, ok1 := normalizeOriginHost(u.Scheme, u.Host)
	rHost, rPort, ok2 := normalizeOriginHost(u.Scheme, reqHost)
	return ok1 && ok2 && oHost == rHost && oPort == rPort
}

func requireSameOriginAndMethod(w http.ResponseWriter, r *http.Request, allowHeader string, allowed ...string) bool {
	w.Header().Add("Vary", "Origin")
	if origin := strings.TrimSpace(r.Header.Get("Origin")); origin != "" {
		if !isSameOrigin(origin, r.Host) {
			writeAPIError(w, http.StatusForbidden, "cross-origin request forbidden")
			return false
		}
		w.Header().Set("Access-Control-Allow-Origin", origin)
	}
	w.Header().Set("Access-Control-Allow-Methods", allowHeader)
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Accept")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return false
	}
	if slices.Contains(allowed, r.Method) {
		return true
	}
	w.Header().Set("Allow", allowHeader)
	writeAPIError(w, http.StatusMethodNotAllowed, "method not allowed")
	return false
}

func requireCORSAndMethod(w http.ResponseWriter, r *http.Request, allowHeader string, allowed ...string) bool {
	if !isReadOnlyMethods(allowed) {
		return requireSameOriginAndMethod(w, r, allowHeader, allowed...)
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", allowHeader)
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Accept")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return false
	}
	if slices.Contains(allowed, r.Method) {
		return true
	}
	w.Header().Set("Allow", allowHeader)
	writeAPIError(w, http.StatusMethodNotAllowed, "method not allowed")
	return false
}

func writeJSON(w http.ResponseWriter, code int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		slog.Error("failed to encode json response", "error", err)
	}
}

func writeAPIError(w http.ResponseWriter, code int, msg string) {
	writeJSON(w, code, api.ErrorResponse{Status: "error", Error: msg})
}

func setSSEHeaders(w http.ResponseWriter, rc *http.ResponseController) {
	for k, v := range map[string]string{"Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"} {
		w.Header().Set(k, v)
	}
	if err := rc.SetWriteDeadline(time.Time{}); err != nil && !errors.Is(err, http.ErrNotSupported) {
		slog.Debug("failed to clear write deadline", "error", err)
	}
	w.WriteHeader(http.StatusOK)
}

func clearDeadlines(rc *http.ResponseController) {
	if err := rc.SetReadDeadline(time.Time{}); err != nil && !errors.Is(err, http.ErrNotSupported) {
		slog.Debug("failed to clear read deadline", "error", err)
	}
	if err := rc.SetWriteDeadline(time.Time{}); err != nil && !errors.Is(err, http.ErrNotSupported) {
		slog.Debug("failed to clear write deadline", "error", err)
	}
}
