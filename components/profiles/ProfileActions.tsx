import React from "react";
import Link from "next/link";
import { nameToSlug } from "@/lib/utils";
import { Space_Mono } from "next/font/google";

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
            className="block text-[10px] text-linkblue hover:text-linkblue/80 md:text-[13px]"
          >
            Inbox
          </Link>
          <span
            className="block text-[10px] text-linkblue hover:text-linkblue/80 md:text-[13px] opacity-30 cursor-default"
          >
            Demos
          </span>
          <span
            className="block text-[10px] text-linkblue hover:text-linkblue/80 md:text-[13px] opacity-30 cursor-default"
          >
            Merch
          </span>
        </>
      ) : (
        <>
          <Link
            href={`/inbox/${nameToSlug(firstName)}`}
            className="block text-[10px] text-linkblue hover:text-linkblue/80 md:text-[13px]"
          >
            Send Message to {firstName}
          </Link>
          <Link
            href="#"
            className="block text-[10px] text-linkblue hover:text-linkblue/80 md:text-[13px]"
          >
            View Photos of {firstName}(25)
          </Link>
          <Link
            href="#friends"
            className="block text-[10px] text-linkblue hover:text-linkblue/80 md:text-[13px]"
          >
            View Friends of {firstName}({friendsCount})
          </Link>
        </>
      )}
    </div>
  );
}
