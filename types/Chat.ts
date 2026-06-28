export interface Chat {
  id: string;
  name?: string;
  contact: {
    name: string;
    avatar: string;
  };
  preview: string;
  lastMessageAt: string;
  unread: boolean;
  source?: "messageRequest" | "chat";
  unreadSince?: string; // Timestamp when chat was marked as unread
}
