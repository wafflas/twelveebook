import { defineField, defineType } from "sanity";

export const comment = defineType({
  name: "comment",
  title: "Comment",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title (internal)",
      description:
        "Only used to identify the comment in the CMS, not shown on the site.",
      type: "string",
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
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "profile" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "replies",
      title: "Replies",
      type: "array",
      of: [{ type: "reference", to: [{ type: "comment" }] }],
    }),
  ],
  preview: {
    select: { title: "text", subtitle: "author.name", media: "photos" },
    prepare({ title, subtitle, media }) {
      return {
        title: title || "(empty comment)",
        subtitle: subtitle ? `by ${subtitle}` : undefined,
        media,
      };
    },
  },
});
