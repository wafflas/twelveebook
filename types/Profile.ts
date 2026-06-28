export interface ProfileAuthor {
  name: string;
  avatar: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  city?: string;
  relationshipStatus?: string;
  birthday?: string;
  education?: string;
  work?: string;
  music?: string;
  movies?: string;
  quotes?: string;
  createdAt?: string;
  updatedAt?: string;
  friends?: {
    name: string;
    avatarUrl: string;
  }[];
}
