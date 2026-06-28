import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title (internal)",
      description:
        "Only used to identify the post in the CMS, not shown on the site.",
      type: "string",
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "text",
      rows: 4,
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
      name: "taggedPeople",
      title: "Tagged people",
      type: "array",
      of: [{ type: "reference", to: [{ type: "profile" }] }],
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
    }),
    defineField({
      name: "comments",
      title: "Comments",
      type: "array",
      of: [{ type: "reference", to: [{ type: "comment" }] }],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "author.name", media: "photos" },
    prepare({ title, subtitle, media }) {
      return {
        title: title || "(untitled post)",
        subtitle: subtitle ? `by ${subtitle}` : undefined,
        media,
      };
    },
  },
});
