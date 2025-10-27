export interface ProfileAuthor {
  name: string;
  avatar: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  city?: string;
  relationshipStatus?: string;
  birthday?: string;
  education?: string;
  work?: string;
  music?: string;
  movies?: string;
  quotes?: string;
  createdAt?: string;
  updatedAt?: string;
  friends?: {
    name: string;
    avatarUrl: string;
  }[];
}

// Contentful-specific types for GraphQL response
export interface ContentfulProfile {
  sys: {
    id: string;
    firstPublishedAt: string;
    publishedAt?: string; // Add this instead of updatedAt
  };
  name: string;
  avatar: {
    url: string;
  };
  city?: string;
  relationshipStatus?: string;
  birthday?: string;
  education?: string;
  work?: string;
  music?: string;
  movies?: string;
  quotes?: string;
  friendsCollection?: {
    items: {
      name: string;
      avatar: {
        url: string;
      };
    }[];
  };
}

export function transformContentfulProfile(
  contentfulProfile: ContentfulProfile,
): Profile {
  return {
    id: contentfulProfile.sys.id,
    name: contentfulProfile.name,
    avatar: contentfulProfile.avatar.url,
    city: contentfulProfile.city,
    relationshipStatus: contentfulProfile.relationshipStatus,
    birthday: contentfulProfile.birthday,
    education: contentfulProfile.education,
    work: contentfulProfile.work,
    music: contentfulProfile.music,
    movies: contentfulProfile.movies,
    quotes: contentfulProfile.quotes,
    createdAt: contentfulProfile.sys.firstPublishedAt,
    updatedAt: contentfulProfile.sys.publishedAt, 
    friends: contentfulProfile.friendsCollection?.items?.map((friend) => ({
      name: friend.name,
      avatarUrl: friend.avatar.url,
    })),
  };
}

export const GET_PROFILE_QUERY = `
  query GetProfile($id: String!) {
    profile(id: $id) {
      sys {
        id
        firstPublishedAt
        publishedAt
      }
      name
      avatar {
        url
      }
      city
      relationshipStatus
      birthday
      education
      work
      music
      movies
      quotes
      friendsCollection {
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
`;

export const GET_PROFILES_QUERY = `
  query GetProfiles {
    profileCollection(limit: 50) {
      items {
        sys {
          id
          firstPublishedAt
          publishedAt
        }
        name
        avatar {
          url
        }
        city
        relationshipStatus
        birthday
        education
        work
        music
        movies
        quotes
        friendsCollection {
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
