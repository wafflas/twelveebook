"use client";

import { useEffect, useState, useCallback } from "react";
import { useLikeSound } from "../useLikeSound";

interface UseLikesOptions {
  itemId: string;
  initialLikes?: number;
  apiPath: "likes" | "comments"; // determines whether to use /api/likes or /api/comments
}

interface UseLikesReturn {
  likes: number;
  likedByVisitor: boolean;
  loading: boolean;
  toggleLike: () => Promise<void>;
}

/**
 * Centralized hook for handling like functionality across posts and comments
 * Handles optimistic updates, API calls, and sound effects
 */
export function useLikes({
  itemId,
  initialLikes = 0,
  apiPath,
}: UseLikesOptions): UseLikesReturn {
  const [likes, setLikes] = useState<number>(initialLikes);
  const [likedByVisitor, setLikedByVisitor] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { playLikeSound } = useLikeSound();

  // Fetch current like status on mount
  useEffect(() => {
    let ignore = false;

    async function fetchLikeStatus() {
      try {
        const endpoint =
          apiPath === "likes"
            ? `/api/likes/${itemId}`
            : `/api/comments/${itemId}/likes`;

        const res = await fetch(endpoint, { cache: "no-store" });
        if (!res.ok) return;

        const data = await res.json();
        if (!ignore) {
          setLikes(data.likes ?? 0);
          setLikedByVisitor(Boolean(data.likedByVisitor));
        }
      } catch (error) {
        // Silent fail - use initial state
        console.debug("Failed to fetch like status:", error);
      }
    }

    fetchLikeStatus();

    return () => {
      ignore = true;
    };
  }, [itemId, apiPath]);

  // Toggle like with optimistic updates
  const toggleLike = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    const action = likedByVisitor ? "unlike" : "like";

    // Play sound immediately for instant feedback
    playLikeSound();

    // Optimistic update
    setLikedByVisitor(!likedByVisitor);
    setLikes((prev) => Math.max(0, prev + (action === "like" ? 1 : -1)));

    try {
      const endpoint =
        apiPath === "likes"
          ? `/api/likes/${itemId}`
          : `/api/comments/${itemId}/likes`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error("Failed to toggle like");

      const data = await res.json();
      setLikes(data.likes ?? 0);
      setLikedByVisitor(Boolean(data.likedByVisitor));
    } catch (error) {
      // Revert optimistic update on error
      console.error("Failed to toggle like:", error);
      setLikedByVisitor((prev) => !prev);
      setLikes((prev) => Math.max(0, prev + (action === "like" ? -1 : 1)));
    } finally {
      setLoading(false);
    }
  }, [itemId, likedByVisitor, loading, apiPath, playLikeSound]);

  return {
    likes,
    likedByVisitor,
    loading,
    toggleLike,
  };
}
