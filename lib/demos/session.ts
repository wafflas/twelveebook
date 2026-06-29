const STORAGE_KEY = "twelvee-dino-unlocked-demos";

export function getUnlockedDemoIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function unlockDemoId(id: string): string[] {
  const ids = getUnlockedDemoIds();
  if (!ids.includes(id)) {
    ids.push(id);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }
  return ids;
}
