// Utility function to convert name to slug
// Example: "Twelvee" -> "twelvee", "Stolou" -> "stolou"
export function nameToSlug(name: string): string {
  return name.toLowerCase().trim();
}

// Convert slug back to name (for display)
export function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
