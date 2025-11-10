"use client";
import React, { useEffect, useState } from "react";
import "@/styles/globals.css";
import { klavika } from "@/app/fonts";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/profile/twelvee", label: "Profile" },
    { href: "/inbox", label: "Inbox" },
    { href: "/demos", label: "Demos" },
    { href: "/merch", label: "Merch" },
  ];

  // Fetch unread count on mount and when pathname changes
  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const res = await fetch("/api/inbox/unread-count", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount ?? 0);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    }

    fetchUnreadCount();
  }, [pathname]);

  return (
    <div className="sticky top-0 z-50 bg-brand px-1 text-white">
      <h1 className={`text-3xl ${klavika.className} font-bold`}>
        twelveebook{" "}
      </h1>
      <nav className="text-m flex items-center">
        <ul className="flex space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isInbox = item.href === "/inbox";
            const displayLabel =
              isInbox && unreadCount > 0
                ? `${item.label} (${unreadCount})`
                : item.label;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`p-0.5 ${
                    isActive
                      ? "bg-white/20"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {displayLabel}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
