"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  removeLineAction,
  updateLineQuantityAction,
} from "@/app/actions/cart";
import type { StorefrontCartLine } from "@/lib/shopify/types";

interface CartLineQuantityProps {
  line: StorefrontCartLine;
}

export function CartLineQuantity({ line }: CartLineQuantityProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function apply(nextQty: number) {
    startTransition(async () => {
      if (nextQty < 1) {
        await removeLineAction(line.id);
      } else {
        await updateLineQuantityAction(line.id, line.merchandiseId, nextQty);
      }
      router.refresh();
    });
  }

  return (
    <span className="inline-flex items-center gap-1 align-middle">
      <button
        type="button"
        disabled={pending}
        onClick={() => apply(line.quantity - 1)}
        className="h-6 w-6 rounded border border-gray-300 bg-white text-sm leading-none text-black hover:bg-gray-50 disabled:opacity-50"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="min-w-[1.5rem] text-center text-sm tabular-nums">
        {line.quantity}
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => apply(line.quantity + 1)}
        className="h-6 w-6 rounded border border-gray-300 bg-white text-sm leading-none text-black hover:bg-gray-50 disabled:opacity-50"
        aria-label="Increase quantity"
      >
        +
      </button>
    </span>
  );
}
