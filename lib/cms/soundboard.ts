import { Soundboard } from "@/types/Soundboard";
import { client } from "@/sanity/lib/client";
import { devLog } from "@/lib/utils/logger";

const SOUND_PADS_QUERY = `*[_type == "soundPad" && defined(audio.asset)] | order(order asc, _createdAt asc){
  "id": _id,
  "audioUrl": audio.asset->url
}`;

interface SoundPadResult {
  id: string;
  audioUrl: string | null;
}

export async function getSoundboard(): Promise<Soundboard> {
  try {
    devLog("Fetching sound pads from Sanity...");
    const results = await client.fetch<SoundPadResult[]>(
      SOUND_PADS_QUERY,
      {},
      { cache: "no-store" },
    );

    const pads = (results ?? [])
      .filter((pad) => pad.audioUrl)
      .map((pad) => ({
        id: pad.id,
        audioUrl: pad.audioUrl!,
      }));

    devLog("Sound pads fetched:", pads.length);
    return { pads };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Sanity sound pads error:", message);
    return { pads: [] };
  }
}
