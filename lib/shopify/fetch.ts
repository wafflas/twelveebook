import { SHOPIFY_GRAPHQL_API_ENDPOINT } from "@/lib/constants";
import { normalizeShopifyStoreUrl } from "@/lib/utils/ensure-starts-with";
import { isShopifyError } from "@/lib/shopify/type-guards";

const domain = process.env.SHOPIFY_STORE_DOMAIN
  ? normalizeShopifyStoreUrl(process.env.SHOPIFY_STORE_DOMAIN)
  : "";
const endpoint = domain ? `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}` : "";
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

/**
 * Server-only Storefront GraphQL client.
 * Do not import from Client Components.
 */
export async function shopifyFetch<T>({
  headers,
  query,
  variables,
}: {
  headers?: HeadersInit;
  query: string;
  variables?: ExtractVariables<T>;
}): Promise<{ status: number; body: T }> {
  try {
    if (!endpoint) {
      throw new Error("SHOPIFY_STORE_DOMAIN environment variable is not set");
    }
    if (!key) {
      throw new Error("SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variable is not set");
    }

    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": key,
        ...headers,
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables }),
      }),
    });

    const body = (await result.json()) as T & {
      errors?: { message: string }[];
    };

    if (body.errors?.length) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body,
    };
  } catch (e) {
    if (isShopifyError(e)) {
      throw {
        cause: e.cause?.toString() || "unknown",
        status: e.status || 500,
        message: e.message,
        query,
      };
    }

    throw {
      error: e,
      query,
    };
  }
}

export function isShopifyConfigured(): boolean {
  return Boolean(domain && key);
}
