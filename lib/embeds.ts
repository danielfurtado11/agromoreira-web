// Helpers for rendering embedded media from a post's `embed_url`. The backend
// stores the original share URL (YouTube / Instagram / Facebook); here we derive
// what the front-end needs to display it.
//
// YouTube and Facebook videos play inline: both can be embedded without an
// API key (YouTube's iframe player, Facebook's public video plugin).
// Instagram removed key-free embedding in 2020, so an Instagram post instead
// links out to the original, opened in a new tab.

export type EmbedProvider = "youtube" | "facebook" | "instagram" | null;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);

const FACEBOOK_HOSTS = new Set([
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "fb.watch",
]);

const INSTAGRAM_HOSTS = new Set(["instagram.com", "www.instagram.com"]);

/** Identifies which platform a post's `embed_url` points to, if any. */
export function getEmbedProvider(url: string): EmbedProvider {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  if (YOUTUBE_HOSTS.has(host)) return "youtube";
  if (FACEBOOK_HOSTS.has(host)) return "facebook";
  if (INSTAGRAM_HOSTS.has(host)) return "instagram";
  return null;
}

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

/** Autoplaying embeddable player URL for a public Facebook video post. */
export function facebookVideoEmbedUrl(url: string): string {
  const params = new URLSearchParams({
    href: url,
    show_text: "false",
    autoplay: "true",
  });
  return `https://www.facebook.com/plugins/video.php?${params.toString()}`;
}
