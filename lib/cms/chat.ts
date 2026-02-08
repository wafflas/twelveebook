import {
  GET_CHATS_QUERY,
  GET_CHAT_BY_CONTACT_QUERY,
  ContentfulChat,
  transformContentfulChat,
  Chat,
} from "@/types/Chat";
import { Message, transformContentfulMessage } from "@/types/Message";

export async function getChats(): Promise<Chat[]> {
  try {
    const spaceId = process.env.CONTENTFUL_SPACE_ID;
    const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
    const env = process.env.CONTENTFUL_ENVIRONMENT ?? "master";
    const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/${env}`;

    console.log("Fetching chats from Contentful...");

    const fetchResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query: GET_CHATS_QUERY }),
      cache: "no-store",
    });

    if (!fetchResponse.ok) {
      const responseText = await fetchResponse.text();
      console.error("Contentful returned status:", fetchResponse.status);
      console.error("Response body:", responseText);
      throw new Error(
        `Contentful returned ${fetchResponse.status}: ${responseText}`,
      );
    }

    const data = await fetchResponse.json();

    if (data.errors) {
      console.error("GraphQL errors:", JSON.stringify(data.errors));
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    if (!data.data?.chatCollection?.items) {
      console.warn("No chatCollection found in response");
      return [];
    }

    const chats: ContentfulChat[] = data.data.chatCollection.items;
    console.log("Total chats fetched:", chats.length);

    // Also fetch accepted message requests
    const { getMessageRequests } = await import("./messageRequest");
    const acceptedRequests = await getMessageRequests("accepted");
    console.log("Total accepted message requests:", acceptedRequests.length);

    // Transform accepted message requests into Chat format
    const requestsAsChats: Chat[] = acceptedRequests.map((request) => ({
      id: request.id,
      name: request.name,
      contact: {
        name: request.sender.name,
        avatar: request.sender.avatar,
      },
      preview: request.text,
      lastMessageAt: request.createdAt,
      unread: false,
      source: "messageRequest" as const,
    }));

    // Merge regular chats with accepted message requests
    const allChats = [
      ...chats.map(transformContentfulChat),
      ...requestsAsChats,
    ];

    return allChats;
  } catch (error: any) {
    console.error("Contentful error:", error.message);
    return [];
  }
}

export async function getChatByContact(
  contactName: string,
): Promise<{ chat: Chat | null; messages: Message[] }> {
  try {
    const spaceId = process.env.CONTENTFUL_SPACE_ID;
    const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
    const env = process.env.CONTENTFUL_ENVIRONMENT ?? "master";
    const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/${env}`;

    const fetchResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: GET_CHAT_BY_CONTACT_QUERY,
        variables: { contactName },
      }),
      cache: "no-store",
    });

    if (!fetchResponse.ok) {
      const responseText = await fetchResponse.text();
      console.error("Contentful returned status:", fetchResponse.status);
      console.error("Response body:", responseText);
      throw new Error(
        `Contentful returned ${fetchResponse.status}: ${responseText}`,
      );
    }

    const data = await fetchResponse.json();

    if (data.errors) {
      console.error("GraphQL errors:", JSON.stringify(data.errors));
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    // If Chat exists, return it with messages
    if (
      data.data?.chatCollection?.items &&
      data.data.chatCollection.items.length > 0
    ) {
      const contentfulChat: ContentfulChat = data.data.chatCollection.items[0];
      const chat = transformContentfulChat(contentfulChat);

      // Transform messages and sort chronologically (oldest first)
      const messages: Message[] =
        contentfulChat.messagesCollection?.items
          ?.map((msg: any) => {
            return transformContentfulMessage({
              sys: msg.sys,
              name: msg.name,
              chat: { sys: { id: chat.id } },
              sender: msg.sender || { name: "Unknown", avatar: { url: "" } },
              text: msg.text,
              createdAt: msg.createdAt,
            });
          })
          .sort((a, b) => {
            // Sort by timestamp - oldest first (chronological order)
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeA - timeB;
          }) || [];

      return { chat, messages };
    }

    // No Chat found - check for accepted MessageRequest
    console.log(
      `No chat found for ${contactName}, checking for message requests...`,
    );
    const { getMessageRequests } = await import("./messageRequest");

    // First check accepted requests
    const acceptedRequests = await getMessageRequests("accepted");
    let messageRequest = acceptedRequests.find(
      (req) => req.sender.name === contactName,
    );

    // If no accepted request, check pending requests (for preview)
    if (!messageRequest) {
      const pendingRequests = await getMessageRequests("pending");
      messageRequest = pendingRequests.find(
        (req) => req.sender.name === contactName,
      );
    }

    if (!messageRequest) {
      console.log(`No message request found for ${contactName}`);
      return { chat: null, messages: [] };
    }

    console.log(
      `Found message request from ${contactName} with status: ${messageRequest.status}`,
    );

    // Create a Chat object from the message request
    const chat: Chat = {
      id: messageRequest.id,
      name: messageRequest.name,
      contact: {
        name: messageRequest.sender.name,
        avatar: messageRequest.sender.avatar,
      },
      preview: messageRequest.text,
      lastMessageAt: messageRequest.createdAt,
      unread: false,
      source: "messageRequest" as const,
    };

    // Create a single message from the request text
    const message: Message = {
      id: messageRequest.id,
      name: messageRequest.name,
      chat: messageRequest.id,
      sender: {
        name: messageRequest.sender.name,
        avatar: messageRequest.sender.avatar,
      },
      text: messageRequest.text,
      createdAt: messageRequest.createdAt,
    };

    return { chat, messages: [message] };
  } catch (error: any) {
    console.error("Contentful error:", error.message);
    return { chat: null, messages: [] };
  }
}
