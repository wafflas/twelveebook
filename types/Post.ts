export interface PostAuthor {
  name: string;
  avatar: string;
}

export interface PostComment {
  id: string;
  author: PostAuthor;
  text: string;
  timestamp: string;
  replyCount?: number;
  photoUrl?: string;
  likes?: number;
  replies?: {
    id: string;
    author: PostAuthor;
    text: string;
    timestamp: string;
    photoUrl?: string;
    likes?: number;
  }[];
}

export interface Post {
  id: string;
  author: PostAuthor;
  content: string;
  timestamp: string;
  title?: string;
  likes?: number;
  comments?: number;
  taggedPeople?: PostAuthor[];
  location?: string;
  photoUrl?: string;
  commentsData?: PostComment[];
}
