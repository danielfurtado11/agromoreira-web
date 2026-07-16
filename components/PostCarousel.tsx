"use client";

import Link from "next/link";
import {
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import type { Post } from "@/lib/api/types";
import {
  facebookVideoEmbedUrl,
  getEmbedProvider,
  getYouTubeId,
  youTubeEmbedUrl,
  youTubeThumbnail,
  type EmbedProvider,
} from "@/lib/embeds";
import { formatDate } from "@/lib/format";

const DRAG_THRESHOLD = 60; // px needed to move to the next/previous slide
const CLICK_JITTER_THRESHOLD = 15; // px of movement still treated as a click, not a drag
const AUTOPLAY_MS = 5000; // auto-advance every 5s, unless paused

/**
 * Rotating showcase of the latest posts. One post is shown at a time; arrows,
 * dots, or dragging sideways (mouse or touch) move between them. YouTube and
 * Facebook videos play inline when clicked; Instagram opens the original post
 * in a new tab; any other post links to its page under /novidades.
 */
export function PostCarousel({ posts }: { posts: Post[] }) {
  const [index, setIndex] = useState(0);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [dragDx, setDragDx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const didDrag = useRef(false);

  const count = posts.length;

  // Auto-advance is paused while the visitor is dragging, hovering over the
  // carousel, or watching a video, so it never interrupts an interaction. The
  // advance itself is driven by the active progress bar's animation (see the
  // dots below): when the bar finishes filling, it moves to the next slide.
  const paused = isDragging || isHovering || playingId !== null;

  function goTo(next: number) {
    setPlayingId(null); // stop any playing video when the slide changes
    setIndex(((next % count) + count) % count);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (count < 2) return;
    dragStartX.current = event.clientX;
    didDrag.current = false;
    setIsDragging(true);
    // Pointer capture is NOT taken here. Capturing immediately would
    // redirect the eventual click (and mouse events) to this wrapper for
    // every press, even a plain click on a child button — so a tap on the
    // video's play button would never reach it. It is taken lazily, below,
    // only once real drag movement is confirmed.
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragStartX.current === null) return;
    const dx = event.clientX - dragStartX.current;
    if (!didDrag.current && Math.abs(dx) > CLICK_JITTER_THRESHOLD) {
      didDrag.current = true;
      // Now that this is a confirmed drag, capture the pointer so move/up
      // keep being reported to this element even if the cursor leaves it
      // (e.g. a fast swipe past the carousel's edge).
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setDragDx(dx);
  }

  function onPointerUp() {
    if (dragStartX.current === null) return;
    const dx = dragDx;
    dragStartX.current = null;
    setIsDragging(false);
    setDragDx(0);
    if (dx <= -DRAG_THRESHOLD) goTo(index + 1);
    else if (dx >= DRAG_THRESHOLD) goTo(index - 1);
  }

  // Swallow the click that ends a drag, so it does not open a link or play a
  // video that the visitor was only sliding past.
  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (didDrag.current) {
      event.preventDefault();
      event.stopPropagation();
      didDrag.current = false;
    }
  }

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Arrows sit in the side gutters, flanking the content in their own
          columns so they never overlap it. Hidden on small screens, where
          dragging is the way to move between slides. */}
      <div className="flex items-center gap-1 sm:gap-4">
        {count > 1 && (
          <CarouselArrow direction="prev" onClick={() => goTo(index - 1)} />
        )}

        <div
          className="flex-1 overflow-hidden"
          style={{ touchAction: "pan-y" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClickCapture={onClickCapture}
        >
          <div
            className={`flex select-none ${
              count > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
            } ${isDragging ? "" : "transition-transform duration-500 ease-out"}`}
            style={{ transform: `translateX(calc(-${index * 100}% + ${dragDx}px))` }}
          >
            {posts.map((post) => (
              <PostSlide
                key={post.id}
                post={post}
                playing={playingId === post.id}
                onPlay={() => setPlayingId(post.id)}
              />
            ))}
          </div>
        </div>

        {count > 1 && (
          <CarouselArrow direction="next" onClick={() => goTo(index + 1)} />
        )}
      </div>

      {count > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {posts.map((post, i) => {
            const active = i === index;
            return (
              <button
                key={post.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir para a publicação ${i + 1}`}
                aria-current={active}
                className={`h-2 overflow-hidden rounded-full transition-all ${
                  active ? "w-10 bg-primary/20" : "w-2 bg-line hover:bg-ink-soft"
                }`}
              >
                {active && (
                  // The fill animates from empty to full over AUTOPLAY_MS.
                  // `key={index}` remounts it on every slide change so it
                  // restarts; when it finishes, it advances the carousel.
                  <span
                    key={index}
                    onAnimationEnd={() => goTo(index + 1)}
                    style={{
                      animationDuration: `${AUTOPLAY_MS}ms`,
                      animationPlayState: paused ? "paused" : "running",
                    }}
                    className="carousel-progress block h-full w-full rounded-full bg-primary"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CarouselArrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? "Publicação anterior" : "Publicação seguinte"}
      className="hidden shrink-0 items-center justify-center p-2 text-ink-soft transition hover:text-primary sm:flex"
    >
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={isPrev ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}

function PostSlide({
  post,
  playing,
  onPlay,
}: {
  post: Post;
  playing: boolean;
  onPlay: () => void;
}) {
  const provider = post.embed_url ? getEmbedProvider(post.embed_url) : null;
  const youTubeId =
    provider === "youtube" ? getYouTubeId(post.embed_url!) : null;
  const href = `/novidades/${post.id}`;

  return (
    <article className="flex w-full shrink-0 flex-col items-center gap-6 md:flex-row md:gap-10">
      <div className="w-full md:w-[55%]">
        <PostMedia
          post={post}
          href={href}
          provider={provider}
          youTubeId={youTubeId}
          playing={playing}
          onPlay={onPlay}
        />
      </div>
      <div className="w-full md:w-[45%]">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
          {formatDate(post.created_at)}
        </p>
        <h2 className="mt-2 text-2xl font-bold leading-tight md:text-3xl">
          <Link href={href} className="transition hover:text-primary" draggable={false}>
            {post.title}
          </Link>
        </h2>
        {post.text && <p className="mt-3 text-ink-soft">{post.text}</p>}
      </div>
    </article>
  );
}

const MEDIA_BOX = "relative aspect-[16/10] overflow-hidden rounded-2xl bg-mist";

function PostMedia({
  post,
  href,
  provider,
  youTubeId,
  playing,
  onPlay,
}: {
  post: Post;
  href: string;
  provider: EmbedProvider;
  youTubeId: string | null;
  playing: boolean;
  onPlay: () => void;
}) {
  // YouTube: known thumbnail API, so the poster needs no image from the post.
  if (provider === "youtube" && youTubeId) {
    if (playing) {
      return (
        <div className={MEDIA_BOX}>
          <iframe
            src={youTubeEmbedUrl(youTubeId)}
            title={post.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={onPlay}
        aria-label={`Reproduzir vídeo: ${post.title}`}
        className={`${MEDIA_BOX} group block w-full`}
      >
        <MediaPoster imageUrl={youTubeThumbnail(youTubeId)} />
        <CenterGlyph>
          <PlayIcon />
        </CenterGlyph>
      </button>
    );
  }

  // Facebook: public videos also embed without an API key, but there is no
  // thumbnail API like YouTube's, so the post's own image (if set) is used
  // as the poster instead — a badge marks it as a Facebook video either way.
  if (provider === "facebook" && post.embed_url) {
    if (playing) {
      return (
        <div className={MEDIA_BOX}>
          <iframe
            src={facebookVideoEmbedUrl(post.embed_url)}
            title={post.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={onPlay}
        aria-label={`Reproduzir vídeo: ${post.title}`}
        className={`${MEDIA_BOX} group block w-full`}
      >
        <MediaPoster imageUrl={post.image_url} />
        <CenterGlyph>
          <PlayIcon />
        </CenterGlyph>
        <ProviderBadge label="Facebook" />
      </button>
    );
  }

  // Instagram dropped key-free embedding, so this links out to the original
  // post in a new tab instead of trying to play it in place.
  if (provider === "instagram" && post.embed_url) {
    return (
      <a
        href={post.embed_url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${MEDIA_BOX} group block w-full`}
      >
        <MediaPoster imageUrl={post.image_url} />
        <CenterGlyph>
          <ExternalLinkIcon />
        </CenterGlyph>
        <ProviderBadge label="Instagram" />
      </a>
    );
  }

  // A post with a photo (no video): the image links to the post's page.
  if (post.image_url) {
    return (
      <Link href={href} className={`${MEDIA_BOX} block`} draggable={false}>
        <MediaPoster imageUrl={post.image_url} alt={post.title} />
      </Link>
    );
  }

  // A text-only post: a plain placeholder that links to the post's page.
  return (
    <Link href={href} className={`${MEDIA_BOX} flex items-center justify-center`}>
      <LeafIcon />
    </Link>
  );
}

/** Fills the media box with the post's image, or a leaf placeholder if unset. */
function MediaPoster({
  imageUrl,
  alt = "",
}: {
  imageUrl: string | null;
  alt?: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={alt}
        draggable={false}
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center">
      <LeafIcon />
    </div>
  );
}

/** Centers an icon button (play / external-link) over the media box. */
function CenterGlyph({ children }: { children: ReactNode }) {
  return (
    <span className="absolute inset-0 flex items-center justify-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition group-hover:scale-105">
        {children}
      </span>
    </span>
  );
}

/** Small pill naming the source platform, for embeds without a native thumbnail. */
function ProviderBadge({ label }: { label: string }) {
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
      className="w-1/4 text-primary/25"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M50 8C30 20 18 40 22 66c2 14 12 24 26 26 0-24-2-44-14-60 18 10 30 28 30 52 14-6 22-22 20-40C102 30 78 14 50 8Z" />
    </svg>
  );
}
