import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default defineConfig([
  ...next,
  {
    files: ["**/*.{ts,tsx,js,jsx}", "**/*.mjs"],
    plugins: { prettier: prettierPlugin },
    rules: {
      "prettier/prettier": [
        "error",
        {
          plugins: ["prettier-plugin-tailwindcss"],
        },
      ],
    },
  },
  prettierConfig,
]);
