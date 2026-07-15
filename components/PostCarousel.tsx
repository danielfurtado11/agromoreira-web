"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import type { Post } from "@/lib/api/types";
import { getYouTubeId, youTubeEmbedUrl, youTubeThumbnail } from "@/lib/embeds";
import { formatDate } from "@/lib/format";

const DRAG_THRESHOLD = 60; // px needed to move to the next/previous slide
const AUTOPLAY_MS = 20000; // auto-advance every 20s, unless paused

/**
 * Rotating showcase of the latest posts. One post is shown at a time; arrows,
 * dots, or dragging sideways (mouse or touch) move between them. A post with a
 * YouTube video plays inline when clicked; any other post links to its page
 * under /novidades.
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
  // carousel, or watching a video, so it never interrupts an interaction.
  const paused = isDragging || isHovering || playingId !== null;

  useEffect(() => {
    if (count < 2 || paused) return;
    const timer = setTimeout(() => {
      setPlayingId(null);
      setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [count, paused, index]);

  function goTo(next: number) {
    setPlayingId(null); // stop any playing video when the slide changes
    setIndex(((next % count) + count) % count);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (count < 2) return;
    dragStartX.current = event.clientX;
    didDrag.current = false;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragStartX.current === null) return;
    const dx = event.clientX - dragStartX.current;
    if (Math.abs(dx) > 5) didDrag.current = true;
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
          {posts.map((post, i) => (
            <button
              key={post.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir para a publicação ${i + 1}`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-primary" : "w-2 bg-line hover:bg-ink-soft"
              }`}
            />
          ))}
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
  const youTubeId = post.embed_url ? getYouTubeId(post.embed_url) : null;
  const href = `/novidades/${post.id}`;

  return (
    <article className="flex w-full shrink-0 flex-col items-center gap-6 md:flex-row md:gap-10">
      <div className="w-full md:w-[55%]">
        <PostMedia
          post={post}
          href={href}
          youTubeId={youTubeId}
          playing={playing}
          onPlay={onPlay}
        />
      </div>
      <div className="w-full md:w-[45%]">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
          {formatDate(post.created_at)} · Novidades
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
  youTubeId,
  playing,
  onPlay,
}: {
  post: Post;
  href: string;
  youTubeId: string | null;
  playing: boolean;
  onPlay: () => void;
}) {
  // A YouTube post already playing: show the player.
  if (youTubeId && playing) {
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

  // A YouTube post not yet playing: thumbnail with a play button.
  if (youTubeId) {
    return (
      <button
        type="button"
        onClick={onPlay}
        aria-label={`Reproduzir vídeo: ${post.title}`}
        className={`${MEDIA_BOX} group block w-full`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={youTubeThumbnail(youTubeId)}
          alt=""
          draggable={false}
          className="h-full w-full object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition group-hover:scale-105">
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
          </span>
        </span>
      </button>
    );
  }

  // A post with a photo: the image links to the post's page.
  if (post.image_url) {
    return (
      <Link href={href} className={`${MEDIA_BOX} block`} draggable={false}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.image_url}
          alt={post.title}
          draggable={false}
          className="h-full w-full object-cover"
        />
      </Link>
    );
  }

  // A text-only post: a plain placeholder that links to the post's page.
  return (
    <Link href={href} className={`${MEDIA_BOX} flex items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        className="w-1/4 text-primary/25"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M50 8C30 20 18 40 22 66c2 14 12 24 26 26 0-24-2-44-14-60 18 10 30 28 30 52 14-6 22-22 20-40C102 30 78 14 50 8Z" />
      </svg>
    </Link>
  );
}
