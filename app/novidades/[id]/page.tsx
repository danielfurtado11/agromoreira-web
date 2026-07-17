// News post detail. Server Component: loads one post and renders its media
// (embedded YouTube/Facebook video, image, or an Instagram link) plus the
// text. A missing/invalid id shows the 404 page.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getPost } from "@/lib/api/queries";
import { PostDetailMedia } from "@/components/PostDetailMedia";
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

      <PostDetailMedia post={post} />

      {post.text && (
        <div className="mt-6 whitespace-pre-line leading-relaxed text-ink-soft">
          {post.text}
        </div>
      )}
    </article>
  );
}
