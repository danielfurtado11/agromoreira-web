// Helpers for rendering embedded media from a post's `embed_url`. The backend
// stores the original share URL (YouTube / Instagram / Facebook); here we derive
// what the front-end needs to display it. YouTube is handled inline; other
// providers fall back to opening the post's page.

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);

/** Returns the YouTube video id from a watch/share URL, or null if not YouTube. */
export function getYouTubeId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) return null;

  // youtu.be/<id> puts the id in the path; youtube.com/watch?v=<id> in a query.
  if (host === "youtu.be") return parsed.pathname.slice(1) || null;
  return parsed.searchParams.get("v");
}

/** Preview thumbnail image for a YouTube video id. */
export function youTubeThumbnail(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

/** Autoplaying embeddable player URL for a YouTube video id. */
export function youTubeEmbedUrl(id: string): string {
  return `https://www.youtube.com/embed/${id}?autoplay=1`;
}
