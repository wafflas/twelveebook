import { defineField, defineType } from "sanity";

export const profile = defineType({
  name: "profile",
  title: "Profile",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "avatar",
      title: "Avatar",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "city",
      title: "City",
      type: "string",
    }),
    defineField({
      name: "relationshipStatus",
      title: "Relationship status",
      type: "string",
      options: {
        list: [
          { title: "Taken", value: "Taken" },
          { title: "Single", value: "Single" },
          { title: "Married", value: "Married" },
          { title: "Divorced", value: "Divorced" },
        ],
      },
    }),
    defineField({
      name: "education",
      title: "Education",
      type: "string",
    }),
    defineField({
      name: "birthday",
      title: "Birthday",
      type: "date",
    }),
    defineField({
      name: "work",
      title: "Work",
      type: "string",
    }),
    defineField({
      name: "music",
      title: "Music",
      type: "string",
    }),
    defineField({
      name: "movies",
      title: "Movies",
      type: "string",
    }),
    defineField({
      name: "quotes",
      title: "Quotes",
      type: "string",
    }),
    defineField({
      name: "friends",
      title: "Friends",
      type: "array",
      of: [{ type: "reference", to: [{ type: "profile" }] }],
    }),
  ],
  preview: {
    select: { title: "name", media: "avatar" },
  },
});
