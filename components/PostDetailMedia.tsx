"use client";

import { useState, type ReactNode } from "react";
import type { Post } from "@/lib/api/types";
import {
  facebookVideoEmbedUrl,
  getEmbedProvider,
  getYouTubeId,
  youTubeEmbedUrl,
  youTubeThumbnail,
} from "@/lib/embeds";

/**
 * The media at the top of a post's detail page.
 *
 * A post can carry a photo, a video/social link, both, or neither. When it has
 * both, the photo becomes the video's poster instead of being hidden by the
 * embed: the visitor sees the image and clicks it to play the video inline —
 * or, for Instagram (no key-free embed), to open the original post. Click-to-
 * play needs state, hence a Client Component.
 */
export function PostDetailMedia({ post }: { post: Post }) {
  const [playing, setPlaying] = useState(false);
  const provider = post.embed_url ? getEmbedProvider(post.embed_url) : null;
  const youTubeId =
    provider === "youtube" ? getYouTubeId(post.embed_url!) : null;

  if (provider === "youtube" && youTubeId) {
    if (playing) {
      return (
        <VideoBox>
          <iframe
            src={youTubeEmbedUrl(youTubeId, true)}
            title={post.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </VideoBox>
      );
    }
    return (
      <PosterButton
        // Prefer the post's own image so an uploaded photo is not hidden;
        // fall back to YouTube's thumbnail.
        poster={post.image_url ?? youTubeThumbnail(youTubeId)}
        title={post.title}
        onPlay={() => setPlaying(true)}
      />
    );
  }

  if (provider === "facebook" && post.embed_url) {
    if (playing) {
      // Black backdrop, like the homepage: Facebook's player is 16:9 and does
      // not stretch to fill, so any leftover reads as a video letterbox rather
      // than a strip of the green box.
      return (
        <VideoBox black>
          <iframe
            src={facebookVideoEmbedUrl(post.embed_url, true)}
            title={post.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </VideoBox>
      );
    }
    return (
      <PosterButton
        poster={post.image_url}
        title={post.title}
        badge="Facebook"
        onPlay={() => setPlaying(true)}
      />
    );
  }

  if (provider === "instagram" && post.embed_url) {
    return (
      <a
        href={post.embed_url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${BOX} group block bg-mist`}
      >
        <Poster imageUrl={post.image_url} alt={post.title} />
        <CenterGlyph>
          <ExternalLinkIcon />
        </CenterGlyph>
        <Badge label="Instagram" />
      </a>
    );
  }

  // Photo only: show it at its natural height (no crop), as the page did before.
  if (post.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={post.image_url}
        alt={post.title}
        className="mt-6 w-full rounded-2xl bg-mist"
      />
    );
  }

  return null;
}

const BOX = "relative mt-6 aspect-video overflow-hidden rounded-2xl";

function VideoBox({
  children,
  black = false,
}: {
  children: ReactNode;
  black?: boolean;
}) {
  return <div className={`${BOX} ${black ? "bg-black" : "bg-mist"}`}>{children}</div>;
}

function PosterButton({
  poster,
  title,
  badge,
  onPlay,
}: {
  poster: string | null;
  title: string;
  badge?: string;
  onPlay: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`Reproduzir vídeo: ${title}`}
      className={`${BOX} group block w-full bg-mist`}
    >
      <Poster imageUrl={poster} alt="" />
      <CenterGlyph>
        <PlayIcon />
      </CenterGlyph>
      {badge && <Badge label={badge} />}
    </button>
  );
}

/** Fills the box with the poster image, or a leaf placeholder if unset. */
function Poster({ imageUrl, alt }: { imageUrl: string | null; alt: string }) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center">
      <LeafIcon />
    </div>
  );
}

/** Centers an icon (play / external-link) over the box. */
function CenterGlyph({ children }: { children: ReactNode }) {
  return (
    <span className="absolute inset-0 flex items-center justify-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition group-hover:scale-105">
        {children}
      </span>
    </span>
  );
}

/** Small pill naming the source platform. */
function Badge({ label }: { label: string }) {
  return (
    <span className="absolute bottom-3 left-3 z-10 rounded-full border border-line bg-white/85 px-2.5 py-1 text-xs font-semibold text-ink-soft">
      {label}
    </span>
  );
}

function PlayIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="ml-1 text-primary"
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
      aria-hidden="true"
    >
      <path d="M14 4h6v6" />
      <path d="M20 4L11 13" />
      <path d="M19 14v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </svg>
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
