import dynamic from "next/dynamic";
import { Metadata } from "next";
import { getMerchCollectionProducts, isShopifyConfigured } from "@/lib/shopify";

const MerchGrid = dynamic(
  () => import("@/components/merch/MerchGrid").then((mod) => ({ default: mod.MerchGrid })),
  { ssr: true },
);

export const metadata: Metadata = {
  title: "Twelveebook | Merch",
  description: "0.twelveebook.com",
};

export default async function page() {
  const items = await getMerchCollectionProducts();
  const shopifyConfigured = isShopifyConfigured();

  return (
    <div className="bg-white p-2 text-black">
      <div className="pb-4">
        <h1 className="text-2xl font-bold">Merchandise</h1>
        <p className="mt-1 text-sm text-timestampgray">
          Official twelveebook items — tap an image to enlarge.
        </p>
      </div>
      <MerchGrid items={items} shopifyConfigured={shopifyConfigured} />
    </div>
  );
}
