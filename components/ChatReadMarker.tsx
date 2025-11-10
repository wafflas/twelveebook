"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface ChatReadMarkerProps {
  chatId: string;
}

/**
 * Invisible component that marks a chat as read when the page is loaded
 */
export default function ChatReadMarker({ chatId }: ChatReadMarkerProps) {
  const markedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    // Only mark once per mount
    if (markedRef.current) return;
    markedRef.current = true;

    async function markAsRead() {
      try {
        await fetch(`/api/inbox/${chatId}/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        // Refresh the router cache so inbox shows updated status
        router.refresh();
      } catch (error) {
        console.error("Failed to mark chat as read:", error);
      }
    }

    markAsRead();
  }, [chatId, router]);

  return null; // Invisible component
}
