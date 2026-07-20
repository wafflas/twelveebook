import DinoRunner from "@/components/demos/DinoRunner";
import { getGameDemos } from "@/lib/cms";
import { createMetadata, pageTitle } from "@/lib/metadata";

export const revalidate = 300;

export const metadata = createMetadata({
  title: pageTitle("Demos"),
  description: "Interactive demos",
});

export default async function DemosPage() {
  const demos = await getGameDemos();

  return (
    <div className="bg-white p-2 text-black">
      <h1 className="mb-1 text-2xl font-bold">Demos</h1>
      <DinoRunner demos={demos} />
    </div>
  );
}
