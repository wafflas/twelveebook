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

// Format timestamp in 2012 Facebook style
export function formatTimestampFor2012(timestamp: string): string {

  const postDate = new Date(timestamp);

  // Use the current date as "now"
  const now = new Date();

  // Calculate the difference
  const diffMs = now.getTime() - postDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  // fb-style formatting
  if (diffSeconds < 60) return "about a minute ago";
  if (diffMinutes === 1) return "about a minute ago";
  if (diffMinutes < 60) return `about ${diffMinutes} minutes ago`;
  if (diffHours === 1) return "about an hour ago";
  if (diffHours < 24) return `about ${diffHours} hours ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "about a week ago";
  if (diffWeeks < 4) return `about ${diffWeeks} weeks ago`;
  if (diffMonths === 1) return "about a month ago";
  if (diffMonths < 12) return `about ${diffMonths} months ago`;

  // For posts older than 1 year, show the actual date in 2012
  return formatDateIn2012Style(postDate);
}

function formatDateIn2012Style(date: Date): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, 2012`;
}
