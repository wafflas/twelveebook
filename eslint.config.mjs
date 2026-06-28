import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default defineConfig([
  // Chromium offline-runner fork — third-party style, do not Prettier/lint wholesale.
  { ignores: ["lib/dino/index.js"] },
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
