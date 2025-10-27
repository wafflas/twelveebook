export interface PostAuthor {
  name: string;
  avatar: string;
}

export interface Post {
  id: string;
  author: PostAuthor;
  content: string;
  timestamp: string;
  title?: string; // optional for backward compatibility
  comments?: number; // optional; defaulted to 0 in transform
}


export interface ContentfulPost {
  sys: {
    id: string;
    firstPublishedAt: string;
  };
  author: {
    name: string;
    avatar: {
      url: string;
    };
  };
  content: string;
}

// helper function to transform Contentful data to Post
export function transformContentfulPost(contentfulPost: ContentfulPost): Post {
  return {
    id: contentfulPost.sys.id,
    author: {
      name: contentfulPost.author.name,
      avatar: contentfulPost.author.avatar.url,
    },
    content: contentfulPost.content,
    timestamp: contentfulPost.sys.firstPublishedAt,
    comments: 0,
  };
}


export const GET_POSTS_QUERY = `
  query GetPosts {
    postCollection(limit: 50) {
      items {
        sys {
          id
          firstPublishedAt
        }
        content
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
