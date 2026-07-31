import "server-only";
import { InlineKeyboard } from "grammy";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { CaseItem } from "@/types/case";
import { getBot } from "./bot";

/** Remembers a Telegram user so we can later broadcast "new case" messages to them. */
export async function registerBotUser(
  telegramId: number,
  username?: string,
  firstName?: string
): Promise<void> {
  const { error } = await supabaseAdmin.from("bot_users").upsert(
    {
      telegram_id: telegramId,
      username: username ?? null,
      first_name: firstName ?? null,
    },
    { onConflict: "telegram_id", ignoreDuplicates: false }
  );
  if (error) console.error("[bot_users] upsert failed:", error.message);
}

async function getAllBotUserIds(): Promise<number[]> {
  const { data, error } = await supabaseAdmin.from("bot_users").select("telegram_id");
  if (error) {
    console.error("[bot_users] failed to load:", error.message);
    return [];
  }
  return (data ?? []).map((r) => r.telegram_id as number);
}

/**
 * Sends a "new case" announcement to every user who has ever started the bot.
 * Runs best-effort: a failure for one user (e.g. they blocked the bot) is
 * logged and skipped rather than aborting the whole broadcast.
 */
export async function broadcastCasePublished(c: CaseItem): Promise<void> {
  const ids = await getAllBotUserIds();
  if (!ids.length) return;

  const bot = getBot();
  const miniAppUrl = process.env.NEXT_PUBLIC_MINIAPP_URL;
  const caption = [
    "🆕 Новый кейс!",
    "",
    `📌 ${c.title}`,
    c.subtitle || null,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const kb = new InlineKeyboard();
    if (miniAppUrl) {
       kb.webApp("👀 Смотреть кейс", miniAppUrl);
  }

  for (const id of ids) {
    try {
      if (c.cover_image) {
        await bot.api.sendPhoto(id, c.cover_image, {
          caption,
          reply_markup: kb.inline_keyboard.length ? kb : undefined,
        });
      } else {
        await bot.api.sendMessage(id, caption, {
          reply_markup: kb.inline_keyboard.length ? kb : undefined,
        });
      }
    } catch (err: any) {
      // Most common cause: user blocked the bot — safe to ignore.
      console.error(`[broadcast] failed for ${id}:`, err?.message ?? err);
    }
    // Telegram allows ~30 msgs/sec across all chats; keep well under that.
    await new Promise((resolve) => setTimeout(resolve, 40));
  }
}
