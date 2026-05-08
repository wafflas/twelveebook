import type { Metadata } from "next";
import DinoRunner from "@/components/demos/DinoRunner";

export const metadata: Metadata = {
  title: "Demos · Twelveebook",
  description: "Interactive demos",
};

export default function DemosPage() {
  return (
    <div className="mx-auto">
      <DinoRunner />
    </div>
  );
}
