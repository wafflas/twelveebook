"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ImageModal from "@/components/ImageModal";

interface MerchGridProps {
  items: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    slug: string;
    inStock: boolean;
  }[];
}

export default function MerchGrid({ items }: MerchGridProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div className="space-y-0">
        {items.map((item) => (
          <div key={item.id} className="border-b border-gray-200 py-4">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-sm font-bold text-black">{item.title}</h2>
              <p className="text-sm text-black">${item.price}</p>
            </div>

            <div className="flex items-center justify-between">
              {item.imageUrl && (
                <div
                  className="h-16 w-16 cursor-pointer"
                  onClick={() => openModal(item.imageUrl!)}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={64}
                    height={64}
                    className="object-cover transition-opacity hover:opacity-80"
                  />
                </div>
              )}
              <Link
                href={item.slug}
                className="text-linkblue pt-5 text-sm underline"
              >
                Buy
              </Link>
            </div>
          </div>
        ))}

        <div className="pt-6 text-center">
          <Link href="#" className="text-linkblue text-sm underline">
            View more
          </Link>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        imageUrl={selectedImage || ""}
        isOpen={selectedImage !== null}
        onClose={closeModal}
        alt={
          items.find((item) => item.imageUrl === selectedImage)?.title ||
          "Merchandise image"
        }
      />
    </>
  );
}
