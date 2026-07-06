import type { Metadata } from "next";
import { PostManager } from "@/components/admin/PostManager";
import { getAllPosts } from "@/lib/data";

export const metadata: Metadata = { title: "Posts" };

export default async function AdminPostsPage() {
  const posts = await getAllPosts();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl text-ink">Posts</h1>
        <p className="mt-2 max-w-lg text-ink-soft">
          Posts power the homepage carousel, the announcements section, wing
          pages, and the member portal. Each post can appear in several places.
        </p>
      </div>
      <PostManager posts={posts} />
    </div>
  );
}
