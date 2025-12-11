import { GET_POSTS_QUERY, ContentfulPost } from "@/types/Post";

export type PostPropsForComponent = {
  id: string;
  author: { name: string; avatar: string };
  title: string;
  content: string;
  timestamp: string;
  likes?: number;
  comments: number;
  taggedPeople?: { name: string; avatar: string }[];
  location?: string;
  photoUrl?: string;
  commentsData?: {
    id: string;
    author: { name: string; avatar: string };
    text: string;
    timestamp: string;
    replyCount?: number;
    photoUrl?: string;
    replies?: {
      id: string;
      author: { name: string; avatar: string };
      text: string;
      timestamp: string;
      photoUrl?: string;
    }[];
  }[];
};

function mapToPostProps(p: ContentfulPost): PostPropsForComponent {
  return {
    id: p.sys.id,
    author: {
      name: p.author?.name || "Unknown",
      avatar: p.author?.avatar?.url || "/avatars/twelvee.png",
    },
    title: "",
    content: p.text,
    timestamp: p.sys.firstPublishedAt,
    comments: p.commentsCollection?.items.length || 0,
    photoUrl: p.photos?.url,
    taggedPeople:
      p.taggedPeopleCollection?.items.map((person) => ({
        name: person.name,
        avatar: person.avatar.url,
      })) || [],
    location: p.location,
    commentsData:
      p.commentsCollection?.items.map((c) => ({
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

export async function getPosts(): Promise<PostPropsForComponent[]> {
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
      body: JSON.stringify({ query: GET_POSTS_QUERY }),
      cache: "no-store",
    });

    if (!fetchResponse.ok) {
      const responseText = await fetchResponse.text();
      throw new Error(
        `Contentful returned ${fetchResponse.status}: ${responseText}`,
      );
    }

    const data = await fetchResponse.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    if (!data.data?.postCollection?.items) {
      return [];
    }

    const posts: ContentfulPost[] = data.data.postCollection.items;
    console.log("Total posts fetched:", posts.length);
    console.log(
      "Post IDs:",
      posts.map((p: any) => p.sys.id),
    );

    return posts.map(mapToPostProps);
  } catch (error: any) {
    console.error("Contentful error:", error.message);
    return [];
  }
}
