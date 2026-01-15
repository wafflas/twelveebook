"use client";

import React, { useEffect } from "react";
import Image from "next/image";

interface ImageModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  alt?: string;
}

export function ImageModal({
  imageUrl,
  isOpen,
  onClose,
  alt = "Image",
}: ImageModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // prevent scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black bg-opacity-75 p-4"
      onClick={onClose}
    >
      <div className="relative flex h-full w-full max-h-[90vh] max-w-4xl items-center justify-center">
        {/* Image */}
        <div className="flex h-full w-full items-center justify-center">
          <Image
            src={imageUrl}
            alt={alt}
            width={600}
            height={600}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute bottom-1 left-0 right-0 z-10 mx-auto"
          aria-label="Close modal"
        >
          <p className="text-sm text-white underline">Close</p>
        </button>
      </div>
    </div>
  );
}
