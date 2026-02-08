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

// Contentful-specific types for GraphQL response
export interface ContentfulChat {
  sys: {
    id: string;
    firstPublishedAt: string;
  };
  name?: string;
  contact: {
    name: string;
    avatar: {
      url: string;
    };
  };
  unread?: boolean;
  unreadSince?: string; // Timestamp when chat was marked as unread
  messagesCollection?: {
    items: {
      sys: { id: string; firstPublishedAt: string };
      createdAt?: string;
      text?: { json: any };
      sender?: {
        name: string;
        avatar: {
          url: string;
        };
      };
    }[];
  };
}

export function transformContentfulChat(contentfulChat: ContentfulChat): Chat {
  // derive preview/lastMessageAt from latest message
  // Sort messages by createdAt or firstPublishedAt to get the most recent
  const msgs = contentfulChat.messagesCollection?.items ?? [];
  const sorted = [...msgs].sort((a, b) => {
    const aTime = a.createdAt || a.sys?.firstPublishedAt || "";
    const bTime = b.createdAt || b.sys?.firstPublishedAt || "";
    return bTime.localeCompare(aTime); // descending order (newest first)
  });
  const last = sorted[0]; // most recent message
  const lastText = extractPlainTextFromRichText(last?.text?.json) || "";
  const lastAt =
    last?.createdAt ||
    last?.sys?.firstPublishedAt ||
    contentfulChat.sys.firstPublishedAt;
  return {
    id: contentfulChat.sys.id,
    name: contentfulChat.name,
    contact: {
      name: contentfulChat.contact.name,
      avatar: contentfulChat.contact.avatar.url,
    },
    preview: lastText,
    lastMessageAt: lastAt,
    unread: contentfulChat.unread ?? false,
    unreadSince: contentfulChat.unreadSince || undefined,
  };
}

export const GET_CHATS_QUERY = `
  query GetChats {
    chatCollection(limit: 50) {
      items {
        sys {
          id
          firstPublishedAt
        }
        name
        contact {
          ... on Profile {
            name
            avatar {
              url
            }
          }
        }
        unread
        unreadSince
        messagesCollection(limit: 50) {
          items {
            ... on Message {
              sys { id firstPublishedAt }
              createdAt
              text { json }
            }
          }
        }
      }
    }
  }
`;

export const GET_CHAT_BY_CONTACT_QUERY = `
  query GetChatByContact($contactName: String!) {
    chatCollection(
      where: { contact: { name: $contactName } }
      limit: 1
    ) {
      items {
        sys {
          id
          firstPublishedAt
        }
        name
        contact {
          ... on Profile {
            name
            avatar {
              url
            }
          }
        }
        unread
        unreadSince
        messagesCollection(limit: 100) {
          items {
            ... on Message {
              sys { 
                id 
                firstPublishedAt 
              }
              name
              createdAt
              text { json }
              sender {
                ... on Profile {
                  name
                  avatar {
                    url
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

function extractPlainTextFromRichText(richTextJson: any): string {
  if (!richTextJson) return "";
  try {
    const texts: string[] = [];
    const walk = (node: any) => {
      if (!node) return;
      if (node.nodeType === "text" && typeof node.value === "string") {
        texts.push(node.value);
      }
      const content = node.content as any[];
      if (Array.isArray(content)) content.forEach(walk);
    };
    walk(richTextJson);
    return texts.join(" ").trim();
  } catch {
    return "";
  }
}
