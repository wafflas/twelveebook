import type { GameDemo } from "@/types/GameDemo";
import { client } from "@/sanity/lib/client";
import { devLog } from "@/lib/utils/logger";

const GAME_DEMOS_QUERY = `*[_type == "gameDemo" && defined(audio.asset)] | order(order asc, unlockScore asc){
  "id": _id,
  title,
  "audioUrl": audio.asset->url,
  unlockScore
}`;

interface GameDemoResult {
  id: string;
  title: string | null;
  audioUrl: string | null;
  unlockScore: number | null;
}

export async function getGameDemos(): Promise<GameDemo[]> {
  try {
    devLog("Fetching game demos from Sanity...");
    const results = await client.fetch<GameDemoResult[]>(
      GAME_DEMOS_QUERY,
      {},
      { cache: "no-store" },
    );

    const demos = (results ?? [])
      .filter(
        (demo) =>
          demo.title &&
          demo.audioUrl &&
          demo.unlockScore != null &&
          demo.unlockScore > 0,
      )
      .map((demo) => ({
        id: demo.id,
        title: demo.title!,
        audioUrl: demo.audioUrl!,
        unlockScore: demo.unlockScore!,
      }));

    devLog("Game demos fetched:", demos.length);
    return demos;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Sanity game demos error:", message);
    return [];
  }
}
