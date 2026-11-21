package provider

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
)

func TestHomeAssistant_ServiceActionEntityAllowlist(t *testing.T) {
	t.Parallel()

	var upstreamCalls atomic.Int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/api/lovelace/config":
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{
				"title": "Living Room",
				"views": [{
					"title": "Main",
					"cards": [
						{"type": "tile", "entity": "light.living_room"},
						{"type": "button", "entity": "scene.evening", "tap_action": {"action": "call-service", "service": "script.movie_mode"}},
						{"type": "button", "hold_action": {"action": "call-service", "service": "light.turn_off", "target": {"entity_id": "light.lamp"}}}
					]
				}]
			}`))
		case r.URL.Path == "/api/states":
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`[
				{"entity_id": "light.living_room", "state": "off"},
				{"entity_id": "light.lamp", "state": "on"},
				{"entity_id": "lock.front_door", "state": "locked"},
				{"entity_id": "cover.garage", "state": "closed"}
			]`))
		case strings.HasPrefix(r.URL.Path, "/api/services/"):
			upstreamCalls.Add(1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`[{"entity_id":"light.living_room","state":"on"}]`))
		default:
			http.NotFound(w, r)
		}
	}))
	t.Cleanup(srv.Close)

	ctx := context.Background()

	t.Run("configured_entities_allowlist", func(t *testing.T) {
		t.Parallel()
		p := NewHomeAssistantProviderWithClient(srv.Client(), srv.URL, "tok")
		if err := p.Init(ctx, map[string]any{
			"url":      srv.URL,
			"entities": []string{"light.living_room", "light.lamp"},
		}, InitOptions{Token: "tok"}); err != nil {
			t.Fatalf("Init failed: %v", err)
		}

		tests := []struct {
			name        string
			domain      string
			service     string
			serviceData map[string]any
			wantErr     error
		}{
			{"allowed_single_entity", "light", "turn_on", map[string]any{"entity_id": "light.living_room"}, nil},
			{"allowed_multiple_entities", "light", "turn_off", map[string]any{"entity_id": []string{"light.living_room", "light.lamp"}}, nil},
			{"allowed_comma_separated", "light", "turn_off", map[string]any{"entity_id": "light.living_room, light.lamp"}, nil},
			{"blocked_unconfigured_light", "light", "turn_on", map[string]any{"entity_id": "light.bedroom"}, ErrActionForbidden},
			{"blocked_mixed_allowed_and_disallowed", "light", "turn_off", map[string]any{"entity_id": []any{"light.living_room", "light.bedroom"}}, ErrActionForbidden},
			{"blocked_lock_unlock", "lock", "unlock", map[string]any{"entity_id": "lock.front_door"}, ErrActionForbidden},
			{"blocked_cover_open", "cover", "open_cover", map[string]any{"entity_id": "cover.garage"}, ErrActionForbidden},
			{"blocked_direct_script", "script", "unlock_all", nil, ErrActionForbidden},
			{"blocked_script_turn_on", "script", "turn_on", map[string]any{"entity_id": "script.unlock_all"}, ErrActionForbidden},
			{"blocked_missing_entity_id", "light", "turn_off", map[string]any{"brightness": 100}, ErrActionForbidden},
			{"blocked_wildcard_all", "light", "turn_off", map[string]any{"entity_id": "all"}, ErrActionForbidden},
			{"blocked_wildcard_star", "light", "turn_off", map[string]any{"entity_id": "*"}, ErrActionForbidden},
			{"blocked_area_id_selector", "light", "turn_off", map[string]any{"area_id": "living_room"}, ErrActionForbidden},
			{"blocked_device_id_selector", "light", "turn_off", map[string]any{"device_id": "dev1"}, ErrActionForbidden},
			{"blocked_floor_id_selector", "light", "turn_off", map[string]any{"floor_id": "first"}, ErrActionForbidden},
			{"blocked_label_id_selector", "light", "turn_off", map[string]any{"label_id": "all_lights"}, ErrActionForbidden},
			{"blocked_domain_mismatch", "lock", "unlock", map[string]any{"entity_id": "light.living_room"}, ErrActionForbidden},
			{"invalid_entity_id_format", "light", "turn_on", map[string]any{"entity_id": "not-an-entity"}, ErrActionValidation},
			{"invalid_entity_id_type", "light", "turn_on", map[string]any{"entity_id": 12345}, ErrActionValidation},
		}

		for _, tc := range tests {
			t.Run(tc.name, func(t *testing.T) {
				t.Parallel()
				_, err := p.CallServiceWithResponse(ctx, tc.domain, tc.service, tc.serviceData)
				if !errors.Is(err, tc.wantErr) {
					t.Fatalf("CallServiceWithResponse(%s.%s) err = %v, want %v", tc.domain, tc.service, err, tc.wantErr)
				}
			})
		}
	})

	t.Run("discovered_lovelace_allowlist_and_pre_fetch_lockdown", func(t *testing.T) {
		t.Parallel()
		p := NewHomeAssistantProviderWithClient(srv.Client(), srv.URL, "tok")
		if err := p.Init(ctx, map[string]any{
			"url":       srv.URL,
			"dashboard": "default",
		}, InitOptions{Token: "tok"}); err != nil {
			t.Fatalf("Init failed: %v", err)
		}

		// Before Fetch discovers Lovelace entities, actions must fail closed.
		if _, err := p.CallServiceWithResponse(ctx, "light", "turn_on", map[string]any{"entity_id": "light.living_room"}); !errors.Is(err, ErrActionForbidden) {
			t.Fatalf("expected ErrActionForbidden before Fetch, got %v", err)
		}

		if _, err := p.Fetch(ctx); err != nil {
			t.Fatalf("Fetch failed: %v", err)
		}

		// Discovered card entity and tap/hold action entities are allowed.
		if _, err := p.CallServiceWithResponse(ctx, "light", "turn_on", map[string]any{"entity_id": "light.living_room"}); err != nil {
			t.Fatalf("expected discovered entity light.living_room to be allowed, got %v", err)
		}
		if _, err := p.CallServiceWithResponse(ctx, "light", "turn_off", map[string]any{"entity_id": "light.lamp"}); err != nil {
			t.Fatalf("expected hold_action target entity light.lamp to be allowed, got %v", err)
		}
		if _, err := p.CallServiceWithResponse(ctx, "script", "movie_mode", nil); err != nil {
			t.Fatalf("expected tap_action script.movie_mode to be allowed, got %v", err)
		}

		// Hydrated entities NOT on the Lovelace view remain forbidden.
		if _, err := p.CallServiceWithResponse(ctx, "lock", "unlock", map[string]any{"entity_id": "lock.front_door"}); !errors.Is(err, ErrActionForbidden) {
			t.Fatalf("expected lock.front_door to be forbidden, got %v", err)
		}
		if _, err := p.CallServiceWithResponse(ctx, "cover", "open_cover", map[string]any{"entity_id": "cover.garage"}); !errors.Is(err, ErrActionForbidden) {
			t.Fatalf("expected cover.garage to be forbidden, got %v", err)
		}
		if _, err := p.CallServiceWithResponse(ctx, "script", "unlisted_script", nil); !errors.Is(err, ErrActionForbidden) {
			t.Fatalf("expected unlisted script to be forbidden, got %v", err)
		}
	})

	t.Run("configured_domains_restriction_and_high_privilege_bare_provider", func(t *testing.T) {
		t.Parallel()
		pDomains := NewHomeAssistantProviderWithClient(srv.Client(), srv.URL, "tok")
		if err := pDomains.Init(ctx, map[string]any{
			"url":      srv.URL,
			"domains":  []string{"light"},
			"entities": []string{"light.living_room", "lock.front_door"},
		}, InitOptions{Token: "tok"}); err != nil {
			t.Fatalf("Init failed: %v", err)
		}
		if _, err := pDomains.CallServiceWithResponse(ctx, "light", "turn_on", map[string]any{"entity_id": "light.living_room"}); err != nil {
			t.Fatalf("expected configured domain light to succeed, got %v", err)
		}
		if _, err := pDomains.CallServiceWithResponse(ctx, "lock", "unlock", map[string]any{"entity_id": "lock.front_door"}); !errors.Is(err, ErrActionForbidden) {
			t.Fatalf("expected domain outside cfg.Domains to return ErrActionForbidden, got %v", err)
		}

		// Bare provider without Init/Fetch still blocks high-privilege domains.
		pBare := NewHomeAssistantProviderWithClient(srv.Client(), srv.URL, "tok")
		for _, tc := range []struct {
			domain, service, entity string
		}{
			{"lock", "unlock", "lock.front_door"},
			{"cover", "open_cover", "cover.garage"},
			{"script", "turn_on", "script.alarm_off"},
		} {
			if _, err := pBare.CallServiceWithResponse(ctx, tc.domain, tc.service, map[string]any{"entity_id": tc.entity}); !errors.Is(err, ErrActionForbidden) {
				t.Fatalf("bare provider %s.%s: got %v, want ErrActionForbidden", tc.domain, tc.service, err)
			}
		}
	})
}
