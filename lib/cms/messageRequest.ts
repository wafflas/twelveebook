import {
  GET_MESSAGE_REQUESTS_QUERY,
  GET_MESSAGE_REQUEST_BY_ID_QUERY,
  ContentfulMessageRequest,
  transformContentfulMessageRequest,
  MessageRequest,
} from "@/types/MessageRequest";

export async function getMessageRequests(
  status?: "pending" | "accepted" | "declined" | "ignored",
): Promise<MessageRequest[]> {
  try {
    const spaceId = process.env.CONTENTFUL_SPACE_ID;
    const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
    const env = process.env.CONTENTFUL_ENVIRONMENT ?? "master";
    const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/${env}`;

    console.log("Fetching message requests from Contentful...");

    const fetchResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: GET_MESSAGE_REQUESTS_QUERY,
        variables: status ? { status } : {},
      }),
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

    if (data.errors) {
      console.error("GraphQL errors:", JSON.stringify(data.errors));
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    if (!data.data?.messageRequestCollection?.items) {
      console.warn("No messageRequestCollection found in response");
      return [];
    }

    const requests: ContentfulMessageRequest[] =
      data.data.messageRequestCollection.items;
    console.log("Total message requests fetched:", requests.length);
    return requests.map(transformContentfulMessageRequest);
  } catch (error: any) {
    console.error("Contentful error:", error.message);
    return [];
  }
}

export async function getMessageRequestById(
  id: string,
): Promise<MessageRequest | null> {
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
      body: JSON.stringify({
        query: GET_MESSAGE_REQUEST_BY_ID_QUERY,
        variables: { id },
      }),
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

    if (data.errors) {
      console.error("GraphQL errors:", JSON.stringify(data.errors));
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    if (!data.data?.messageRequest) {
      return null;
    }

    const request: ContentfulMessageRequest = data.data.messageRequest;
    return transformContentfulMessageRequest(request);
  } catch (error: any) {
    console.error("Contentful error:", error.message);
    return null;
  }
}
