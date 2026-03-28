import { collectionProductFragment } from "../fragments/product";

export const getCollectionProductsQuery = /* GraphQL */ `
  query getCollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first, sortKey: BEST_SELLING) {
        edges {
          node {
            ...collectionProduct
          }
        }
      }
    }
  }
  ${collectionProductFragment}
`;