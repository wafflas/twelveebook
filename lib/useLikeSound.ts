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
      audio.volume = 0.5; 
      audio.play().catch((error) => {
        console.debug("Could not play like sound:", error);
      });
    } catch (error) {
      console.debug("Audio not supported:", error);
    }
  }, []);

  return { playLikeSound };
}


