import Image from "next/image";
import Link from "next/link";
import { nameToSlug } from "@/lib/utils";
import { Metadata } from "next";
import { getMessageRequests } from "@/lib/cms";
import { formatTimestampFor2012 } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const requests = await getMessageRequests("pending");

  const title =
    requests.length > 0
      ? `Twelveebook | Message Requests (${requests.length})`
      : "Twelveebook | Message Requests";

  return {
    title,
    description: "0.twelveebook.com",
  };
}

export default async function MessageRequestPage() {
  const requests = await getMessageRequests("pending");

  // Sort by createdAt (newest first)
  const sortedRequests = [...requests].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return timeB - timeA;
  });

  return (
    <div className="bg-white p-2 text-black">
      <div className="mb-4 justify-start">
        <Link href="/inbox" className="text-linkblue underline">
          Back to Inbox
        </Link>
      </div>
      <h1 className="mb-2 text-2xl font-bold">Message Requests</h1>
      <div className="divide-y">
        {sortedRequests.length === 0 ? (
          <p className="py-4 text-gray-600">No pending message requests</p>
        ) : (
          sortedRequests.map((request) => (
            <Link
              key={request.id}
              href={`/inbox/${nameToSlug(request.sender.name)}`}
              className="-mx-2 flex items-start justify-between gap-3 rounded px-2 py-4 hover:bg-gray-50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Image
                  src={request.sender.avatar}
                  alt={`${request.sender.name}'s avatar`}
                  width={48}
                  height={48}
                  sizes="48px"
                  className="h-12 w-12 object-cover"
                  loading="lazy"
                />
                <div className="flex min-w-0 flex-col gap-0.5 leading-tight">
                  <span className="text-base font-bold leading-5 text-black">
                    {request.sender.name}
                  </span>
                  <span className="truncate text-sm font-bold leading-5 text-black">
                    {request.sender.name} wants to send you a message
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="whitespace-nowrap text-sm text-gray-600">
                  <span className="text-black">•</span>{" "}
                  <span className="font-bold text-black">
                    {formatTimestampFor2012(request.createdAt)}
                  </span>
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
