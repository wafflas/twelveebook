"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageModal } from "@/components/ui/ImageModal";
import { formatMoney } from "@/lib/utils/formatting";

interface MerchGridProps {
  items: {
    id: string;
    title: string;
    price: number;
    currencyCode: string;
    imageUrl: string;
    slug: string;
    inStock: boolean;
  }[];
  /** Used only in development for empty-state troubleshooting */
  shopifyConfigured?: boolean;
}

const isDev = process.env.NODE_ENV === "development";

export function MerchGrid({ items, shopifyConfigured = false }: MerchGridProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <div className="divide-y divide-gray-200 border border-gray-200">
        {items.length === 0 ? (
          <div className="space-y-2 p-4 text-sm text-timestampgray">
            <p className="text-center font-bold text-black sm:text-left">
              No merchandise yet.
            </p>
            <p className="text-center sm:text-left">Check back soon for new items.</p>
            {isDev ? (
              <div className="mt-4 border-t border-gray-200 pt-4 text-left text-xs">
                <p className="mb-2 font-bold text-black">Dev: no products from Shopify</p>
                {!shopifyConfigured ? (
                  <p>
                    Set <code className="text-black">SHOPIFY_STORE_DOMAIN</code> (e.g.{" "}
                    <code className="text-black">your-store.myshopify.com</code>) and{" "}
                    <code className="text-black">SHOPIFY_STOREFRONT_ACCESS_TOKEN</code> in{" "}
                    <code className="text-black">.env.local</code>, then restart{" "}
                    <code className="text-black">next dev</code>.
                  </p>
                ) : (
                  <ul className="list-disc space-y-1 pl-5">
                    <li>
                      Check the store domain resolves (terminal{" "}
                      <code className="text-black">ENOTFOUND</code> → typo in{" "}
                      <code className="text-black">SHOPIFY_STORE_DOMAIN</code>).
                    </li>
                    <li>
                      Products must be <strong className="text-black">Active</strong> and
                      on the <strong className="text-black">Online Store</strong> channel.
                    </li>
                    <li>
                      Optional: <code className="text-black">SHOPIFY_MERCH_COLLECTION_HANDLE</code>{" "}
                      (default <code className="text-black">merch</code>); empty/missing
                      collection falls back to all published products.
                    </li>
                  </ul>
                )}
              </div>
            ) : null}
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`flex gap-3 p-3 transition-colors hover:bg-gray-50/80 ${
                !item.inStock ? "opacity-70" : ""
              }`}
            >
              {item.imageUrl ? (
                <button
                  type="button"
                  onClick={() => setSelectedImage(item.imageUrl)}
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={64}
                    height={64}
                    sizes="64px"
                    className="object-cover transition-opacity hover:opacity-85"
                    loading="lazy"
                  />
                </button>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 text-[10px] text-timestampgray">
                  No img
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-bold leading-snug text-black">
                    {item.title}
                  </h2>
                  <p className="shrink-0 text-sm tabular-nums text-black">
                    {formatMoney(item.price, item.currencyCode)}
                  </p>
                </div>
                {!item.inStock ? (
                  <p className="mt-1 text-xs font-bold uppercase text-timestampgray">
                    Sold out
                  </p>
                ) : null}
                <div className="mt-2">
                  <Link
                    href={item.slug}
                    className="text-sm font-bold text-linkblue underline"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ImageModal
        imageUrl={selectedImage || ""}
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        alt={
          items.find((item) => item.imageUrl === selectedImage)?.title ||
          "Merchandise image"
        }
      />
    </>
  );
}
