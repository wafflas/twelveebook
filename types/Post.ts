export interface PostAuthor {
  name: string;
  avatar: string;
}

export interface Post {
  id: string;
  author: PostAuthor;
  content: string;
  timestamp: string;
  title?: string; 
  comments?: number; 
  taggedPeople?: PostAuthor[]; 
  location?: string; 
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
  taggedPeopleCollection?: {
    items: {
      name: string;
      avatar: {
        url: string;
      };
    }[];
  };
  location?: string;
}


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
    taggedPeople:
      contentfulPost.taggedPeopleCollection?.items.map((p) => ({
        name: p.name,
        avatar: p.avatar.url,
      })) || [],
    location: contentfulPost.location,
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
        location
        author {
          ... on Profile {
            name
            avatar {
              url
            }
          }
        }
        taggedPeopleCollection {
          items {
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
`;
