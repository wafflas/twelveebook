import { Metadata } from "next";
import Link from "next/link";
import { CartView } from "@/components/cart/CartView";
import { getCart } from "@/lib/shopify/cart";

export const metadata: Metadata = {
  title: "Twelveebook | Cart",
  description: "0.twelveebook.com",
};

export default async function CartPage() {
  const cart = await getCart();
  const isEmpty = !cart || cart.lines.length === 0;

  return (
    <div className="bg-white p-2 text-black">
      <h1 className="pb-1 text-2xl font-bold">Cart</h1>
      <p className="text-sm text-timestampgray">Your shopping bag</p>

      {isEmpty ? (
        <div className="mt-6 border border-gray-200 bg-gray-50/80 p-6 text-center">
          <p className="text-sm font-bold text-black">Your cart is empty</p>
          <p className="mt-2 text-sm text-timestampgray">
            When you add items, they will show up here.
          </p>
          <p className="mt-5">
            <Link
              href="/merch"
              className="inline-block border border-black/10 bg-brand px-4 py-2 text-sm font-bold text-white shadow-sm hover:opacity-95"
            >
              Browse merchandise
            </Link>
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <CartView cart={cart} />
        </div>
      )}
    </div>
  );
}
