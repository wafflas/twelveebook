export function ensureStartsWith(stringToCheck: string, startsWith: string): string {
  return stringToCheck.startsWith(startsWith)
    ? stringToCheck
    : `${startsWith}${stringToCheck}`;
}

/** Accepts `store.myshopify.com`, `https://store.myshopify.com`, or with a trailing slash */
export function normalizeShopifyStoreUrl(raw: string): string {
  let host = raw.trim();
  host = host.replace(/^https?:\/\//i, "");
  host = host.replace(/\/$/, "");
  return ensureStartsWith(host, "https://");
}
