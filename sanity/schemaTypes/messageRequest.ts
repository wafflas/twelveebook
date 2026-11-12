import { defineField, defineType } from "sanity";

export const messageRequest = defineType({
  name: "messageRequest",
  title: "Message request",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
    }),
    defineField({
      name: "sender",
      title: "Sender",
      type: "reference",
      to: [{ type: "profile" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "photos",
      title: "Photo",
      description: "Upload an image to display below the message text.",
      type: "image",
    }),
    defineField({
      name: "video",
      title: "Video",
      description:
        "Upload an MP4, WebM, or MOV video to display below the message text.",
      type: "file",
      options: {
        accept: "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov",
      },
    }),
    defineField({
      name: "videoThumbnail",
      title: "Video thumbnail",
      description:
        "Optional preview image shown before playback, including on mobile.",
      type: "image",
    }),
    defineField({
      name: "createdAt",
      title: "Created at",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Accepted", value: "accepted" },
          { title: "Declined", value: "declined" },
          { title: "Ignored", value: "ignored" },
        ],
      },
      initialValue: "pending",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "text", subtitle: "status", media: "sender.avatar" },
    prepare({ title, subtitle, media }) {
      return {
        title: title || "(empty request)",
        subtitle: subtitle ? `status: ${subtitle}` : undefined,
        media,
      };
    },
  },
});
