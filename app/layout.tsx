import type { Metadata, Viewport } from "next";
import "../styles/globals.css";
import { klavika } from "./fonts";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Twelveebook",
  description: "0.twelveebook.com",
  icons: {
    icon: [
      { url: "/favicon_io(1)/favicon.ico", sizes: "any" },
      {
        url: "/favicon_io(1)/favicon-16x16.png",
        type: "image/png",
        sizes: "16x16",
      },
      {
        url: "/favicon_io(1)/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
    ],
    apple: [
      {
        url: "/favicon_io(1)/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/favicon_io(1)/android-chrome-192x192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        rel: "android-chrome-512x512",
        url: "/favicon_io(1)/android-chrome-512x512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
  },
  manifest: "/favicon_io(1)/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F3860B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body
        className={`min-h-screen bg-white ${inter.className} text-black antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
