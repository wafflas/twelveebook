import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProfileLayout } from "@/components/profiles/ProfileLayout";
import { getProfiles, getPosts } from "@/lib/cms";
import { nameToSlug, formatTimestampFor2012 } from "@/lib/utils";
import { createMetadata, pageTitle, SITE_DESCRIPTION } from "@/lib/metadata";

export const dynamic = "force-dynamic";

interface WallPost {
  author: string;
  content: string;
  timestamp: string;
  isPhoto?: boolean;
  taggedPeople?: { name: string }[];
  location?: string;
}

interface ProfilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const profiles = await getProfiles();
  const profile = profiles.find((p) => nameToSlug(p.name) === slug);

  return createMetadata({
    title: profile ? pageTitle(profile.name) : pageTitle("Profile"),
    description: profile?.quotes?.slice(0, 160) || SITE_DESCRIPTION,
  });
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const profiles = await getProfiles();

  const profile = profiles.find((p) => nameToSlug(p.name) === slug);

  if (!profile) {
    notFound();
  }

  // Fetch all posts and filter for this profile's wall
  const allPosts = await getPosts();
  const wallPosts: WallPost[] = allPosts
    .filter((post) => nameToSlug(post.author.name) === slug)
    .map((post) => ({
      author: post.author.name,
      content: post.content,
      timestamp: formatTimestampFor2012(post.timestamp),
      isPhoto: Boolean(post.photoUrl),
      taggedPeople: post.taggedPeople,
      location: post.location,
    }));

  return (
    <ProfileLayout
      profile={profile}
      wallPosts={wallPosts}
      friends={profile.friends || []}
    />
  );
}
