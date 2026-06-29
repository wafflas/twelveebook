"use client";

import React from "react";
import Link from "next/link";
import { nameToSlug } from "@/lib/utils";

interface ProfileActionsProps {
  isOwner: boolean;
  firstName: string;
  friendsCount: number;
}

function scrollToFriends(event: React.MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  document.getElementById("friends")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
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
          <Link
            href="/demos"
            className="block text-[10px] text-linkblue hover:text-linkblue/80 md:text-[13px]"
          >
            Demos
          </Link>
          <span className="block cursor-default text-[10px] text-linkblue opacity-30 hover:text-linkblue/80 md:text-[13px]">
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
          <a
            href="#friends"
            onClick={scrollToFriends}
            className="block text-[10px] text-linkblue hover:text-linkblue/80 md:text-[13px]"
          >
            View Friends of {firstName}({friendsCount})
          </a>
        </>
      )}
    </div>
  );
}
