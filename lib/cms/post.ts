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
};

function mapToPostProps(p: ContentfulPost): PostPropsForComponent {
  return {
    id: p.sys.id,
    author: {
      name: p.author?.name || "Unknown",
      avatar: p.author?.avatar?.url || "/avatars/twelvee.png",
    },
    title: "",
    content: p.content,
    timestamp: p.sys.firstPublishedAt,
    comments: 0,
    taggedPeople:
      p.taggedPeopleCollection?.items.map((person) => ({
        name: person.name,
        avatar: person.avatar.url,
      })) || [],
    location: p.location,
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
