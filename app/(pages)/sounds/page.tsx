import { Metadata } from "next";
import Soundboard from "./Soundboard";
import { getSoundboard } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Twelveebook | Soundboard",
  description: "0.twelveebook.com",
};

export default async function SoundsPage() {
  const { pads } = await getSoundboard();

  return (
    <div className="bg-white p-2 text-black">
      <h1 className="mb-1 text-2xl font-bold">Soundboard</h1>
      <Soundboard pads={pads} />
    </div>
  );
}
