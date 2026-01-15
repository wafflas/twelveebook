"use client";

import React from "react";
import { nameToSlug } from "@/lib/utils";
import { Profile as ProfileType } from "@/types/Profile";
import { klavika } from "@/app/fonts";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileActions } from "./ProfileActions";
import { ProfileInfo } from "./ProfileInfo";
import { ProfileInterests } from "./ProfileInterests";
import { ProfileWall } from "./ProfileWall";
import { ProfileFriends } from "./ProfileFriends";

interface Friend {
  name: string;
  avatarUrl: string;
}

interface WallPost {
  author: string;
  content: string;
  timestamp: string;
  isPhoto?: boolean;
  taggedPeople?: { name: string }[];
  location?: string;
}

interface ProfileLayoutProps {
  profile: ProfileType;
  wallPosts?: WallPost[];
  friends?: Friend[];
}

export function ProfileLayout({
  profile,
  wallPosts = [],
  friends = [],
}: ProfileLayoutProps) {
  const firstName = profile.name.split(" ")[0];
  const displayFriends = friends.length > 0 ? friends : profile.friends || [];
  const isOwner = nameToSlug(profile.name).toLowerCase() === "twelvee";

  return (
    <div className="bg-white p-2 text-black">
      <div className="mb-6 flex gap-6">
        <div className="flex-shrink-0">
          <ProfileHeader name={profile.name} avatarUrl={profile.avatar} />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className={`text-2xl font-bold ${klavika.className}`}>
            {profile.name}
          </h1>
          <ProfileActions
            isOwner={isOwner}
            firstName={firstName}
            friendsCount={displayFriends.length}
          />
        </div>
      </div>

      <ProfileInfo
        birthday="12/10/2003" //{profile.birthday}
        city={profile.city}
        relationshipStatus={profile.relationshipStatus}
        education={profile.education}
        work={profile.work}
      />

      <ProfileInterests
        music={profile.music}
        movies={profile.movies}
        quotes={profile.quotes}
      />

      <ProfileWall wallPosts={wallPosts} />

      <ProfileFriends friends={displayFriends} />
    </div>
  );
}
