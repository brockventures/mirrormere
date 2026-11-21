package render

import (
	"net/url"
	"strings"

	"github.com/azylman/mirrormere/internal/domain"
)

// Context encapsulates the full unified execution context exposed to widget HTML templates.
// Conforms strictly to  and .A.
type Context struct {
	ID         string           `json:"id"`
	Type       string           `json:"type"`
	Dimensions domain.Dimension `json:"dimensions"`
	Data       any              `json:"data"`
	State      string           `json:"state"`
	Timestamp  string           `json:"timestamp"`
	Config     map[string]any   `json:"config"`
	Origin     [2]int           `json:"origin"`
	Theme      string           `json:"theme"`
	Online     bool             `json:"online"`
	Assets     string           `json:"assets"`
}

// exactSensitiveKeys defines exact key names (case-insensitive) of credentials that must be omitted from template context.
var exactSensitiveKeys = map[string]struct{}{
	"token":              {},
	"secret":             {},
	"password":           {},
	"api_key":            {},
	"apikey":             {},
	"auth":               {},
	"auth_token":         {},
	"access_token":       {},
	"client_secret":      {},
	"refresh_token":      {},
	"private_key":        {},
	"credentials_file":   {},
	"client_secret_file": {},
	"album_url":          {},
}

// SanitizeConfig performs a deep clone of the widget instance custom configuration,
// omitting keys that end with "_env" (environment variable pointers) or match exact
// credential key names, and stripping userinfo/secret query parameters from URL values.
// Ordinary domain keys (e.g. "author", "show_passed", "bypass_cache",
// "compass", "max_tokens") are strictly preserved.
func SanitizeConfig(cfg map[string]any) map[string]any {
	if cfg == nil {
		return map[string]any{}
	}
	out := make(map[string]any, len(cfg))
	for k, v := range cfg {
		if isSensitiveKey(k) {
			continue
		}
		out[k] = sanitizeValue(v)
	}
	return out
}

func isSensitiveKey(key string) bool {
	lower := strings.ToLower(strings.TrimSpace(key))
	if strings.HasSuffix(lower, "_env") || lower == "_env" {
		return true
	}
	_, exact := exactSensitiveKeys[lower]
	return exact
}

func isSensitiveQueryParam(key string) bool {
	lower := strings.ToLower(strings.TrimSpace(key))
	if isSensitiveKey(lower) {
		return true
	}
	switch lower {
	case "key", "pass", "pwd", "sig", "signature", "bearer", "jwt", "api-key", "access-token", "auth-token":
		return true
	}
	for _, sub := range []string{"secret", "token", "password", "apikey", "api_key"} {
		if strings.Contains(lower, sub) {
			return true
		}
	}
	return false
}

func sanitizeStringValue(s string) string {
	if !strings.Contains(s, "://") {
		return s
	}
	u, err := url.Parse(s)
	if err != nil || u.Scheme == "" || u.Host == "" {
		return s
	}
	modified := false
	if u.User != nil {
		u.User = nil
		modified = true
	}
	if u.RawQuery != "" {
		q := u.Query()
		for k := range q {
			if isSensitiveQueryParam(k) {
				q.Del(k)
				modified = true
			}
		}
		if modified {
			u.RawQuery = q.Encode()
		}
	}
	if !modified {
		return s
	}
	return u.String()
}

func sanitizeValue(v any) any {
	switch val := v.(type) {
	case string:
		return sanitizeStringValue(val)
	case map[string]any:
		return SanitizeConfig(val)
	case []any:
		clone := make([]any, len(val))
		for i, item := range val {
			clone[i] = sanitizeValue(item)
		}
		return clone
	case []string:
		clone := make([]string, len(val))
		for i, item := range val {
			clone[i] = sanitizeStringValue(item)
		}
		return clone
	default:
		return val
	}
}
