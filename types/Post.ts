export interface PostAuthor {
  name: string;
  avatar: string;
}

export interface PostComment {
  id: string;
  author: PostAuthor;
  text: string;
  timestamp: string;
  replyCount?: number;
  photoUrl?: string;
  likes?: number;
  replies?: {
    id: string;
    author: PostAuthor;
    text: string;
    timestamp: string;
    photoUrl?: string;
    likes?: number;
  }[];
}

export interface Post {
  id: string;
  author: PostAuthor;
  content: string;
  timestamp: string;
  title?: string;
  likes?: number;
  comments?: number;
  taggedPeople?: PostAuthor[];
  location?: string;
  photoUrl?: string;
  commentsData?: PostComment[];
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
  text: string;
  photos?: {
    url: string;
  };
  taggedPeopleCollection?: {
    items: {
      name: string;
      avatar: {
        url: string;
      };
    }[];
  };
  location?: string;
  commentsCollection?: {
    items: {
      sys: {
        id: string;
        firstPublishedAt: string;
      };
      text: string;
      photos?: {
        url: string;
      };
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
          photos?: {
            url: string;
          };
          author: {
            name: string;
            avatar: {
              url: string;
            };
          };
        }[];
      };
    }[];
  };
}

export function transformContentfulPost(contentfulPost: ContentfulPost): Post {
  return {
    id: contentfulPost.sys.id,
    author: {
      name: contentfulPost.author.name,
      avatar: contentfulPost.author.avatar.url,
    },
    content: contentfulPost.text,
    timestamp: contentfulPost.sys.firstPublishedAt,
    comments: contentfulPost.commentsCollection?.items.length || 0,
    photoUrl: contentfulPost.photos?.url,
    taggedPeople:
      contentfulPost.taggedPeopleCollection?.items.map((p) => ({
        name: p.name,
        avatar: p.avatar.url,
      })) || [],
    location: contentfulPost.location,
    commentsData:
      contentfulPost.commentsCollection?.items.map((c) => ({
        id: c.sys.id,
        author: {
          name: c.author.name,
          avatar: c.author.avatar.url,
        },
        text: c.text,
        timestamp: c.sys.firstPublishedAt,
        photoUrl: c.photos?.url,
        replyCount: c.repliesCollection?.items.length || 0,
        replies:
          c.repliesCollection?.items.map((r) => ({
            id: r.sys.id,
            author: {
              name: r.author.name,
              avatar: r.author.avatar.url,
            },
            text: r.text,
            timestamp: r.sys.firstPublishedAt,
            photoUrl: r.photos?.url,
          })) || [],
      })) || [],
  };
}

export const GET_POSTS_QUERY = `
  query GetPosts {
    postCollection(limit: 15, order: sys_firstPublishedAt_DESC) {
      items {
        sys {
          id
          firstPublishedAt
        }
        text
        location
        photos {
          url
        }
        author {
          ... on Profile {
            name
            avatar {
              url
            }
          }
        }
        taggedPeopleCollection(limit: 5) {
          items {
            ... on Profile {
              name
              avatar {
                url
              }
            }
          }
        }
        commentsCollection(limit: 10) {
          items {
            sys {
              id
              firstPublishedAt
            }
            text
            photos {
              url
            }
            author {
              ... on Profile {
                name
                avatar {
                  url
                }
              }
            }
            repliesCollection(limit: 5) {
              items {
                sys {
                  id
                  firstPublishedAt
                }
                text
                photos {
                  url
                }
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
        }
      }
    }
  }
`;
