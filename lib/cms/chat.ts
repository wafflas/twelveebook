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
    return chats.map(transformContentfulChat);
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

    if (
      !data.data?.chatCollection?.items ||
      data.data.chatCollection.items.length === 0
    ) {
      return { chat: null, messages: [] };
    }

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
  } catch (error: any) {
    console.error("Contentful error:", error.message);
    return { chat: null, messages: [] };
  }
}
