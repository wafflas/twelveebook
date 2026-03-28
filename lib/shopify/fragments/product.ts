import { imageFragment } from "./image";

export const collectionProductFragment = /* GraphQL */ `
  fragment collectionProduct on Product {
    id
    handle
    title
    availableForSale
    featuredImage {
      ...merchImage
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
  ${imageFragment}
`;