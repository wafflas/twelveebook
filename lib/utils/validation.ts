/** Contentful entry IDs are alphanumeric, typically 22 chars. */
const CONTENTFUL_ID_RE = /^[a-zA-Z0-9]{10,64}$/;

export function isValidContentfulId(id: string): boolean {
  return CONTENTFUL_ID_RE.test(id);
}
