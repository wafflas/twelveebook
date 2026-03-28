"use client";
import React, { useMemo } from "react";
import "@/styles/globals.css";
import { klavika } from "@/app/fonts";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUnreadCount } from "@/lib/hooks";

interface NavbarProps {
  cartCount?: number;
}

export default function Navbar({ cartCount = 0 }: NavbarProps) {
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

  const isCartActive = pathname === "/cart";

  return (
    <div className="sticky top-0 z-50 bg-brand px-1 text-white">
      <Link
        href="/"
        className={`text-3xl ${klavika.className} select-none font-bold`}
      >
        twelveebook{" "}
      </Link>
      <div className="flex items-center justify-between gap-2">
        <nav className="text-m flex min-w-0 flex-1 items-center">
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
        <Link
          href="/cart"
          aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
          className={`relative inline-flex shrink-0 items-center justify-center p-0.5 ${
            isCartActive
              ? "bg-white/20"
              : "text-white/90 hover:bg-white/10 hover:text-white"
          }`}
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
            aria-hidden
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {cartCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full bg-white px-0.5 text-[9px] font-bold leading-none text-brand">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          ) : null}
        </Link>
      </div>
    </div>
  );
}
