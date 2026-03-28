"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImageNode } from "@/lib/shopify/types";

interface MerchProductGalleryProps {
  images: ProductImageNode[];
  title: string;
}

export function MerchProductGallery({ images, title }: MerchProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const main = images[index] ?? images[0];

  if (!main) {
    return (
      <div className="flex aspect-square items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 text-sm text-timestampgray">
        No image
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded border border-gray-200 bg-gray-50">
        <Image
          src={main.url}
          alt={main.altText ?? title}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded border bg-white ${
                i === index ? "border-brand ring-1 ring-brand" : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? title}
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
