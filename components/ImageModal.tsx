"use client";

import React, { useEffect } from "react";
import Image from "next/image";

interface ImageModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  alt?: string;
}

export default function ImageModal({ imageUrl, isOpen, onClose, alt = "Image" }: ImageModalProps) {
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
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
        

        {/* Image */}
        <div className="w-full h-full flex items-center justify-center">
          <Image
            src={imageUrl}
            alt={alt}
            width={600}
            height={600}
            className="object-contain max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute bottom-1 left-0 right-0 mx-auto z-10 "
          aria-label="Close modal"
        >
          <p className="text-white text-sm underline">Close</p>
        </button>
      </div>
    </div>
  );
}