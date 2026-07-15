"use client";

import { useEffect, useState } from "react";

interface FacebookToastProps {
  message: string | null;
  onDismiss: () => void;
}

export function FacebookToast({ message, onDismiss }: FacebookToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message || !visible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-16 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded border border-[#dd3c10] bg-[#ffebe8] px-8 py-2 text-center text-[13px] leading-snug text-[#1d2129] shadow-sm"
      role="alert"
      aria-live="assertive"
    >
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#dd3c10] hover:text-[#c0350e]"
        aria-label="Dismiss"
        onClick={() => {
          setVisible(false);
          onDismiss();
        }}
      >
        ×
      </button>
      {message}
    </div>
  );
}
