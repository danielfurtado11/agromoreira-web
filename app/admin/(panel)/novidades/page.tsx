import { getAdminPosts } from "@/lib/api/admin";
import { PostsManager } from "./PostsManager";

/** `?novo` (from the public site's "+" card) opens the create window on load. */
type SearchParams = Promise<{ novo?: string }>;

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { novo } = await searchParams;

  // Hidden posts must be listed here, or a draft switched off would vanish
  // with no way back — hence getAdminPosts (include_inactive, token-guarded).
  const posts = await getAdminPosts();

  return (
    <div className="max-w-3xl">
      <PostsManager posts={posts} initialCreate={novo != null} />
    </div>
  );
}
