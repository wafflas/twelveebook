"use server";

import { addToCart, removeFromCart, updateCartLines } from "@/lib/shopify/cart";
import { revalidatePath } from "next/cache";

export async function addToCartAction(merchandiseId: string, quantity = 1) {
  if (!merchandiseId) {
    return { ok: false as const, error: "Missing variant" };
  }
  try {
    await addToCart([{ merchandiseId, quantity }]);
    revalidatePath("/cart");
    revalidatePath("/merch");
    revalidatePath("/");
    return { ok: true as const };
  } catch (e) {
    console.error(e);
    return { ok: false as const, error: "Could not add to cart" };
  }
}

export async function removeLineAction(lineId: string): Promise<void> {
  if (!lineId) return;
  try {
    await removeFromCart([lineId]);
    revalidatePath("/cart");
    revalidatePath("/");
  } catch (e) {
    console.error(e);
  }
}

export async function updateLineQuantityAction(
  lineId: string,
  merchandiseId: string,
  quantity: number,
) {
  if (!lineId || !merchandiseId) {
    return { ok: false as const, error: "Invalid line" };
  }
  try {
    if (quantity < 1) {
      await removeFromCart([lineId]);
    } else {
      await updateCartLines([{ id: lineId, merchandiseId, quantity }]);
    }
    revalidatePath("/cart");
    revalidatePath("/");
    return { ok: true as const };
  } catch (e) {
    console.error(e);
    return { ok: false as const, error: "Could not update quantity" };
  }
}
