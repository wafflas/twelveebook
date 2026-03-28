export { shopifyFetch, isShopifyConfigured } from "@/lib/shopify/fetch";
export type { ExtractVariables } from "@/lib/shopify/fetch";

export {
  getCart,
  addToCart,
  removeFromCart,
  updateCartLines,
  CART_COOKIE,
} from "@/lib/shopify/cart";

import { getCollectionProductsQuery } from "@/lib/shopify/queries/collection";
import { getProductQuery } from "@/lib/shopify/queries/product";
import { getStorefrontProductsQuery } from "@/lib/shopify/queries/products";
import { shopifyFetch } from "@/lib/shopify/fetch";
import { isShopifyConfigured } from "@/lib/shopify/fetch";
import {
  mapProductDetailToPage,
  mapProductToMerchGridItem,
  removeEdgesAndNodes,
} from "@/lib/shopify/reshape";
import type {
  MerchGridItem,
  MerchProductPage,
  ShopifyCollectionProductsOperation,
  ShopifyProductOperation,
  ShopifyProductsListOperation,
} from "@/lib/shopify/types";

const MERCH_COLLECTION_HANDLE = process.env.SHOPIFY_MERCH_COLLECTION_HANDLE ?? "merch";

export async function getMerchCollectionProducts(
  first: number = 50,
): Promise<MerchGridItem[]> {
  if (!isShopifyConfigured()) {
    return [];
  }

  async function fetchAllProducts(): Promise<MerchGridItem[]> {
    const fallback = await shopifyFetch<ShopifyProductsListOperation>({
      query: getStorefrontProductsQuery,
      variables: { first },
    });
    const nodes = removeEdgesAndNodes(fallback.body.data.products);
    return nodes.map(mapProductToMerchGridItem);
  }

  try {
    const res = await shopifyFetch<ShopifyCollectionProductsOperation>({
      query: getCollectionProductsQuery,
      variables: {
        handle: MERCH_COLLECTION_HANDLE,
        first,
      },
    });

    const collection = res.body.data.collection;
    let nodes = collection ? removeEdgesAndNodes(collection.products) : [];

    if (nodes.length === 0) {
      return fetchAllProducts();
    }

    return nodes.map(mapProductToMerchGridItem);
  } catch (e) {
    console.error("Shopify collection fetch failed, trying all products:", e);
    try {
      return await fetchAllProducts();
    } catch (e2) {
      console.error("Shopify getMerchCollectionProducts:", e2);
      return [];
    }
  }
}

export async function getProductByHandle(handle: string): Promise<MerchProductPage | null> {
  if (!isShopifyConfigured()) {
    return null;
  }

  try {
    const res = await shopifyFetch<ShopifyProductOperation>({
      query: getProductQuery,
      variables: { handle },
    });

    const product = res.body.data.product;
    if (!product) {
      return null;
    }

    return mapProductDetailToPage(product);
  } catch (e) {
    console.error("Shopify getProductByHandle:", e);
    return null;
  }
}
