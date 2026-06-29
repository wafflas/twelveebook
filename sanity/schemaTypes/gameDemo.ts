import { defineField, defineType } from "sanity";

export const gameDemo = defineType({
  name: "gameDemo",
  title: "Game demo unlock",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: "Shown when the demo is unlocked and on the player.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "audio",
      title: "Demo audio",
      type: "file",
      options: { accept: "audio/mpeg,audio/mp3,audio/wav,.mp3,.wav" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "unlockScore",
      title: "Unlock score",
      description:
        "Displayed score needed to unlock this demo in the runner game.",
      type: "number",
      validation: (rule) => rule.required().min(1).integer(),
    }),
    defineField({
      name: "order",
      title: "Order",
      description: "Lower numbers are checked first when multiple demos exist.",
      type: "number",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Unlock score",
      name: "unlockScoreAsc",
      by: [
        { field: "order", direction: "asc" },
        { field: "unlockScore", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "title", unlockScore: "unlockScore" },
    prepare({ title, unlockScore }) {
      return {
        title: title || "(untitled demo)",
        subtitle:
          unlockScore != null ? `Unlock at score ${unlockScore}` : undefined,
      };
    },
  },
});
