import Link from "next/link";
import type { Post } from "@/lib/api/types";
import { getEmbedProvider, getYouTubeId, youTubeThumbnail } from "@/lib/embeds";
import { formatDate } from "@/lib/format";

/**
 * A news post in the /novidades grid: a media thumbnail (the post image, or a
 * YouTube thumbnail for video posts), the date, title and a short excerpt.
 * The whole card links to the post's detail page.
 */
export function PostCard({ post }: { post: Post }) {
  const provider = post.embed_url ? getEmbedProvider(post.embed_url) : null;
  const youTubeId =
    provider === "youtube" ? getYouTubeId(post.embed_url!) : null;
  const thumbnail = youTubeId ? youTubeThumbnail(youTubeId) : post.image_url;
  const isVideo = provider === "youtube" || provider === "facebook";
  const hasMedia = Boolean(thumbnail) || provider !== null;

  // A text-only post has no thumbnail to head the card, so instead of a leaf
  // placeholder the whole card becomes a centred, tinted text card — it reads
  // as intentional and lets the excerpt run longer. Grid `align-items: stretch`
  // keeps it the same height as the media cards beside it.
  if (!hasMedia) {
    return (
      <Link
        href={`/novidades/${post.id}`}
        className="group flex min-h-[16rem] flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-mist p-6 text-center transition hover:-translate-y-1 hover:shadow-lg"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
          {formatDate(post.created_at)}
        </p>
        <h3 className="text-lg font-bold leading-tight">{post.title}</h3>
        {post.text && (
          <p className="line-clamp-4 text-sm text-ink-soft">{post.text}</p>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={`/novidades/${post.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-video bg-mist">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <LeafIcon />
          </div>
        )}

        {isVideo && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-md transition group-hover:scale-105">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="ml-0.5 text-primary"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        )}

        {(provider === "facebook" || provider === "instagram") && (
          <span className="absolute bottom-2 left-2 rounded-full border border-line bg-white/85 px-2 py-0.5 text-xs font-semibold text-ink-soft">
            {provider === "facebook" ? "Facebook" : "Instagram"}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
          {formatDate(post.created_at)}
        </p>
        <h3 className="text-base font-bold leading-tight">{post.title}</h3>
        {post.text && (
          <p className="line-clamp-2 text-sm text-ink-soft">{post.text}</p>
        )}
      </div>
    </Link>
  );
}

function LeafIcon() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-1/5 text-primary/25"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M50 8C30 20 18 40 22 66c2 14 12 24 26 26 0-24-2-44-14-60 18 10 30 28 30 52 14-6 22-22 20-40C102 30 78 14 50 8Z" />
    </svg>
  );
}
