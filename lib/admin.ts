/**
 * What every admin Server Action reports back: an error message to show, or
 * nothing at all on success.
 *
 * Kept in its own module (with no imports) so both the "use server" action
 * files and the client components can share it.
 */
export type ActionResult = { error?: string };
