import React from "react";
import { DemosClient } from "@/components/demos/DemosClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Twelveebook | Demos",
  description: "0.twelveebook.com",
};

export default function DemosPage() {
  return <DemosClient />;
}
