import { GET_POSTS_QUERY, ContentfulPost, Post } from "@/types/Post";
import { devLog } from "@/lib/utils/logger";

// Using Post type from @/types/Post as single source of truth

function mapToPostProps(p: ContentfulPost): Post {
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

export async function getPosts(): Promise<Post[]> {
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
      console.error("Contentful posts fetch failed:", fetchResponse.status);
      throw new Error(`Contentful returned ${fetchResponse.status}`);
    }

    const data = await fetchResponse.json();

    if (data.errors) {
      console.error("GraphQL errors fetching posts");
      throw new Error("GraphQL errors fetching posts");
    }

    if (!data.data?.postCollection?.items) {
      return [];
    }

    const posts: ContentfulPost[] = data.data.postCollection.items;
    devLog("Total posts fetched:", posts.length);

    return posts.map(mapToPostProps);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Contentful posts error:", message);
    return [];
  }
}
