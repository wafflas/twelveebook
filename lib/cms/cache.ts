/** Default ISR window for feed, profiles, posts, inbox threads, message requests. */
export const CMS_REVALIDATE_SECONDS = 60;

/** Demos and soundboard — content changes rarely. */
export const CMS_RARE_REVALIDATE_SECONDS = 300;

export function cmsFetchOptions(revalidate: number = CMS_REVALIDATE_SECONDS) {
  return { next: { revalidate } };
}
