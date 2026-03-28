import Image from "next/image";
import Link from "next/link";
import { removeLineAction } from "@/app/actions/cart";
import type { StorefrontCart } from "@/lib/shopify/types";
import { formatMoney } from "@/lib/utils/formatting";
import { CartLineQuantity } from "@/components/cart/CartLineQuantity";

interface CartViewProps {
  cart: StorefrontCart;
}

export function CartView({ cart }: CartViewProps) {
  const subtotal = Number.parseFloat(cart.cost.subtotalAmount.amount);

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-gray-200 border border-gray-200">
        {cart.lines.map((line) => (
          <li key={line.id} className="flex gap-3 p-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50">
              {line.imageUrl ? (
                <Image
                  src={line.imageUrl}
                  alt={line.productTitle}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-timestampgray">
                  —
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/merch/${line.productHandle}`}
                className="text-sm font-bold text-linkblue underline"
              >
                {line.productTitle}
              </Link>
              {line.variantTitle && line.variantTitle !== "Default Title" ? (
                <p className="text-xs text-timestampgray">{line.variantTitle}</p>
              ) : null}
              <p className="mt-1 text-sm tabular-nums">
                {formatMoney(
                  Number.parseFloat(line.lineTotal.amount),
                  line.lineTotal.currencyCode,
                )}{" "}
                <span className="text-timestampgray">·</span>{" "}
                <CartLineQuantity line={line} />
              </p>
            </div>
            <form action={removeLineAction.bind(null, line.id)}>
              <button
                type="submit"
                className="text-xs text-linkblue underline hover:text-black"
              >
                Remove
              </button>
            </form>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 border border-gray-200 bg-gray-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          <span className="text-timestampgray">Subtotal </span>
          <span className="font-bold tabular-nums text-black">
            {formatMoney(
              Number.isFinite(subtotal) ? subtotal : 0,
              cart.cost.subtotalAmount.currencyCode,
            )}
          </span>
          {cart.totalQuantity > 0 ? (
            <span className="text-timestampgray">
              {" "}
              ({cart.totalQuantity} {cart.totalQuantity === 1 ? "item" : "items"})
            </span>
          ) : null}
        </p>
        <a
          href={cart.checkoutUrl}
          className="inline-block border border-black/10 bg-brand px-4 py-2.5 text-center text-sm font-bold text-white shadow-sm hover:opacity-95"
        >
          Checkout
        </a>
      </div>
    </div>
  );
}
