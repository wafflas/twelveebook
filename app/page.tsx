import { PostCard } from "@/components/posts/PostCard";
import { getPosts } from "@/lib/cms";
import { createMetadata, pageTitle } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: pageTitle("Home"),
});

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="bg-white p-2 text-black">
      <h1 className="mb-4 text-2xl font-bold">News Feed</h1>
      <div className="divide-y">
        {posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}
