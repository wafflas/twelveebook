import React from "react";
import dynamic from "next/dynamic";
import { Metadata } from "next";

const DemosClient = dynamic(
  () => import("@/components/demos/DemosClient").then((mod) => ({ default: mod.DemosClient })),
  { ssr: false },
);

export const metadata: Metadata = {
  title: "Twelveebook | Demos",
  description: "0.twelveebook.com",
};

export default function DemosPage() {
  return <DemosClient />;
}
