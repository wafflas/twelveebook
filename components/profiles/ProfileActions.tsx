import React from "react";
import Link from "next/link";
import { nameToSlug } from "@/lib/utils";

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
            href="/inbox"
            className="block text-[10px] text-linkblue hover:text-linkblue/80"
          >
            Inbox
          </Link>
          <Link
            href="/demos"
            className="block text-[10px] text-linkblue hover:text-linkblue/80"
          >
            Demos
          </Link>
          <Link
            href="/merch"
            className="block text-[10px] text-linkblue hover:text-linkblue/80"
          >
            Merch
          </Link>
        </>
      ) : (
        <>
          <Link
            href={`/inbox/${nameToSlug(firstName)}`}
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
            href="#friends"
            className="block text-[10px] text-linkblue hover:text-linkblue/80"
          >
            View Friends of {firstName}({friendsCount})
          </Link>
        </>
      )}
    </div>
  );
}
