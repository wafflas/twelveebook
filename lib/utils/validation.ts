/**
 * Validates a CMS document ID before using it in Redis keys / routes.
 * Accepts Contentful-style IDs (alphanumeric) and Sanity IDs, which may
 * also contain hyphens, dots, and underscores.
 */
const DOCUMENT_ID_RE = /^[a-zA-Z0-9._-]{1,128}$/;

export function isValidDocumentId(id: string): boolean {
  return DOCUMENT_ID_RE.test(id);
}
