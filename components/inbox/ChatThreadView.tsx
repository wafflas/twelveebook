"use client";

import React, { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatComposer } from "./ChatComposer";

type Message = {
  id: string;
  from: "me" | "them";
  text: string;
  when: string;
};

interface ChatThreadViewProps {
  messages: Message[];
  contactName: string;
  myAvatar: string;
  contactAvatar: string;
}

export function ChatThreadView({
  messages,
  contactName,
  myAvatar,
  contactAvatar,
}: ChatThreadViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 px-3 py-3">
        {messages.map((m) => (
          <ChatMessage
            key={m.id}
            id={m.id}
            from={m.from}
            text={m.text}
            when={m.when}
            contactName={contactName}
            myAvatar={myAvatar}
            contactAvatar={contactAvatar}
          />
        ))}
        {/* Invisible anchor for auto-scroll */}
        <div ref={bottomRef} />
      </div>

      <ChatComposer />
    </div>
  );
}
