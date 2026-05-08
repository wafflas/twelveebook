/**
 * Types for Chromium offline-runner (`lib/dino/index.js`), which attaches `Runner` to `window`.
 */
export {};

declare global {
  interface Window {
    Runner?: new (selector: string) => {
      destroy(): void;
    };
  }
}
