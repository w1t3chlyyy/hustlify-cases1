import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ID = "welcome";

export interface WelcomeButton {
  label: string;
  url: string;
}

export interface WelcomeSettings {
  text: string;
  photo_url: string | null; // Telegram file_id or public https URL
  buttons: WelcomeButton[];
}

const DEFAULT_SETTINGS: WelcomeSettings = {
  text: "👋 Добро пожаловать в Hustlify!",
  photo_url: null,
  buttons: [],
};

export async function getWelcomeSettings(): Promise<WelcomeSettings> {
  const { data, error } = await supabaseAdmin
    .from("bot_settings")
    .select("text, photo_url, buttons")
    .eq("id", ID)
    .maybeSingle();

  if (error || !data) return DEFAULT_SETTINGS;
  return {
    text: (data.text as string) || DEFAULT_SETTINGS.text,
    photo_url: (data.photo_url as string | null) ?? null,
    buttons: (data.buttons as WelcomeButton[]) ?? [],
  };
}

export async function updateWelcomeSettings(
  patch: Partial<WelcomeSettings>
): Promise<WelcomeSettings> {
  const current = await getWelcomeSettings();
  const merged: WelcomeSettings = { ...current, ...patch };

  const { error } = await supabaseAdmin.from("bot_settings").upsert({
    id: ID,
    text: merged.text,
    photo_url: merged.photo_url,
    buttons: merged.buttons,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  return merged;
}
