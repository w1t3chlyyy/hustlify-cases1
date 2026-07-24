import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { CaseInput, CaseItem } from "@/types/case";

const BUCKET = "case-images";

export async function listCases(): Promise<CaseItem[]> {
  const { data, error } = await supabaseAdmin
    .from("cases")
    .select("*")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as CaseItem[]) ?? [];
}

export async function getCase(id: string): Promise<CaseItem | null> {
  const { data, error } = await supabaseAdmin
    .from("cases")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as CaseItem | null) ?? null;
}

export async function createCase(input: CaseInput): Promise<CaseItem> {
  const { data, error } = await supabaseAdmin
    .from("cases")
    .insert(input)
    .select("*")
    .single();

  if (error) throw error;
  return data as CaseItem;
}

export async function updateCase(
  id: string,
  patch: Partial<CaseInput>
): Promise<CaseItem> {
  const { data, error } = await supabaseAdmin
    .from("cases")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as CaseItem;
}

export async function deleteCase(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("cases").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

const RU_TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export function slugify(input: string): string {
  const lower = input.trim().toLowerCase();
  const translited = lower
    .split("")
    .map((ch) => RU_TRANSLIT[ch] ?? ch)
    .join("");
  const slug = translited
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
  return slug || "case";
}

/** Downloads a file from Telegram's file API and stores it in Supabase Storage, returns the public URL. */
export async function uploadPhotoFromTelegram(filePath: string): Promise<string> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");

  const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
  const res = await fetch(fileUrl);
  if (!res.ok) throw new Error("Не удалось скачать файл из Telegram");

  const arrayBuffer = await res.arrayBuffer();
  const ext = filePath.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, Buffer.from(arrayBuffer), {
      contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
