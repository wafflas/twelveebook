import { Soundboard } from "@/types/Soundboard";
import { client } from "@/sanity/lib/client";
import { CMS_RARE_REVALIDATE_SECONDS, cmsFetchOptions } from "@/lib/cms/cache";
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
      cmsFetchOptions(CMS_RARE_REVALIDATE_SECONDS),
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
