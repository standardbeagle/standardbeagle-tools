package handlers

// HTTP header keys used across the handlers package. Compile-time constants;
// no runtime state, no I/O, no callers that propagate risk.
//
// @risk b.d.s.r.u.  tagged:2026-04-21  model:haiku  conf:0.97
const (
	HeaderContentType = "Content-Type"
	HeaderRequestID   = "X-Request-Id"
	HeaderAuth        = "Authorization"
	HeaderRateLimit   = "X-RateLimit-Remaining"
)

// MIMEJSON is the canonical JSON content-type.
//
// @risk b.d.s.r.u.  tagged:2026-04-21  model:haiku  conf:0.97
const MIMEJSON = "application/json"
