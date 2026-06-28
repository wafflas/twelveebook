import { defineField, defineType } from "sanity";

export const soundPad = defineType({
  name: "soundPad",
  title: "Sound pad",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title (internal)",
      description: "Only used to identify the pad in the CMS, not shown on the site.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "audio",
      title: "Audio file",
      type: "file",
      options: { accept: "audio/mpeg,audio/mp3,.mp3" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "order",
      title: "Order",
      description: "Lower numbers appear first on the soundboard.",
      type: "number",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", order: "order" },
    prepare({ title, order }) {
      return {
        title: title || "(untitled pad)",
        subtitle: order != null ? `Order: ${order}` : undefined,
      };
    },
  },
});
