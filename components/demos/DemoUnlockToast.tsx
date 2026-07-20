"use client";

import { useEffect } from "react";

interface DemoUnlockToastProps {
  message: string | null;
  onDismiss: () => void;
}

export default function DemoUnlockToast({
  message,
  onDismiss,
}: DemoUnlockToastProps) {
  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => {
      onDismiss();
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) {
    return null;
  }

  return (
    <p
      className="absolute left-0 right-0 top-1 z-[5] m-0 text-center text-sm text-black"
      role="status"
      aria-live="polite"
    >
      {message}
    </p>
  );
}
