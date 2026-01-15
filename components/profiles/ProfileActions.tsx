import React from "react";
import Link from "next/link";

interface ProfileActionsProps {
  isOwner: boolean;
  firstName: string;
  friendsCount: number;
}

export function ProfileActions({
  isOwner,
  firstName,
  friendsCount,
}: ProfileActionsProps) {
  return (
    <div className="space-y-1 pt-2">
      {isOwner ? (
        <>
          <Link
            href="#"
            className="block text-[10px] text-linkblue hover:text-linkblue/80"
          >
            Edit Profile
          </Link>
          <Link
            href="#"
            className="block text-[10px] text-linkblue hover:text-linkblue/80"
          >
            Change Profile Picture
          </Link>
          <Link
            href="#"
            className="block text-[10px] text-linkblue hover:text-linkblue/80"
          >
            Privacy Settings
          </Link>
        </>
      ) : (
        <>
          <Link
            href="#"
            className="block text-[10px] text-linkblue hover:text-linkblue/80"
          >
            Send Message to {firstName}
          </Link>
          <Link
            href="#"
            className="block text-[10px] text-linkblue hover:text-linkblue/80"
          >
            View Photos of {firstName}(25)
          </Link>
          <Link
            href="#"
            className="block text-[10px] text-linkblue hover:text-linkblue/80"
          >
            View Friends of {firstName}({friendsCount})
          </Link>
        </>
      )}
    </div>
  );
}
