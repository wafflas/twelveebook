import { describe, expect, it } from "vitest";
import {
  ConcreteRuleClass,
  createSchema,
  isFileSchemaType,
  isImageSchemaType,
  isObjectSchemaType,
  usEnglishLocale,
  type LocaleSource,
} from "sanity";
import { schema } from "@/sanity/schemaTypes";

const compiledSchema = createSchema({
  name: "media-regression-tests",
  types: schema.types,
});

function getField(documentType: string, fieldName: string) {
  const document = compiledSchema.get(documentType);
  if (!document || !isObjectSchemaType(document)) {
    throw new Error(`Missing document schema: ${documentType}`);
  }
  const field = document.fields.find((entry) => entry.name === fieldName);
  if (!field) throw new Error(`Missing field: ${documentType}.${fieldName}`);
  return field.type;
}

async function validateField(
  documentType: string,
  fieldName: string,
  value: unknown,
) {
  const type = getField(documentType, fieldName);
  const rules = type.validation;
  if (!Array.isArray(rules)) throw new Error("Expected compiled Sanity rules");

  const results = await Promise.all(
    rules.map((rule) => {
      if (!(rule instanceof ConcreteRuleClass)) {
        throw new Error("Expected a compiled Sanity validation rule");
      }
      return rule.validate(value, {
        type,
        schema: compiledSchema,
        path: [fieldName],
        environment: "studio",
        i18n: {
          currentLocale: usEnglishLocale,
          locales: [usEnglishLocale],
          loadNamespaces: async () => {},
          // These tests assert validation errors and paths, not translated copy.
          t: ((key: string) => key) as LocaleSource["t"],
        },
        getClient: () => {
          throw new Error("Field validation should not make network requests");
        },
      });
    }),
  );
  return results.flat().filter((marker) => marker.level === "error");
}

describe("Sanity media schema", () => {
  it("compiles the registered Studio schemas without schema errors", () => {
    const errors = compiledSchema._validation?.flatMap((group) =>
      group.problems.filter((problem) => problem.severity === "error"),
    );
    expect(errors).toEqual([]);
  });

  describe.each(["post", "message", "messageRequest"])("%s", (type) => {
    it("exposes a Photo image upload and a Video file upload", () => {
      expect(isImageSchemaType(getField(type, "photos"))).toBe(true);
      expect(isFileSchemaType(getField(type, "video"))).toBe(true);
      expect(isImageSchemaType(getField(type, "videoThumbnail"))).toBe(true);
      const definition = schema.types.find((entry) => entry.name === type);
      expect(definition).toHaveProperty(
        "fields",
        expect.arrayContaining([
          expect.objectContaining({ name: "photos", title: "Photo" }),
          expect.objectContaining({ name: "video", title: "Video" }),
          expect.objectContaining({
            name: "videoThumbnail",
            title: "Video thumbnail",
          }),
        ]),
      );
    });

    it.each([
      ["MP4", "video/mp4", ".mp4"],
      ["WebM", "video/webm", ".webm"],
      ["MOV", "video/quicktime", ".mov"],
    ])(
      "offers %s by both file type and extension",
      (_, mimeType, extension) => {
        const field = getField(type, "video");
        if (!isFileSchemaType(field)) throw new Error("Expected a file upload");
        const acceptedTypes = field.options?.accept?.split(",");
        expect(acceptedTypes).toEqual(
          expect.arrayContaining([mimeType, extension]),
        );
      },
    );

    it.each(["photos", "video", "videoThumbnail"])(
      "allows %s to be omitted",
      async (field) => {
        expect(await validateField(type, field, undefined)).toEqual([]);
      },
    );

    it("still requires message or post text", async () => {
      expect(await validateField(type, "text", undefined)).toEqual([
        expect.objectContaining({ level: "error", path: ["text"] }),
      ]);
      expect(
        await validateField(type, "text", "A caption for my upload"),
      ).toEqual([]);
    });
  });
});
