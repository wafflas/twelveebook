export interface MessageRequest {
  id: string;
  name?: string;
  sender: {
    name: string;
    avatar: string;
  };
  text: string;
  createdAt: string;
  status: "pending" | "accepted" | "declined" | "ignored";
}
