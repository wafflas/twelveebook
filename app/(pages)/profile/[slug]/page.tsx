import React from "react";
import { notFound } from "next/navigation";
import Profile from "@/components/Profile";
import { getProfiles, getPosts } from "@/lib/cms";
import { nameToSlug, formatTimestampFor2012 } from "@/lib/utils";
import { Metadata } from "next";

interface WallPost {
  author: string;
  content: string;
  timestamp: string;
  isPhoto?: boolean;
  withFriend?: string;
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

  return {
    title: profile ? ` Twelveebook | ${profile.name} ` : "Profile | Twelveebook",
    description: "0.twelveebook.com",
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const profiles = await getProfiles();

  // Find profile by slug
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
      isPhoto: false,
    }));


  return (
    <div className="min-h-screen bg-white">
      <Profile
        profile={profile}
        wallPosts={wallPosts}
        friends={profile.friends || []}
      />
    </div>
  );
}
