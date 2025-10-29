import { Message } from "@/types/Message";

// Note: Messages are linked FROM Chat, not TO Chat
// Use getChatByContact or getChats and access messagesCollection
export async function getMessagesByChat(chatId: string): Promise<Message[]> {
  console.warn(
    "getMessagesByChat: Messages don't have chat field. Use getChatByContact instead.",
  );
  return [];
}

export async function getMessagesByContact(
  contactName: string,
): Promise<Message[]> {
  const { getChatByContact } = await import("./chat");
  const { messages } = await getChatByContact(contactName);
  return messages;
}
