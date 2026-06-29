"use client";

import { useEffect, useState } from "react";

interface DemoUnlockToastProps {
  message: string | null;
  onDismiss: () => void;
}

export default function DemoUnlockToast({
  message,
  onDismiss,
}: DemoUnlockToastProps) {
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
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message || !visible) {
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
