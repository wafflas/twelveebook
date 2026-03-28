import { cookies } from "next/headers";
import {
  addToCartMutation,
  createCartMutation,
  editCartItemsMutation,
  removeFromCartMutation,
} from "@/lib/shopify/mutations/cart";
import { getCartQuery } from "@/lib/shopify/queries/cart";
import { isShopifyConfigured, shopifyFetch } from "@/lib/shopify/fetch";
import { reshapeCart } from "@/lib/shopify/reshape";
import type {
  ShopifyAddToCartOperation,
  ShopifyCartOperation,
  ShopifyCreateCartOperation,
  ShopifyRemoveFromCartOperation,
  ShopifyUpdateCartOperation,
  StorefrontCart,
} from "@/lib/shopify/types";

export const CART_COOKIE = "cartId";

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

export async function getCart(): Promise<StorefrontCart | undefined> {
  if (!isShopifyConfigured()) {
    return undefined;
  }

  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE)?.value;
  if (!cartId) {
    return undefined;
  }

  try {
    const res = await shopifyFetch<ShopifyCartOperation>({
      query: getCartQuery,
      variables: { cartId },
    });
    if (!res.body.data.cart) {
      cookieStore.delete(CART_COOKIE);
      return undefined;
    }
    return reshapeCart(res.body.data.cart);
  } catch {
    return undefined;
  }
}

export async function addToCart(
  lines: { merchandiseId: string; quantity: number }[],
): Promise<StorefrontCart> {
  const cookieStore = await cookies();
  let cartId = cookieStore.get(CART_COOKIE)?.value;

  if (!cartId) {
    const res = await shopifyFetch<ShopifyCreateCartOperation>({
      query: createCartMutation,
      variables: { lineItems: lines },
    });
    const cart = res.body.data.cartCreate.cart;
    cartId = cart.id;
    cookieStore.set(CART_COOKIE, cartId, cookieOptions());
    return reshapeCart(cart);
  }

  const res = await shopifyFetch<ShopifyAddToCartOperation>({
    query: addToCartMutation,
    variables: { cartId, lines },
  });
  return reshapeCart(res.body.data.cartLinesAdd.cart);
}

export async function removeFromCart(lineIds: string[]): Promise<StorefrontCart> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE)?.value;
  if (!cartId) {
    throw new Error("No cart");
  }
  const res = await shopifyFetch<ShopifyRemoveFromCartOperation>({
    query: removeFromCartMutation,
    variables: { cartId, lineIds },
  });
  return reshapeCart(res.body.data.cartLinesRemove.cart);
}

export async function updateCartLines(
  lines: { id: string; merchandiseId: string; quantity: number }[],
): Promise<StorefrontCart> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE)?.value;
  if (!cartId) {
    throw new Error("No cart");
  }
  const res = await shopifyFetch<ShopifyUpdateCartOperation>({
    query: editCartItemsMutation,
    variables: { cartId, lines },
  });
  return reshapeCart(res.body.data.cartLinesUpdate.cart);
}
