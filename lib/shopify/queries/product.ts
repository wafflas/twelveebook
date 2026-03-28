import { productDetailFragment } from "../fragments/product-detail";

export const getProductQuery = /* GraphQL */ `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      ...productDetail
    }
  }
  ${productDetailFragment}
`;
