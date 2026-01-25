import React from "react";
import Image from "next/image";
import Link from "next/link";
import { nameToSlug } from "@/lib/utils";

interface Friend {
  name: string;
  avatarUrl: string;
}

interface ProfileFriendsProps {
  friends: Friend[];
}

export function ProfileFriends({ friends }: ProfileFriendsProps) {
  if (friends.length === 0) {
    return null;
  }

  return (
    <div className="border-gray-200 pt-6">
      <h3 className="text-lg font-bold">Friends({friends.length})</h3>
      <div className="flex flex-wrap gap-2 p-1">
        {friends.map((friend, index) => (
          <Link
            key={index}
            href={`/profile/${nameToSlug(friend.name)}`}
            className="block w-[86px]"
            prefetch={true}
          >
            <div className="flex flex-col items-center text-center transition-opacity hover:opacity-80">
              <Image
                src={friend.avatarUrl}
                alt={`${friend.name}'s profile picture`}
                width={86}
                height={86}
                sizes="86px"
                className="mb-1 object-cover"
                loading="lazy"
              />
              <div className="w-full truncate text-xs font-bold">
                {friend.name}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
