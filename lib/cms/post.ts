import { Post } from "@/types/Post";
import { client } from "@/sanity/lib/client";
import { cmsFetchOptions } from "@/lib/cms/cache";
import { devLog } from "@/lib/utils/logger";

const DEFAULT_AVATAR = "/avatars/twelvee.png";

const AUTHOR_PROJECTION = `{ "name": name, "avatar": avatar.asset->url }`;

const POST_PROJECTION = `{
  "id": _id,
  title,
  "content": text,
  "timestamp": _createdAt,
  location,
  "photoUrl": photos.asset->url,
  "author": author->${AUTHOR_PROJECTION},
  "taggedPeople": taggedPeople[]->${AUTHOR_PROJECTION},
  "commentsData": comments[]->{
    "id": _id,
    "text": text,
    "timestamp": _createdAt,
    "photoUrl": photos.asset->url,
    "author": author->${AUTHOR_PROJECTION},
    "replies": replies[]->{
      "id": _id,
      "text": text,
      "timestamp": _createdAt,
      "photoUrl": photos.asset->url,
      "author": author->${AUTHOR_PROJECTION}
    }
  }
}`;

const POSTS_QUERY = `*[_type == "post"] | order(_createdAt desc)[0...15]${POST_PROJECTION}`;

const WALL_POSTS_QUERY = `*[
  _type == "post" && (
    author._ref == $profileId ||
    $profileId in taggedPeople[]._ref
  )
] | order(_createdAt desc)${POST_PROJECTION}`;

interface AuthorResult {
  name: string | null;
  avatar: string | null;
}

interface ReplyResult {
  id: string;
  text: string;
  timestamp: string;
  photoUrl: string | null;
  author: AuthorResult | null;
}

interface CommentResult {
  id: string;
  text: string;
  timestamp: string;
  photoUrl: string | null;
  author: AuthorResult | null;
  replies: ReplyResult[] | null;
}

interface PostResult {
  id: string;
  title: string | null;
  content: string;
  timestamp: string;
  location: string | null;
  photoUrl: string | null;
  author: AuthorResult | null;
  taggedPeople: AuthorResult[] | null;
  commentsData: CommentResult[] | null;
}

function toAuthor(a: AuthorResult | null) {
  return {
    name: a?.name || "Unknown",
    avatar: a?.avatar || DEFAULT_AVATAR,
  };
}

function toPost(p: PostResult): Post {
  return {
    id: p.id,
    author: toAuthor(p.author),
    title: p.title ?? "",
    content: p.content,
    timestamp: p.timestamp,
    comments: p.commentsData?.length || 0,
    photoUrl: p.photoUrl ?? undefined,
    taggedPeople: p.taggedPeople?.map(toAuthor) ?? [],
    location: p.location ?? undefined,
    commentsData:
      p.commentsData?.map((c) => ({
        id: c.id,
        author: toAuthor(c.author),
        text: c.text,
        timestamp: c.timestamp,
        photoUrl: c.photoUrl ?? undefined,
        replyCount: c.replies?.length || 0,
        replies:
          c.replies?.map((r) => ({
            id: r.id,
            author: toAuthor(r.author),
            text: r.text,
            timestamp: r.timestamp,
            photoUrl: r.photoUrl ?? undefined,
          })) || [],
      })) || [],
  };
}

export async function getPosts(): Promise<Post[]> {
  try {
    const posts = await client.fetch<PostResult[]>(
      POSTS_QUERY,
      {},
      cmsFetchOptions(),
    );
    devLog("Total posts fetched:", posts?.length ?? 0);

    return (posts ?? []).map(toPost);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Sanity posts error:", message);
    return [];
  }
}

export async function getWallPosts(profileId: string): Promise<Post[]> {
  try {
    const posts = await client.fetch<PostResult[]>(
      WALL_POSTS_QUERY,
      { profileId },
      cmsFetchOptions(),
    );
    devLog("Wall posts fetched:", posts?.length ?? 0);

    return (posts ?? []).map(toPost);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Sanity wall posts error:", message);
    return [];
  }
}
