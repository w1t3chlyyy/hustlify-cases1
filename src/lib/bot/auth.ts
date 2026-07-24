/** Comma-separated Telegram user ids allowed to use /admin, e.g. "111111,222222". */
export function isAdmin(userId: number | undefined): boolean {
  if (!userId) return false;
  const raw = process.env.ADMIN_TELEGRAM_IDS ?? "";
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.includes(String(userId));
}
