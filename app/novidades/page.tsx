// News listing: every post as a card, newest first (the API already returns
// them in that order). Server Component — no client state needed.
import type { Metadata } from "next";
import { getPosts } from "@/lib/api/queries";
import { PostCard } from "@/components/PostCard";

export const metadata: Metadata = {
  title: "Novidades · AgroMoreira's",
};

export default async function NovidadesPage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold">Novidades</h1>
      <p className="mt-2 text-ink-soft">
        As últimas notícias, campanhas e novidades das nossas lojas.
      </p>

      {posts.length > 0 ? (
        // Capped card width, as many columns as fit — same idea as the product
        // grids, so cards never stretch too wide on large screens.
        <div className="mt-8 grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-ink-soft">Ainda não há novidades publicadas.</p>
      )}
    </div>
  );
}
