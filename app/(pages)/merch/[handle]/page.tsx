import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MerchProductView } from "@/components/merch/MerchProductView";
import { getProductByHandle } from "@/lib/shopify";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) {
    return { title: "Product | Twelveebook" };
  }
  return {
    title: `${product.title} | Twelveebook`,
    description:
      product.description.trim().slice(0, 160) || `${product.title} — merchandise`,
  };
}

export default async function MerchProductPage({ params }: PageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-white p-2 text-black">
      <MerchProductView product={product} />
      <p className="mt-10 border-t border-gray-200 pt-4 text-center text-xs text-timestampgray">
        <Link href="/merch" className="text-linkblue underline">
          ← Back to all merchandise
        </Link>
      </p>
    </div>
  );
}
