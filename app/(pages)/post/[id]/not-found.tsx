import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-white p-8 text-center">
      <h1 className="mb-4 text-4xl font-bold text-black">Post Not Found</h1>
      <p className="mb-6 text-gray-600">
        Sorry, we couldn't find the post you're looking for.
      </p>
      <Link href="/" className="text-linkblue underline">
        Back
      </Link>
    </div>
  );
}
