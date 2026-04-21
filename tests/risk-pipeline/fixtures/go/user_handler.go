package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
)

// UserStore is the public entry point for user profile reads — high blast
// surface since every route on /api/users/* depends on it.
//
// @risk b!d.s-r.u-  tagged:2026-04-21  model:sonnet  conf:0.82
// @risk-why "Public entry point, 40+ callers across routes + jobs."
type UserStore interface {
	GetByID(id string) (*User, error)
	List(filter string) ([]*User, error)
}

// User is the wire-format profile record.
type User struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

// HandleGetUser returns a user by id as JSON. Central HTTP handler; touched
// by every change to user-profile routing.
//
// @risk b+d.s-r.u.  tagged:2026-04-21  model:haiku  conf:0.86
func HandleGetUser(store UserStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := strings.TrimPrefix(r.URL.Path, "/api/users/")
		if id == "" {
			http.Error(w, "id required", http.StatusBadRequest)
			return
		}
		u, err := store.GetByID(id)
		if err != nil {
			http.Error(w, "not found", http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(u)
	}
}
