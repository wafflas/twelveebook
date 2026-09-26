# Dino all-time leaderboard (Top 12)

The game and local HI work independently of this optional feature. Scores are
stored in the existing Upstash database under `dino:v1:*`; likes/inbox keys are
not changed. Only the twelve best public entries are retained. Removing a top-twelve
entry does not promote an older thirteenth-place entry because it is not stored.

## Enable

Use the existing `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, plus:

```dotenv
DINO_LEADERBOARD_ENABLED=true
DINO_LEADERBOARD_SECRET=<a random server-only secret of at least 32 characters>
```

Generate the secret with `openssl rand -hex 32`. Add it to `.env.local` for local
development and to the deployment's server environment for production. Never use
a `NEXT_PUBLIC_` prefix. Restart/redeploy after changing environment variables.
Changing the secret invalidates existing player cookies. Missing configuration
disables ranking safely. The existing in-memory development Redis stub does not
support the Lua operations; use a dedicated development Upstash database when
testing ranking manually. Do not point automated tests at the live database.

## Player flow and storage

The leaderboard registers a run automatically when play begins, creating a
session-only signed, HttpOnly, SameSite=Strict cookie scoped to `/api/dino` when
needed. Page load only reads the board and any existing identity; it does not
create a player cookie. Production adds Secure. The session identity begins with a
signed 24-hour validity during casual play; submitting a score to the leaderboard
automatically persists and refreshes the identity for 90 days so returning players
can improve their existing ranking without duplicate entries. The session API still
supports clearing a cookie.

After a qualifying run, players see a nickname field and Submit score / Skip.
Nothing is published without submission. There are no join/leave controls,
remember checkbox or expandable details in the game UI. A short note explains
that submitted nicknames and scores are public. Keep the fuller storage/privacy
information in the site's privacy notice.

The server recognizes players by the verified cookie, never the supplied
nickname. Names can duplicate. Returning players can recover their nickname if
their session is still valid and their entry is still on the board. Browser data
deletion creates a new anonymous identity; this is not proof of a unique human.
Starting another run replaces the previous run token; only one run per identity
is active across tabs. A run expires after one hour.

Entries contain a player ID, nickname, integer displayed score and submission
time. The public API exposes only nicknames and scores. Better scores replace the
same player's entry. Ties keep existing entries ahead. A positive score qualifies
when fewer than twelve entries exist; otherwise it must exceed the lowest score.
Qualification is rechecked on submission; the client prompt can become stale.

## Anti-spam and limits

- Sessions: 10 requests/IP/minute and 5/player/minute.
- Run starts: 60/IP/minute and 10/player/minute.
- Submissions: 30/IP/minute and 5/player/minute.
- Counters use fixed 60-second windows beginning at first use; boundary bursts
  remain possible. Each counter expires. IP values are keyed HMACs, not raw IPs.
- All mutations, rate checks, single-use token consumption and board changes are
  performed by one atomic Redis Lua script. Invalid/implausible scores with a
  valid token consume the run. Duplicate requests cannot create duplicate entries.
- JSON bodies are stream-limited to 1 KB. Scores and token formats are checked.
  Names permit 2–16 ASCII letters, numbers, spaces, underscores and hyphens, with
  a small offensive-word filter. It is not comprehensive; moderation is available.
- Mutation routes require matching Origin and JSON. No administrative credentials
  or score-write Redis credentials are exposed to the browser.
- Public reads cache for 15 seconds in browsers, 30 seconds in shared caches,
  with up to 60 seconds stale-while-revalidate. Submission responses are uncached.
  There is no frame-by-frame traffic or polling. Session responses are private.
- Rate checks consume Redis commands too. Add ingress/firewall limits to
  `/api/dino/*` on the hosting platform to stop floods before Redis, including GET
  requests. Cache-busting requests and identity churn can still consume quota.
  Configure billing/usage alerts and review the shared likes/inbox quota.

**Deployment requirement:** ingress must overwrite untrusted `x-forwarded-for`
(or `x-real-ip`) with the actual client IP and preserve the request's public
origin for same-origin checks. Review the host's proxy behavior before launch;
do not trust a client-controlled forwarded header on a directly exposed server.
Without trusted IP forwarding, IP limits can be bypassed. Origin checks are CSRF
protection, not a defense against scripts that forge headers outside a browser.

## Score validation limitations

Redis time measures elapsed duration. The upper bound follows the game's maximum
speed (13 plus a 0.001 acceleration overshoot), 60 logical frames/second and 0.025
display conversion, with two seconds for request latency/time rounding. Initial
acceleration is per animation frame, so its exact curve varies with display
refresh rate; the check deliberately uses a conservative maximum-speed bound.
Very slow registration requests can make an honest run unverifiable. The game
still continues and local HI saves. Update this bound if scoring rules change.

This rejects impossible scores but not plausible fabricated ones or bots. Stronger
verification requires deterministic game simulation and server replay validation.
There are no claims of cheat-proof rankings. No prizes should depend on this
validation alone.

## Moderation

Run on a trusted machine with the correct database credentials:

```sh
node --env-file=.env.local scripts/dino-leaderboard.mjs list
node --env-file=.env.local scripts/dino-leaderboard.mjs reset
node --env-file=.env.local scripts/dino-leaderboard.mjs remove <player-id>
node --env-file=.env.local scripts/dino-leaderboard.mjs block <player-id>
node --env-file=.env.local scripts/dino-leaderboard.mjs unblock <player-id>
node --env-file=.env.local scripts/dino-leaderboard.mjs disable
node --env-file=.env.local scripts/dino-leaderboard.mjs enable
```

Block removes the entry and active run and blocks the identity for 90 days.
Clearing cookies can bypass identity blocks. Disable immediately rejects new
sessions, starts and submissions; cached public UI may update later. Environment
`DINO_LEADERBOARD_ENABLED=false` also disables ranking after restart/redeploy.
No public admin endpoint is installed.

## Privacy review

The UI describes public nicknames/scores. Integrate the cookie, storage and
retention information above into the site's privacy notice and
provide a usable contact route for removal requests before public launch. Review
Upstash's processing/region arrangements, host logs, applicable cookie rules and
the site's existing localStorage/analytics separately. Playing the game is
not a blanket consent for other tracking. This implementation does not establish
that every browser-storage use on the site is legally exempt from consent.

## Verification

`npm test` runs API, cookie/input-validation and UI tests without live Redis.
`node scripts/test-dino-redis.mjs /path/to/redis-server` exercises the actual Lua
scripts against an isolated temporary Redis process, including concurrent
submissions, expiry, ties, limits and moderation. It never uses Upstash secrets.
Use `npx tsc --noEmit` and the project's lint command for static checks.
