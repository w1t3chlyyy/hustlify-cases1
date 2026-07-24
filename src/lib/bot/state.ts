import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Serverless webhook handlers are stateless between requests, so the
// current step of the /admin conversation for each Telegram user is
// persisted in Supabase (table: admin_bot_state) instead of kept in memory.

export interface BotState {
  step: string;
  data: Record<string, any>;
}

const TABLE = "admin_bot_state";

export async function getState(telegramId: number): Promise<BotState | null> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("step, data")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  if (error || !data) return null;
  return { step: data.step as string, data: (data.data as Record<string, any>) ?? {} };
}

export async function setState(
  telegramId: number,
  step: string,
  data: Record<string, any> = {}
): Promise<void> {
  const { error } = await supabaseAdmin.from(TABLE).upsert({
    telegram_id: telegramId,
    step,
    data,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error("[bot state] failed to save:", error.message);
}

export async function clearState(telegramId: number): Promise<void> {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq("telegram_id", telegramId);
  if (error) console.error("[bot state] failed to clear:", error.message);
}
