"use client";
import React, { useMemo } from "react";
import "@/styles/globals.css";
import { klavika } from "@/app/fonts";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUnreadCount } from "@/lib/hooks";

export default function Navbar() {
  const pathname = usePathname();
  const { unreadCount } = useUnreadCount();

  const navItems = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/profile/twelvee", label: "Profile" },
      { href: "/inbox", label: "Inbox" },
      { href: "/demos", label: "Demos" },
      { href: "/merch", label: "Merch" },
    ],
    [],
  );

  return (
    <div className="sticky top-0 z-50 bg-brand px-1 text-white">
      <Link
        href="/"
        className={`text-3xl ${klavika.className} select-none font-bold`}
      >
        twelveebook{" "}
      </Link>
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
<<<<<<< HEAD
                {item.label == "Demos" || item.label == "Merch" ? (
                  <span className="cursor-default p-0.5 opacity-30">
                    {displayLabel}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className={`p-0.5 ${isActive ? "bg-white/20" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
                  >
                    {displayLabel}
                  </Link>
                )}
=======
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
>>>>>>> parent of 58e3fda (Release version done)
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
