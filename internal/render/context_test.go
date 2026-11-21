package render_test

import (
	"reflect"
	"testing"

	"github.com/azylman/mirrormere/internal/render"
)

func TestSanitizeConfig_ExpandedSensitiveKeys(t *testing.T) {
	t.Parallel()

	input := map[string]any{
		"title":              "Dashboard",
		"client_secret":      "oauth-client-secret",
		"refresh_token":      "oauth-refresh-token",
		"private_key":        "-----BEGIN PRIVATE KEY-----",
		"credentials_file":   "/secrets/creds.json",
		"client_secret_file": "/secrets/client_secret.json",
		"album_url":          "https://photos.app.goo.gl/unlisted-secret",
		"CLIENT_SECRET":      "uppercase-secret",
		"ALBUM_URL":          "https://photos.app.goo.gl/upper",
		"nested": map[string]any{
			"safe":             "value",
			"refresh_token":    "nested-refresh",
			"credentials_file": "/secrets/nested.json",
			"album_url":        "https://photos.app.goo.gl/nested",
		},
	}

	got := render.SanitizeConfig(input)
	if got["title"] != "Dashboard" {
		t.Fatalf("expected title preserved, got %v", got["title"])
	}
	for _, sensitive := range []string{
		"client_secret", "refresh_token", "private_key",
		"credentials_file", "client_secret_file", "album_url",
		"CLIENT_SECRET", "ALBUM_URL",
	} {
		if _, exists := got[sensitive]; exists {
			t.Errorf("sensitive key %q was not stripped", sensitive)
		}
	}

	nested, ok := got["nested"].(map[string]any)
	if !ok {
		t.Fatalf("expected nested map, got %T", got["nested"])
	}
	if nested["safe"] != "value" {
		t.Errorf("expected nested safe key preserved, got %v", nested["safe"])
	}
	for _, sensitive := range []string{"refresh_token", "credentials_file", "album_url"} {
		if _, exists := nested[sensitive]; exists {
			t.Errorf("nested sensitive key %q was not stripped", sensitive)
		}
	}
}

func TestSanitizeConfig_URLSecretsAndUserinfo(t *testing.T) {
	t.Parallel()

	input := map[string]any{
		"userinfo_only":    "https://alice:s3cr3t@cal.example.com/feed.ics",
		"rtsp_userinfo":    "rtsp://admin:pass123@198.51.100.10:554/stream1",
		"query_key":        "https://cal.example.com/feed.ics?key=secret-key&tz=UTC",
		"query_token":      "https://api.example.com/data?access_token=tok123&api_key=k456&custom_secret=abc&sig=deadbeef&units=metric",
		"query_only_sec":   "https://api.example.com/data?token=onlysecret",
		"combined":         "https://user:pw@api.example.com/v1?refresh_token=rt&city=London",
		"benign_url":       "https://api.example.com/v1/weather?lat=37.8&lon=-122.2",
		"plain_text":       "Author: J.R.R. Tolkien",
		"malformed_url":    "http://[::1]:namedport/path?token=abc",
		"missing_host_url": "mailto://",
		"url_list": []string{
			"https://u:p@cal.example.com/a.ics?key=abc",
			"https://cal.example.com/public.ics?view=week",
		},
		"any_list": []any{
			"https://u:p@example.com/item?password=xyz",
			42,
		},
	}

	got := render.SanitizeConfig(input)

	wantStrings := map[string]string{
		"userinfo_only":    "https://cal.example.com/feed.ics",
		"rtsp_userinfo":    "rtsp://198.51.100.10:554/stream1",
		"query_key":        "https://cal.example.com/feed.ics?tz=UTC",
		"query_token":      "https://api.example.com/data?units=metric",
		"query_only_sec":   "https://api.example.com/data",
		"combined":         "https://api.example.com/v1?city=London",
		"benign_url":       "https://api.example.com/v1/weather?lat=37.8&lon=-122.2",
		"plain_text":       "Author: J.R.R. Tolkien",
		"malformed_url":    "http://[::1]:namedport/path?token=abc",
		"missing_host_url": "mailto://",
	}
	for k, want := range wantStrings {
		if got[k] != want {
			t.Errorf("key %q = %q, want %q", k, got[k], want)
		}
	}

	wantList := []string{
		"https://cal.example.com/a.ics",
		"https://cal.example.com/public.ics?view=week",
	}
	if !reflect.DeepEqual(got["url_list"], wantList) {
		t.Errorf("url_list = %#v, want %#v", got["url_list"], wantList)
	}

	wantAny := []any{
		"https://example.com/item",
		42,
	}
	if !reflect.DeepEqual(got["any_list"], wantAny) {
		t.Errorf("any_list = %#v, want %#v", got["any_list"], wantAny)
	}
}
