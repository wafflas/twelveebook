import localFont from "next/font/local";

export const klavika = localFont({
  src: [
    {
      path: "./fonts/klavika/klavika-bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-klavika",
  display: "swap",
});
