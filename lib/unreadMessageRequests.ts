import { getMessageRequests } from "@/lib/cms";

// Get count of pending message requests (all pending requests are "unread")
export async function getUnreadMessageRequestCount(): Promise<number> {
  try {
    const requests = await getMessageRequests("pending");
    return requests.length;
  } catch (error) {
    console.error("Error getting unread message request count:", error);
    return 0;
  }
}
