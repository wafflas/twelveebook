"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Hook to fetch and manage unread message count
 * Automatically refreshes when pathname changes
 */
export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const pathname = usePathname();

  useEffect(() => {
    let ignore = false;

    async function fetchUnreadCount() {
      setLoading(true);
      try {
        const res = await fetch("/api/inbox/unread-count", {
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setUnreadCount(data.unreadCount ?? 0);
          }
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
        if (!ignore) {
          setUnreadCount(0);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchUnreadCount();

    return () => {
      ignore = true;
    };
  }, [pathname]);

  return { unreadCount, loading };
}
