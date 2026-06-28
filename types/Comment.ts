export interface CommentAuthor {
  name: string;
  avatar: string;
}

export interface Reply {
  id: string;
  author: CommentAuthor;
  text: string;
  timestamp: string;
  photoUrl?: string;
  likes?: number;
}

export interface Comment {
  id: string;
  author: CommentAuthor;
  text: string;
  timestamp: string;
  photoUrl?: string;
  likes?: number;
  replies?: Reply[];
  replyCount?: number;
}
