'use client'
import React from "react";
import "@/styles/globals.css";
import { klavika } from "@/app/fonts";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/profile/twelvee", label: "Profile" },
    { href: "/demos", label: "Demos" },
    { href: "/merch", label: "Merch" },
  ];
  return (
    <div className="bg-brand text-white sticky top-0 z-50">
      <h1 className={`text-5xl ${klavika.className} font-bold`}>twelveebook </h1>
      <nav className="flex items-center text-sm">
        <ul className="flex space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`p-0.5 ${
                    isActive
                      ? "bg-white/20 "
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
