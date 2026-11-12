export interface Message {
  id: string;
  name?: string;
  chat: string; // Chat ID
  sender: {
    name: string;
    avatar: string;
  };
  text: string;
  photoUrl?: string;
  videoUrl?: string;
  videoThumbnailUrl?: string;
  createdAt: string;
}
