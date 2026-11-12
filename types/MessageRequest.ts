export interface MessageRequest {
  id: string;
  name?: string;
  sender: {
    name: string;
    avatar: string;
  };
  text: string;
  photoUrl?: string;
  videoUrl?: string;
  videoThumbnailUrl?: string;
  createdAt: string;
  status: "pending" | "accepted" | "declined" | "ignored";
}
