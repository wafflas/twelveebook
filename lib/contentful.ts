import { GraphQLClient } from "graphql-request";

const spaceId = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
const previewToken = process.env.CONTENTFUL_PREVIEW_TOKEN;
const env = process.env.CONTENTFUL_ENVIRONMENT ?? "master";

if (!spaceId) {
  throw new Error("Missing CONTENTFUL_SPACE_ID in environment");
}

const baseEndpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/${env}`;

export const contentfulClient = new GraphQLClient(baseEndpoint, {
  headers: {
    Authorization: `Bearer ${accessToken ?? ""}`,
    "Content-Type": "application/json",
  },
});

export const contentfulPreviewClient = new GraphQLClient(baseEndpoint, {
  headers: {
    Authorization: `Bearer ${previewToken ?? ""}`,
    "Content-Type": "application/json",
  },
});
