"use client";
import React, { useMemo } from "react";
import "@/styles/globals.css";
import { klavika } from "@/app/fonts";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUnreadCount } from "@/lib/hooks";
import Container from "./ui/Container";

export default function Navbar() {
  const pathname = usePathname();
  const { unreadCount } = useUnreadCount();

  const navItems = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/profile/twelvee", label: "Profile" },
      { href: "/inbox", label: "Inbox" },
      { href: "/demos", label: "Demos" },
      { href: "/sounds", label: "Sounds" },
      { href: "#1", label: "Merch" },
    ],
    [],
  );

  return (
    <div className="sticky top-0 z-50 text-white">
      <div className="w-full bg-brand/90 px-1 text-xs sm:text-sm">
        <Container>
          <span className="text-white/95">
            Free access by{" "}
            <Link
              href="https://www.youtube.com/@WakeBakeRecords"
              className="underline underline-offset-2 hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              WNB Records
            </Link>
            .
          </span>
        </Container>
      </div>
      <div className="bg-brand px-1">
        <Container>
          <Link
            href="/"
            className={`text-3xl ${klavika.className} select-none font-bold`}
          >
            twelveebook{" "}
          </Link>
        </Container>
        <nav className="flex items-center text-xs sm:text-sm">
          <Container>
            <div className="flex items-center justify-between gap-4">
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
                      {item.label == "Merch" ? (
                        <span className="cursor-not-allowed p-0.5 opacity-30">
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
              <span
                aria-hidden
                className="inline-flex shrink-0 cursor-not-allowed items-center justify-center p-0.5 opacity-30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </span>
            </div>
          </Container>
        </nav>
      </div>
    </div>
  );
}
