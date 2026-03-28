"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/app/actions/cart";
import type { MerchProductPage } from "@/lib/shopify/types";
import { formatMoney } from "@/lib/utils/formatting";

interface MerchAddToCartProps {
  product: MerchProductPage;
}

export function MerchAddToCart({ product }: MerchAddToCartProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const first = product.variants[0];
  const [variantId, setVariantId] = useState(first?.id ?? "");

  const selected = useMemo(
    () => product.variants.find((v) => v.id === variantId) ?? first,
    [product.variants, variantId, first],
  );

  const canBuy =
    product.availableForSale && selected?.availableForSale === true;
  const showRange = product.priceMin !== product.priceMax;

  function handleAdd() {
    if (!selected?.id || !canBuy) return;
    setError(null);
    startTransition(async () => {
      const result = await addToCartAction(selected.id, 1);
      if (!result.ok) {
        setError(result.error ?? "Could not add to cart");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4 border-t border-gray-200 pt-4">
      {product.variants.length > 1 ? (
        <label className="block text-xs font-bold uppercase tracking-wide text-timestampgray">
          Option
          <select
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            className="mt-1 block w-full border border-gray-300 bg-white px-2 py-1.5 text-sm text-black focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            {product.variants.map((v) => (
              <option key={v.id} value={v.id} disabled={!v.availableForSale}>
                {v.label}
                {!v.availableForSale ? " — sold out" : ""}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-lg font-bold text-black">
          {selected
            ? formatMoney(selected.priceAmount, selected.currencyCode)
            : showRange
              ? `${formatMoney(product.priceMin, product.currencyCode)} – ${formatMoney(product.priceMax, product.currencyCode)}`
              : formatMoney(product.priceMin, product.currencyCode)}
        </span>
        {!canBuy ? (
          <span className="text-xs font-bold uppercase text-timestampgray">
            Sold out
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs font-bold text-red-600">{error}</p>
      ) : null}

      <button
        type="button"
        disabled={!canBuy || pending}
        onClick={handleAdd}
        className="w-full border border-black/10 bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
      >
        {pending ? "Adding…" : "Add to cart"}
      </button>
      <p className="text-xs text-timestampgray">
        Opens Shopify checkout when you use Checkout in the cart.
      </p>
    </div>
  );
}
