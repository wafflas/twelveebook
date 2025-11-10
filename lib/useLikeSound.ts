"use client";

import { useCallback } from "react";

/**
 * Hook to play the Facebook-style like sound effect
 * 
 * @returns {object} Object with playLikeSound function
 */
export function useLikeSound() {
  const playLikeSound = useCallback(() => {
    try {
      const audio = new Audio("/sounds/audiocutter_facebook-like-sound-effect2.mp3");
      audio.volume = 0.5; // Adjust volume (0.0 to 1.0)
      audio.play().catch((error) => {
        // Silent fail - some browsers block autoplay
        console.debug("Could not play like sound:", error);
      });
    } catch (error) {
      console.debug("Audio not supported:", error);
    }
  }, []);

  return { playLikeSound };
}

