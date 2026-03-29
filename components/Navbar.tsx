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
      { href: "#2", label: "Demos" },
      { href: "#1", label: "Merch" },
    ],
    [],
  );

  return (
    <div className="sticky top-0 z-50 text-white">
      <div className="bg-brand/90 px-1 py-1  text-xs sm:text-sm">
        <span className="text-white/95">
          Free access by{" "}
          <Link
            href="https://www.instagram.com/wakenbakerecords/"
            className="underline underline-offset-2 hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            WNB Records
          </Link>.
        </span>
      </div>
      <div className="bg-brand px-1">
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
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
