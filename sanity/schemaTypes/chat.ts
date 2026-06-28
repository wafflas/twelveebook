import { defineField, defineType } from "sanity";

export const chat = defineType({
  name: "chat",
  title: "Chat",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
    }),
    defineField({
      name: "contact",
      title: "Contact",
      type: "reference",
      to: [{ type: "profile" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "messages",
      title: "Messages",
      type: "array",
      of: [{ type: "reference", to: [{ type: "message" }] }],
    }),
    defineField({
      name: "unread",
      title: "Unread",
      type: "boolean",
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "unreadSince",
      title: "Unread since",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "contact.name",
      media: "contact.avatar",
    },
  },
});
