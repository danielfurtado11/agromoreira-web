// Session constants, shared by the middleware, the login/logout actions and
// the admin pages.
//
// This module is deliberately free of `next/headers` (and any other Node-only
// import): the middleware runs in the Edge runtime and imports SESSION_COOKIE
// from here, so pulling server-only APIs in would break it.

/**
 * Name of the httpOnly cookie holding the admin's JWT. httpOnly means the
 * browser's JavaScript cannot read it, so an XSS flaw cannot steal the token —
 * unlike localStorage.
 */
export const SESSION_COOKIE = "agromoreira_session";

/** Kept in step with the API's ACCESS_TOKEN_EXPIRE_MINUTES (8 hours). */
export const SESSION_MAX_AGE = 8 * 60 * 60;

/** The private admin area's entry point. Never linked from the public site. */
export const LOGIN_PATH = "/admin/login";
export const ADMIN_HOME = "/admin";
