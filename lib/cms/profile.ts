import { Profile } from "@/types/Profile";
import { client } from "@/sanity/lib/client";
import { devLog } from "@/lib/utils/logger";

const DEFAULT_AVATAR = "/avatars/twelvee.png";

const PROFILES_QUERY = `*[_type == "profile"] | order(_createdAt asc){
  "id": _id,
  name,
  "avatar": avatar.asset->url,
  city,
  relationshipStatus,
  birthday,
  education,
  work,
  music,
  movies,
  quotes,
  "createdAt": _createdAt,
  "updatedAt": _updatedAt,
  "friends": friends[]->{ "name": name, "avatarUrl": avatar.asset->url }
}`;

interface ProfileResult {
  id: string;
  name: string;
  avatar: string | null;
  city?: string | null;
  relationshipStatus?: string | null;
  birthday?: string | null;
  education?: string | null;
  work?: string | null;
  music?: string | null;
  movies?: string | null;
  quotes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  friends?: { name: string; avatarUrl: string | null }[] | null;
}

export async function getProfiles(): Promise<Profile[]> {
  try {
    devLog("Fetching profiles from Sanity...");
    const results = await client.fetch<ProfileResult[]>(
      PROFILES_QUERY,
      {},
      { cache: "no-store" },
    );
    devLog("Profiles fetched:", results?.length ?? 0);

    return (results ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar || DEFAULT_AVATAR,
      city: p.city ?? undefined,
      relationshipStatus: p.relationshipStatus ?? undefined,
      birthday: p.birthday ?? undefined,
      education: p.education ?? undefined,
      work: p.work ?? undefined,
      music: p.music ?? undefined,
      movies: p.movies ?? undefined,
      quotes: p.quotes ?? undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      friends: p.friends?.map((f) => ({
        name: f.name,
        avatarUrl: f.avatarUrl || DEFAULT_AVATAR,
      })),
    }));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Sanity profiles error:", message);
    return [];
  }
}
