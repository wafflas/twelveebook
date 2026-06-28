import { Metadata } from "next";
import Soundboard from "./Soundboard";

export const metadata: Metadata = {
  title: "Twelveebook | Soundboard",
  description: "0.twelveebook.com",
};

export default function SoundsPage() {
  return (
    <div className="bg-white p-2 text-black">
      <h1 className="mb-1 text-2xl font-bold">Soundboard</h1>
      <p className="mb-4 text-sm text-timestampgray">
        Tap a pad to play a note.
      </p>
      <Soundboard />
    </div>
  );
}
