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
