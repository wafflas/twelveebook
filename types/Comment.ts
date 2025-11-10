export interface CommentAuthor {
  name: string;
  avatar: string;
}

export interface Comment {
  id: string;
  author: CommentAuthor;
  text: string;
  timestamp: string;
  replies?: Comment[];
  replyCount?: number;
}

// Contentful-specific types for GraphQL response
export interface ContentfulComment {
  sys: {
    id: string;
    firstPublishedAt: string;
  };
  text: string;
  author: {
    name: string;
    avatar: {
      url: string;
    };
  };
  repliesCollection?: {
    items: {
      sys: {
        id: string;
        firstPublishedAt: string;
      };
      text: string;
      author: {
        name: string;
        avatar: {
          url: string;
        };
      };
    }[];
  };
}

export function transformContentfulComment(
  contentfulComment: ContentfulComment,
): Comment {
  return {
    id: contentfulComment.sys.id,
    author: {
      name: contentfulComment.author.name,
      avatar: contentfulComment.author.avatar.url,
    },
    text: contentfulComment.text,
    timestamp: contentfulComment.sys.firstPublishedAt,
    replyCount: contentfulComment.repliesCollection?.items.length || 0,
    replies:
      contentfulComment.repliesCollection?.items.map((reply) => ({
        id: reply.sys.id,
        author: {
          name: reply.author.name,
          avatar: reply.author.avatar.url,
        },
        text: reply.text,
        timestamp: reply.sys.firstPublishedAt,
      })) || [],
  };
}

export const GET_COMMENTS_QUERY = `
  query GetComments {
    commentCollection(limit: 1000, order: sys_firstPublishedAt_ASC) {
      items {
        sys {
          id
          firstPublishedAt
        }
        text
        author {
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
`;

