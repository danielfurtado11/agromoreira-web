// News post detail. Server Component: loads one post and renders its media
// (embedded YouTube/Facebook video, image, or an Instagram link) plus the
// text. A missing/invalid id shows the 404 page.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getPost } from "@/lib/api/queries";
import type { Post } from "@/lib/api/types";
import {
  facebookVideoEmbedUrl,
  getEmbedProvider,
  getYouTubeId,
  youTubeEmbedUrl,
} from "@/lib/embeds";
import { formatDate } from "@/lib/format";

type Params = Promise<{ id: string }>;

/** Loads the post, turning an invalid id or a 404 into Next's notFound(). */
async function loadPost(id: string) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  try {
    return await getPost(numericId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await loadPost(id);
  return { title: `${post.title} · Novidades · AgroMoreira's` };
}

export default async function NovidadePage({ params }: { params: Params }) {
  const { id } = await params;
  const post = await loadPost(id);

  return (
    <article className="mx-auto w-full max-w-[820px] px-6 py-10">
      <Link
        href="/novidades"
        className="group relative inline-block text-sm font-medium text-ink-soft transition hover:text-primary"
      >
        Voltar às novidades
        <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-hover:w-full" />
      </Link>

      <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-ink-soft">
        {formatDate(post.created_at)}
      </p>
      <h1 className="mt-2 text-4xl font-bold leading-tight">{post.title}</h1>

      <PostMedia post={post} />

      {post.text && (
        <div className="mt-6 whitespace-pre-line leading-relaxed text-ink-soft">
          {post.text}
        </div>
      )}
    </article>
  );
}

/** The post's media: embedded video, image, Instagram link, or nothing. */
function PostMedia({ post }: { post: Post }) {
  const provider = post.embed_url ? getEmbedProvider(post.embed_url) : null;

  if (provider === "youtube") {
    const videoId = getYouTubeId(post.embed_url!);
    if (videoId) {
      return (
        <div className="relative mt-6 aspect-video overflow-hidden rounded-2xl bg-mist">
          <iframe
            src={youTubeEmbedUrl(videoId)}
            title={post.title}
            allow="encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      );
    }
  }

  if (provider === "facebook") {
    return (
      <div className="relative mt-6 aspect-video overflow-hidden rounded-2xl bg-mist">
        <iframe
          src={facebookVideoEmbedUrl(post.embed_url!)}
          title={post.title}
          allow="encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  // Instagram cannot be embedded without an API key, so link out to the post.
  if (provider === "instagram") {
    return (
      <a
        href={post.embed_url!}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-line bg-mist px-6 py-10 text-sm font-semibold text-primary transition hover:border-primary"
      >
        Ver publicação no Instagram
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 4h6v6" />
          <path d="M20 4L11 13" />
          <path d="M19 14v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
        </svg>
      </a>
    );
  }

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
