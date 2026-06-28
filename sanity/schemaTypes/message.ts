import { defineField, defineType } from "sanity";

export const message = defineType({
  name: "message",
  title: "Message",
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
  ],
  preview: {
    select: { title: "text", subtitle: "sender.name", media: "sender.avatar" },
    prepare({ title, subtitle, media }) {
      return {
        title: title || "(empty message)",
        subtitle: subtitle ? `from ${subtitle}` : undefined,
        media,
      };
    },
  },
});
