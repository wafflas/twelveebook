import {
  GET_PROFILES_QUERY,
  ContentfulProfile,
  transformContentfulProfile,
  Profile,
} from "@/types/Profile";

export async function getProfiles(): Promise<Profile[]> {
  try {
    const spaceId = process.env.CONTENTFUL_SPACE_ID;
    const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
    const env = process.env.CONTENTFUL_ENVIRONMENT ?? "master";
    const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/${env}`;

    console.log("Fetching profiles from Contentful...");
    console.log("Endpoint:", endpoint);
    console.log("Query:", GET_PROFILES_QUERY);

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
      const responseText = await fetchResponse.text();
      console.error("Contentful returned status:", fetchResponse.status);
      console.error("Response body:", responseText);
      throw new Error(
        `Contentful returned ${fetchResponse.status}: ${responseText}`,
      );
    }

    const data = await fetchResponse.json();
    console.log("Contentful response:", JSON.stringify(data, null, 2));

    if (data.errors) {
      console.error("GraphQL errors:", JSON.stringify(data.errors));
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    if (!data.data?.profileCollection?.items) {
      console.warn("No profileCollection found in response");
      return [];
    }

    const profiles: ContentfulProfile[] = data.data.profileCollection.items;
    console.log("Total profiles fetched:", profiles.length);
    return profiles.map(transformContentfulProfile);
  } catch (error: any) {
    console.error("Contentful error:", error.message);
    return [];
  }
}
