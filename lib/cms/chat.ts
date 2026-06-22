import {
  GET_CHATS_QUERY,
  GET_CHAT_BY_CONTACT_QUERY,
  ContentfulChat,
  transformContentfulChat,
  Chat,
} from "@/types/Chat";
import { Message, transformContentfulMessage } from "@/types/Message";
import { devLog, devWarn } from "@/lib/utils/logger";

export async function getChats(): Promise<Chat[]> {
  try {
    const spaceId = process.env.CONTENTFUL_SPACE_ID;
    const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
    const env = process.env.CONTENTFUL_ENVIRONMENT ?? "master";
    const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/${env}`;

    devLog("Fetching chats from Contentful...");

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
      console.error("Contentful chats fetch failed:", fetchResponse.status);
      throw new Error(`Contentful returned ${fetchResponse.status}`);
    }

    const data = await fetchResponse.json();

    if (data.errors) {
      console.error("GraphQL errors fetching chats");
      throw new Error("GraphQL errors fetching chats");
    }

    if (!data.data?.chatCollection?.items) {
      devWarn("No chatCollection found in response");
      return [];
    }

    const chats: ContentfulChat[] = data.data.chatCollection.items;
    devLog("Total chats fetched:", chats.length);
    return chats.map(transformContentfulChat);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Contentful chats error:", message);
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
      console.error("Contentful chat fetch failed:", fetchResponse.status);
      throw new Error(`Contentful returned ${fetchResponse.status}`);
    }

    const data = await fetchResponse.json();

    if (data.errors) {
      console.error("GraphQL errors fetching chat");
      throw new Error("GraphQL errors fetching chat");
    }

    if (
      !data.data?.chatCollection?.items ||
      data.data.chatCollection.items.length === 0
    ) {
      return { chat: null, messages: [] };
    }

    const contentfulChat: ContentfulChat = data.data.chatCollection.items[0];
    const chat = transformContentfulChat(contentfulChat);

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
          const timeA = new Date(a.createdAt).getTime();
          const timeB = new Date(b.createdAt).getTime();
          return timeA - timeB;
        }) || [];

    return { chat, messages };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Contentful chat error:", message);
    return { chat: null, messages: [] };
  }
}
