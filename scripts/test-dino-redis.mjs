// Integration test against a fresh, local Redis only. Never reads credentials.
import assert from "node:assert/strict";
import { spawn, execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { MUTATE, MODERATE } from "../lib/dino/leaderboard/scripts.mjs";

if (!process.argv[2])
  throw new Error("Pass the path to a local redis-server binary.");
const binary = resolve(process.argv[2]);
const directory = await mkdtemp(join(tmpdir(), "dino-redis-"));
const socket = join(directory, "redis.sock");
const redis = spawn(
  binary,
  [
    "--port",
    "0",
    "--unixsocket",
    socket,
    "--save",
    "",
    "--appendonly",
    "no",
    "--dir",
    directory,
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);
let log = "";
redis.stdout.on("data", (data) => {
  log += data;
});
redis.stderr.on("data", (data) => {
  log += data;
});
redis.on("error", (error) => {
  log += error.message;
});
const closed = new Promise((done) => redis.on("close", done));
const execute = promisify(execFile);
async function command(...args) {
  const { stdout } = await execute(join(dirname(binary), "redis-cli"), [
    "-s",
    socket,
    "--json",
    ...args.map(String),
  ]);
  return JSON.parse(stdout);
}
const keys = (player, action, ip = player) => [
  "disabled",
  `blocked:${player}`,
  `ip:${action}:${ip}`,
  `player:${action}:${player}`,
  `run:${player}`,
  "board",
];
async function mutate(player, action, token = "", score = 0, ip = player) {
  return command(
    "EVAL",
    MUTATE,
    6,
    ...keys(player, action, ip),
    action,
    token,
    score,
    "Runner",
    player,
  );
}
async function prepared(player, seconds = 100) {
  const token = randomUUID();
  const [now] = await command("TIME");
  await command(
    "SET",
    `run:${player}`,
    JSON.stringify({ token, started: Number(now) - seconds }),
    "EX",
    3600,
  );
  return token;
}

try {
  let ready = false;
  for (let i = 0; i < 50; i++) {
    try {
      await command("PING");
      ready = true;
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  if (!ready) throw new Error(`Local Redis did not start: ${log}`);

  // Concurrent submissions must not lose any qualifying score, and storage stays bounded.
  const players = Array.from({ length: 14 }, () => randomUUID());
  const tokens = await Promise.all(players.map((player) => prepared(player)));
  await Promise.all(
    players.map((player, index) =>
      mutate(player, "submit", tokens[index], (index + 1) * 100),
    ),
  );
  let board = JSON.parse(await command("GET", "board"));
  assert.equal(board.length, 12);
  assert.deepEqual(
    board.map((e) => e.score),
    [1400, 1300, 1200, 1100, 1000, 900, 800, 700, 600, 500, 400, 300],
  );

  const duplicatePlayer = randomUUID();
  const duplicateToken = await prepared(duplicatePlayer);
  const duplicates = await Promise.all(
    Array.from({ length: 3 }, () =>
      mutate(duplicatePlayer, "submit", duplicateToken, 1500),
    ),
  );
  assert.equal(duplicates.filter(([code]) => code === "ok").length, 1);
  assert.equal(duplicates.filter(([code]) => code === "expired").length, 2);

  let token = await prepared(players[13]);
  assert.deepEqual(await mutate(players[13], "submit", token, 1300), [
    "not_improved",
  ]);
  token = await prepared(players[13]);
  assert.deepEqual(await mutate(players[13], "submit", token, 1600), ["ok"]);
  board = JSON.parse(await command("GET", "board"));
  assert.equal(board.filter((entry) => entry.player === players[13]).length, 1);

  const tiePlayer = randomUUID();
  token = await prepared(tiePlayer);
  assert.deepEqual(await mutate(tiePlayer, "submit", token, board[11].score), [
    "not_qualified",
  ]);

  const invalidPlayer = randomUUID();
  token = await prepared(invalidPlayer, 0);
  assert.deepEqual(await mutate(invalidPlayer, "submit", token, 5000), [
    "invalid_score",
  ]);
  assert.deepEqual(await mutate(invalidPlayer, "submit", token, 1), [
    "expired",
  ]);

  const boundPlayer = randomUUID();
  token = await prepared(boundPlayer);
  assert.deepEqual(await mutate(boundPlayer, "submit", randomUUID(), 100), [
    "expired",
  ]);
  assert.notEqual(await command("GET", `run:${boundPlayer}`), null);

  const restartPlayer = randomUUID();
  assert.deepEqual(await mutate(restartPlayer, "start", "first"), ["ok"]);
  assert.deepEqual(await mutate(restartPlayer, "start", "second"), ["ok"]);
  assert.deepEqual(await mutate(restartPlayer, "submit", "first", 1), [
    "expired",
  ]);
  assert.equal(
    JSON.parse(await command("GET", `run:${restartPlayer}`)).token,
    "second",
  );
  await command("EXPIRE", `run:${restartPlayer}`, 1);
  await new Promise((r) => setTimeout(r, 1100));
  assert.deepEqual(await mutate(restartPlayer, "submit", "second", 1), [
    "expired",
  ]);

  const spammer = randomUUID();
  for (let i = 0; i < 10; i++)
    assert.deepEqual(await mutate(spammer, "start", String(i)), ["ok"]);
  assert.deepEqual(await mutate(spammer, "start", "11"), ["limited"]);
  assert.ok((await command("TTL", `player:start:${spammer}`)) > 0);
  for (let i = 0; i < 10; i++)
    assert.deepEqual(
      await mutate(randomUUID(), "session", "", 0, "shared-ip"),
      ["ok"],
    );
  assert.deepEqual(await mutate(randomUUID(), "session", "", 0, "shared-ip"), [
    "limited",
  ]);

  await command(
    "EVAL",
    MODERATE,
    3,
    "board",
    `blocked:${players[13]}`,
    `run:${players[13]}`,
    players[13],
    "block",
  );
  assert.deepEqual(await mutate(players[13], "start", "blocked"), ["blocked"]);
  board = JSON.parse(await command("GET", "board"));
  assert.ok(!board.some((entry) => entry.player === players[13]));
  await command("SET", "disabled", "1");
  assert.deepEqual(await mutate(randomUUID(), "start", "disabled"), [
    "disabled",
  ]);
  console.log(
    "PASS: real Redis atomic concurrency, top 12, improvements, ties, replay rejection, impossible scores, run binding, expiry, rate limits, moderation and kill switch.",
  );
} finally {
  if (redis.exitCode === null) redis.kill("SIGTERM");
  await closed;
  await rm(directory, { recursive: true, force: true });
}
