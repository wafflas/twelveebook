import { PostCard } from "@/components/posts/PostCard";
import { Metadata } from "next";
import { getPosts } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Twelveebook | Home",
  description: "0.twelveebook.com",
};

export default async function Home() {
 
  const posts = await getPosts(); // Contentful

  return (
    <div className="bg-white p-2 text-black">
      <h1 className="mb-4 text-2xl font-bold">News Feed</h1>
      <div className="divide-y divide-gray-100">
        {posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}
