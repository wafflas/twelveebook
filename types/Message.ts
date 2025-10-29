export interface Message {
  id: string;
  name?: string;
  chat: string; // Chat ID
  sender: {
    name: string;
    avatar: string;
  };
  text: string;
  createdAt: string;
}

// Contentful-specific types for GraphQL response
export interface ContentfulMessage {
  sys: {
    id: string;
    firstPublishedAt: string;
  };
  name?: string;
  chat: {
    sys: {
      id: string;
    };
  };
  sender: {
    name: string;
    avatar: {
      url: string;
    };
  };
  text: {
    json: any;
  };
  createdAt?: string; // custom field from your model
}

export function transformContentfulMessage(
  contentfulMessage: ContentfulMessage,
): Message {
  return {
    id: contentfulMessage.sys.id,
    name: contentfulMessage.name,
    chat: contentfulMessage.chat.sys.id,
    sender: {
      name: contentfulMessage.sender.name,
      avatar: contentfulMessage.sender.avatar.url,
    },
    text: extractPlainTextFromRichText(contentfulMessage.text?.json),
    createdAt:
      contentfulMessage.createdAt || contentfulMessage.sys.firstPublishedAt,
  };
}

// Note: Messages are accessed through Chat.messagesCollection, not directly
// Use GET_CHAT_BY_CONTACT_QUERY instead

// Minimal extractor: flatten rich text into plain text for previews
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
