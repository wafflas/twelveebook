import Link from "next/link";

export default function MerchProductNotFound() {
  return (
    <div className="bg-white p-2 text-black">
      <h1 className="text-xl font-bold">Product not found</h1>
      <p className="mt-2 text-sm text-timestampgray">
        That item may have been removed or the link is wrong.
      </p>
      <p className="mt-4 text-sm">
        <Link href="/merch" className="text-linkblue underline">
          ← Back to merchandise
        </Link>
      </p>
    </div>
  );
}
