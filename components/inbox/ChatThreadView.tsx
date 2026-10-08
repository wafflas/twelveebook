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
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={messagesRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col justify-end gap-4 px-3 py-3">
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
        </div>
      </div>

      <ChatComposer />
    </div>
  );
}
