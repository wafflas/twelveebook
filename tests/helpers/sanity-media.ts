import { evaluate, parse } from "groq-js";

export interface SanityTestDocument {
  _id: string;
  _type: string;
  [field: string]: unknown;
}

export const PHOTO_URL =
  "https://cdn.sanity.io/images/test/production/photo-320x320.jpg";
export const THUMBNAIL_URL =
  "https://cdn.sanity.io/images/test/production/thumbnail-320x320.jpg";

export function reference(id: string) {
  return { _type: "reference", _ref: id };
}

function photo(assetId = "image-photo") {
  return { _type: "image", asset: reference(assetId) };
}

function video(format: string) {
  return { _type: "file", asset: reference(`file-${format}`) };
}

function videoUrl(format: string) {
  return `https://cdn.sanity.io/files/test/production/clip.${format}`;
}

interface AttachmentCase {
  label: string;
  fields: Record<string, unknown>;
  photoUrl?: string;
  videoUrl?: string;
  videoThumbnailUrl?: string;
}

export const attachmentCases: AttachmentCase[] = [
  { label: "legacy text only", fields: {} },
  { label: "photo only", fields: { photos: photo() }, photoUrl: PHOTO_URL },
  ...["mp4", "webm", "mov"].map((format) => ({
    label: `${format.toUpperCase()} video`,
    fields: { video: video(format) },
    videoUrl: videoUrl(format),
  })),
  {
    label: "photo and video together",
    fields: { photos: photo(), video: video("mp4") },
    photoUrl: PHOTO_URL,
    videoUrl: videoUrl("mp4"),
  },
  {
    label: "MOV video with a custom thumbnail",
    fields: { video: video("mov"), videoThumbnail: photo("image-thumbnail") },
    videoUrl: videoUrl("mov"),
    videoThumbnailUrl: THUMBNAIL_URL,
  },
  {
    label: "thumbnail without a video",
    fields: { videoThumbnail: photo("image-thumbnail") },
    videoThumbnailUrl: THUMBNAIL_URL,
  },
  {
    label: "video with a deleted thumbnail",
    fields: { video: video("mp4"), videoThumbnail: photo("image-deleted") },
    videoUrl: videoUrl("mp4"),
  },
  {
    label: "video with an empty thumbnail field",
    fields: { video: video("mp4"), videoThumbnail: { _type: "image" } },
    videoUrl: videoUrl("mp4"),
  },
  {
    label: "deleted image and video assets",
    fields: {
      photos: photo("image-deleted"),
      video: { _type: "file", asset: reference("file-deleted") },
    },
  },
  {
    label: "empty attachment fields",
    fields: { photos: { _type: "image" }, video: { _type: "file" } },
  },
];

export function createSanityDataset(): SanityTestDocument[] {
  return [
    { _id: "image-photo", _type: "sanity.imageAsset", url: PHOTO_URL },
    { _id: "image-thumbnail", _type: "sanity.imageAsset", url: THUMBNAIL_URL },
    ...["mp4", "webm", "mov"].map((format) => ({
      _id: `file-${format}`,
      _type: "sanity.fileAsset",
      url: videoUrl(format),
    })),
    {
      _id: "profile-me",
      _type: "profile",
      name: "Twelvee",
      avatar: photo(),
    },
    {
      _id: "profile-contact",
      _type: "profile",
      name: "Stolou",
      avatar: photo(),
    },
  ];
}

// Only the network call is replaced. Parse and execute the application's actual
// GROQ query so missing projections and broken references can fail the tests.
export function querySanityDataset(documents: SanityTestDocument[]) {
  return async (query: string, params: Record<string, unknown> = {}) => {
    const result = await evaluate(parse(query), { dataset: documents, params });
    return result.get();
  };
}
