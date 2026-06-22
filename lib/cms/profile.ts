import {
  GET_PROFILES_QUERY,
  ContentfulProfile,
  transformContentfulProfile,
  Profile,
} from "@/types/Profile";
import { devLog, devWarn } from "@/lib/utils/logger";

export async function getProfiles(): Promise<Profile[]> {
  try {
    const spaceId = process.env.CONTENTFUL_SPACE_ID;
    const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
    const env = process.env.CONTENTFUL_ENVIRONMENT ?? "master";
    const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/${env}`;

    devLog("Fetching profiles from Contentful...");

    const fetchResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query: GET_PROFILES_QUERY }),
      cache: "no-store",
    });

    if (!fetchResponse.ok) {
      console.error("Contentful profiles fetch failed:", fetchResponse.status);
      throw new Error(`Contentful returned ${fetchResponse.status}`);
    }

    const data = await fetchResponse.json();
    devLog("Profiles fetched:", data.data?.profileCollection?.items?.length ?? 0);

    if (data.errors) {
      console.error("GraphQL errors fetching profiles");
      throw new Error("GraphQL errors fetching profiles");
    }

    if (!data.data?.profileCollection?.items) {
      devWarn("No profileCollection found in response");
      return [];
    }

    const profiles: ContentfulProfile[] = data.data.profileCollection.items;
    return profiles.map(transformContentfulProfile);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Contentful profiles error:", message);
    return [];
  }
}
