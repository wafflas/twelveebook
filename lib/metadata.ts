import type { Metadata } from "next";

export const SITE_NAME = "Twelveebook";
export const SITE_DESCRIPTION = "0.twelveebook.com";
export const PRODUCTION_SITE_URL = "https://twelveebook.vercel.app";

export const OG_IMAGE_PATH = "/opengraph_image.png";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

function getSiteUrl(): string | undefined {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  return undefined;
}

function getMetadataBase(): URL | undefined {
  const siteUrl = getSiteUrl();
  return siteUrl ? new URL(siteUrl) : undefined;
}

function getOgImageUrl(): string {
  const siteUrl = getSiteUrl();

  if (siteUrl) {
    return new URL(OG_IMAGE_PATH, siteUrl).toString();
  }

  return OG_IMAGE_PATH;
}

const ogImage = {
  url: getOgImageUrl(),
  width: OG_IMAGE_WIDTH,
  height: OG_IMAGE_HEIGHT,
  alt: SITE_NAME,
};

export function pageTitle(segment: string): string {
  return `${SITE_NAME} | ${segment}`;
}

export function createMetadata({
  title,
  description = SITE_DESCRIPTION,
}: {
  title: string;
  description?: string;
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [getOgImageUrl()],
    },
  };
}

const metadataBase = getMetadataBase();

export const rootMetadata: Metadata = {
  ...(metadataBase ? { metadataBase } : {}),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [getOgImageUrl()],
  },
};
