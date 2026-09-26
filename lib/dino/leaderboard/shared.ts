export interface LeaderboardEntry {
  nickname: string;
  score: number;
}

export const NICKNAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 _-]{1,15}$/;

export function qualifies(score: number, entries: LeaderboardEntry[]) {
  return score > 0 && (entries.length < 12 || score > entries[11].score);
}

export function validNickname(value: unknown): value is string {
  if (typeof value !== "string" || !NICKNAME_PATTERN.test(value)) return false;
  // A small abuse filter, not a substitute for moderation.
  const normalized = value.toLowerCase().replace(/[ _-]/g, "");
  return !["shit", "nigger", "nazi", "nigga", "cunt"].some((word) =>
    normalized.includes(word),
  );
}
