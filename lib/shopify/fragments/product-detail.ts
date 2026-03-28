import { imageFragment } from "./image";

export const productDetailFragment = /* GraphQL */ `
  fragment productDetail on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    options {
      id
      name
      values
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
    images(first: 10) {
      edges {
        node {
          ...merchImage
        }
      }
    }
    featuredImage {
      ...merchImage
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
  }
  ${imageFragment}
`;
