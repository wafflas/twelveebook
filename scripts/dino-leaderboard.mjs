// Run only on a trusted machine; the existing Upstash credentials grant access.
import { Redis } from "@upstash/redis";
import { MODERATE } from "../lib/dino/leaderboard/scripts.mjs";

const [action, player] = process.argv.slice(2);
const prefix = "dino:v1";
const board = `${prefix}:board`;
const redis = Redis.fromEnv();

if (action === "list") {
  console.table((await redis.get(board)) ?? []);
} else if (action === "reset") {
  await redis.del(board);
  console.log("Leaderboard reset. All top-12 rankings cleared.");
} else if (action === "disable" || action === "enable") {
  await redis.set(`${prefix}:disabled`, action === "disable" ? "1" : "0");
  console.log(
    `Ranked submissions ${action === "disable" ? "paused" : "enabled"}. Cached UI may take up to 90 seconds to update.`,
  );
} else if (
  ["remove", "block", "unblock"].includes(action) &&
  /^[0-9a-f-]{36}$/.test(player ?? "")
) {
  if (action === "unblock") {
    await redis.del(`${prefix}:blocked:${player}`);
  } else {
    await redis.eval(
      MODERATE,
      [board, `${prefix}:blocked:${player}`, `${prefix}:run:${player}`],
      [player, action],
    );
  }
  console.log(`Completed ${action} for player ${player}.`);
} else {
  console.error(
    "Usage: node --env-file=.env.local scripts/dino-leaderboard.mjs list|reset|disable|enable|remove <player-id>|block <player-id>|unblock <player-id>",
  );
  process.exitCode = 1;
}
