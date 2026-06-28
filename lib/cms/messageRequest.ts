import { MessageRequest } from "@/types/MessageRequest";
import { client } from "@/sanity/lib/client";
import { devLog } from "@/lib/utils/logger";

const DEFAULT_AVATAR = "/avatars/twelvee.png";

const REQUEST_PROJECTION = `{
  "id": _id,
  name,
  "sender": sender->{ "name": name, "avatar": avatar.asset->url },
  "text": text,
  "createdAt": coalesce(createdAt, _createdAt),
  status
}`;

const REQUESTS_QUERY = `*[_type == "messageRequest" && (!defined($status) || status == $status)] | order(coalesce(createdAt, _createdAt) desc)[0...50]${REQUEST_PROJECTION}`;

const REQUEST_BY_ID_QUERY = `*[_type == "messageRequest" && _id == $id][0]${REQUEST_PROJECTION}`;

interface MessageRequestResult {
  id: string;
  name?: string | null;
  sender: { name: string | null; avatar: string | null } | null;
  text: string;
  createdAt: string;
  status: string;
}

function toMessageRequest(r: MessageRequestResult): MessageRequest {
  return {
    id: r.id,
    name: r.name ?? undefined,
    sender: {
      name: r.sender?.name || "Unknown",
      avatar: r.sender?.avatar || DEFAULT_AVATAR,
    },
    text: r.text,
    createdAt: r.createdAt,
    status: r.status as "pending" | "accepted" | "declined" | "ignored",
  };
}

export async function getMessageRequests(
  status?: "pending" | "accepted" | "declined" | "ignored",
): Promise<MessageRequest[]> {
  try {
    devLog("Fetching message requests from Sanity...");
    const results = await client.fetch<MessageRequestResult[]>(
      REQUESTS_QUERY,
      { status: status ?? null },
      { cache: "no-store" },
    );
    devLog("Total message requests fetched:", results?.length ?? 0);
    return (results ?? []).map(toMessageRequest);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Sanity message requests error:", message);
    return [];
  }
}

export async function getMessageRequestById(
  id: string,
): Promise<MessageRequest | null> {
  try {
    const result = await client.fetch<MessageRequestResult | null>(
      REQUEST_BY_ID_QUERY,
      { id },
      { cache: "no-store" },
    );
    if (!result) return null;
    return toMessageRequest(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Sanity message request error:", message);
    return null;
  }
}
