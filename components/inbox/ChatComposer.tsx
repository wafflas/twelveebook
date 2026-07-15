"use client";

import React, { useCallback, useState } from "react";
import { FacebookToast } from "@/components/ui/FacebookToast";

const NOT_TWELVEE_MESSAGE = "you ain't Twelvee brotha, can't answer that";

export function ChatComposer() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback(() => {
    setToastMessage(NOT_TWELVEE_MESSAGE);
  }, []);

  const dismissToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  return (
    <>
      <FacebookToast message={toastMessage} onDismiss={dismissToast} />
      <div className="border-t border-gray-200 px-3 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-full cursor-pointer rounded border border-gray-300 px-2 py-2 text-sm outline-none"
            onClick={showToast}
          >
            Write a message…
          </button>
          <button
            type="button"
            className="rounded bg-linkblue px-3 py-2 text-sm text-white opacity-60"
            onClick={showToast}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
