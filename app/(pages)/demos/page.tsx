import type { Metadata } from "next";
import DinoRunner from "@/components/demos/DinoRunner";
import { getGameDemos } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Twelveebook | Demos",
  description: "Interactive demos",
};

export default async function DemosPage() {
  const demos = await getGameDemos();

  return (
    <div className="bg-white p-2 text-black">
      <h1 className="mb-1 text-2xl font-bold">Demos</h1>
      <DinoRunner demos={demos} />
    </div>
  );
}
