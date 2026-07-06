import React from "react";
import Link from "next/link";
import { getPosts } from "@/lib/cms";
import { PostCard } from "@/components/posts/PostCard";
import { CommentsList } from "@/components/comments/CommentsList";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  createMetadata,
  pageTitle,
  SITE_DESCRIPTION,
} from "@/lib/metadata";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const posts = await getPosts();
  const post = posts.find((p) => p.id === id);

  return createMetadata({
    title: post
      ? pageTitle(`${post.author.name}'s Post`)
      : pageTitle("Post"),
    description: post?.content?.slice(0, 160) || SITE_DESCRIPTION,
  });
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
      <div className="mb-4 justify-start">
        <Link href="/" className="text-linkblue underline">
          Back
        </Link>
      </div>

      <div className="divide-y">
        <PostCard {...post} />
      </div>

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
