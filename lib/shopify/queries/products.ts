import { collectionProductFragment } from "../fragments/product";

/** All published storefront products — used when the merch collection is missing or empty */
export const getStorefrontProductsQuery = /* GraphQL */ `
  query getStorefrontProducts($first: Int!) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          ...collectionProduct
        }
      }
    }
  }
  ${collectionProductFragment}
`;
