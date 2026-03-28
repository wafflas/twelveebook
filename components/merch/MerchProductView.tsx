import Link from "next/link";
import type { MerchProductPage } from "@/lib/shopify/types";
import { MerchAddToCart } from "@/components/merch/MerchAddToCart";
import { MerchProductGallery } from "@/components/merch/MerchProductGallery";

interface MerchProductViewProps {
  product: MerchProductPage;
}

export function MerchProductView({ product }: MerchProductViewProps) {
  return (
    <div>
      <nav className="mb-4 text-sm">
        <Link href="/merch" className="text-linkblue underline">
          Merchandise
        </Link>
        <span className="text-timestampgray"> / </span>
        <span className="text-black">{product.title}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 md:gap-10">
        <MerchProductGallery images={product.images} title={product.title} />

        <div className="flex flex-col">
          <h1 className="text-2xl font-bold leading-tight text-black">
            {product.title}
          </h1>

          {product.descriptionHtml ? (
            <div
              className="mt-4 text-sm leading-relaxed text-black [&_a]:text-linkblue [&_a]:underline [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          ) : (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-black">
              {product.description}
            </p>
          )}

          <div className="mt-6 flex-1">
            <MerchAddToCart product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
