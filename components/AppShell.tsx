"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import EasterEgg from "@/components/EasterEgg";

const Navbar = dynamic(() => import("@/components/Navbar"));

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The Sanity Studio route renders full-screen without the app chrome.
  if (pathname?.startsWith("/studio")) {
    return <>{children}</>;
  }

  return (
    <>
      <EasterEgg />
      <Navbar />
      <main className="flex-1 overflow-auto">{children}</main>
    </>
  );
}
