import React from "react";
import Link from "next/link";
import { getPosts } from "@/lib/cms";
import { PostCard } from "@/components/posts/PostCard";
import { CommentsList } from "@/components/comments/CommentsList";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch all posts and find the one with matching ID
  const posts = await getPosts();
  const post = posts.find((p) => p.id === id);

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-white p-2 text-black">
      {/* Back button */}
      <div className="mb-4 justify-start">
        <Link href="/" className="text-linkblue underline">
          Back
        </Link>
      </div>

      {/* Post */}
      <div className="divide-y divide-gray-100">
        <PostCard {...post} />
      </div>

      {/* Comments Section */}
      <div className="border-gray-200 pt-4">
        <CommentsList
          postId={post.id}
          comments={post.commentsData || []}
          commentsCount={post.comments || 0}
        />
      </div>
    </div>
  );
}
