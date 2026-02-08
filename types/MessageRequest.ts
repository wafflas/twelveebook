export interface MessageRequest {
  id: string;
  name?: string;
  sender: {
    name: string;
    avatar: string;
  };
  text: string;
  createdAt: string;
  status: "pending" | "accepted" | "declined" | "ignored";
}

// Contentful-specific types for GraphQL response
export interface ContentfulMessageRequest {
  sys: {
    id: string;
    firstPublishedAt: string;
  };
  name?: string;
  sender: {
    name: string;
    avatar: {
      url: string;
    };
  };
  text: {
    json: any;
  };
  createdAt?: string;
  status: string;
}

export function transformContentfulMessageRequest(
  contentfulRequest: ContentfulMessageRequest,
): MessageRequest {
  return {
    id: contentfulRequest.sys.id,
    name: contentfulRequest.name,
    sender: {
      name: contentfulRequest.sender.name,
      avatar: contentfulRequest.sender.avatar.url,
    },
    text: extractPlainTextFromRichText(contentfulRequest.text?.json),
    createdAt:
      contentfulRequest.createdAt || contentfulRequest.sys.firstPublishedAt,
    status: contentfulRequest.status as
      | "pending"
      | "accepted"
      | "declined"
      | "ignored",
  };
}

export const GET_MESSAGE_REQUESTS_QUERY = `
  query GetMessageRequests($status: String) {
    messageRequestCollection(
      where: { status: $status }
      order: createdAt_DESC
      limit: 50
    ) {
      items {
        sys {
          id
          firstPublishedAt
        }
        name
        sender {
          ... on Profile {
            name
            avatar {
              url
            }
          }
        }
        text {
          json
        }
        createdAt
        status
      }
    }
  }
`;

export const GET_MESSAGE_REQUEST_BY_ID_QUERY = `
  query GetMessageRequestById($id: String!) {
    messageRequest(id: $id) {
      sys {
        id
        firstPublishedAt
      }
      name
      sender {
        ... on Profile {
          name
          avatar {
            url
          }
        }
      }
      text {
        json
      }
      createdAt
      status
    }
  }
`;

// Helper function to extract plain text from rich text JSON
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
