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
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
        {friends.map((friend, index) => (
          <Link href={`/profile/${nameToSlug(friend.name)}`} key={index}>
            <div className="w-fit items-center text-center transition-opacity hover:opacity-80">
              <Image
                src={friend.avatarUrl}
                alt={friend.name}
                width={88}
                height={88}
                className="items-center object-cover pt-2"
              />
              <p className="text-sm font-semibold">{friend.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
