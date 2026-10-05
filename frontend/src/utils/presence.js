export const formatLastSeen = (timestamp, now = Date.now()) => {
  if (!timestamp) return "Offline";

  const lastSeenAt = new Date(timestamp).getTime();
  if (!Number.isFinite(lastSeenAt)) return "Offline";

  const elapsed = Math.max(0, now - lastSeenAt);
  if (elapsed < 60_000) return "Last seen just now";
  if (elapsed < 3_600_000) {
    return `Last seen ${Math.floor(elapsed / 60_000)}m ago`;
  }
  if (elapsed < 86_400_000) {
    return `Last seen ${Math.floor(elapsed / 3_600_000)}h ago`;
  }
  if (elapsed < 604_800_000) {
    return `Last seen ${Math.floor(elapsed / 86_400_000)}d ago`;
  }

  return `Last seen ${new Date(lastSeenAt).toLocaleDateString()}`;
};
