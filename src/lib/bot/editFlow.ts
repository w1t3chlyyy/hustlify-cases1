import { Context } from "grammy";
import { CaseInput } from "@/types/case";
import { setState, clearState, BotState } from "./state";
import { getCase, updateCase, deleteCase, uploadPhotoFromTelegram } from "./caseService";
import { broadcastCasePublished } from "./broadcast";
import { formatCaseSummary } from "./format";
import {
  cancelKeyboard,
  galleryDoneKeyboard,
  caseDetailKeyboard,
  confirmDeleteKeyboard,
  mainMenuKeyboard,
} from "./keyboards";

const FIELD_PROMPTS: Record<string, string> = {
  t: "Отправьте новый заголовок:",
  s: "Отправьте новый подзаголовок (или «-», чтобы очистить):",
  d: "Отправьте новое описание:",
  g: "Отправьте теги через запятую (или «-», чтобы очистить):",
  p: "Отправьте новую ссылку на проект (или «-», чтобы очистить):",
  cv: "Отправьте новое фото обложки:",
};

/** Handles taps on the case detail action buttons (e:<field>:<id>). */
export async function handleEditAction(ctx: Context, userId: number, field: string, id: string) {
  if (field === "pub") {
    const c = await getCase(id);
    if (!c) return void (await ctx.reply("Кейс не найден."));
    const willPublish = !c.is_published;
    const updated = await updateCase(id, { is_published: willPublish });
    await ctx.editMessageText(formatCaseSummary(updated), { reply_markup: caseDetailKeyboard(updated) });
    if (willPublish) {
      await broadcastCasePublished(updated).catch((err) =>
        console.error("[broadcast] failed:", err)
      );
    }
    return;
  }

  if (field === "del") {
    await ctx.editMessageText("Удалить этот кейс без возможности восстановления?", {
      reply_markup: confirmDeleteKeyboard(id),
    });
    return;
  }

  if (field === "delY") {
    await deleteCase(id);
    await clearState(userId);
    await ctx.editMessageText("🗑 Кейс удалён.", { reply_markup: mainMenuKeyboard() });
    return;
  }

  if (field === "gl") {
    await setState(userId, `edit:gallery:${id}`, {});
    await ctx.reply("Пришлите фото для добавления в галерею. Когда закончите — «Готово».", {
      reply_markup: galleryDoneKeyboard(),
    });
    return;
  }

  if (field in FIELD_PROMPTS) {
    await setState(userId, `edit:field:${field}:${id}`, {});
    await ctx.reply(FIELD_PROMPTS[field], { reply_markup: cancelKeyboard() });
    return;
  }
}

export async function handleGalleryDoneEdit(ctx: Context, userId: number, id: string) {
  await clearState(userId);
  const c = await getCase(id);
  if (!c) return void (await ctx.reply("Кейс не найден."));
  await ctx.reply("✅ Галерея обновлена.");
  await ctx.reply(formatCaseSummary(c), { reply_markup: caseDetailKeyboard(c) });
}

export async function handleEditFlowMessage(ctx: Context, userId: number, state: BotState) {
  const parts = state.step.split(":"); // ["edit","field","<code>","<id>"] or ["edit","gallery","<id>"]

  if (parts[1] === "gallery") {
    const id = parts[2];
    const photo = ctx.message?.photo?.at(-1);
    if (!photo) return void (await ctx.reply("Пришлите фото или нажмите «Готово»."));
    const file = await ctx.api.getFile(photo.file_id);
    if (!file.file_path) return void (await ctx.reply("Не удалось получить файл, попробуйте ещё раз."));
    const url = await uploadPhotoFromTelegram(file.file_path);
    const c = await getCase(id);
    if (!c) {
      await clearState(userId);
      return void (await ctx.reply("Кейс не найден."));
    }
    const images = [...c.images, url];
    await updateCase(id, { images });
    await ctx.reply(`Добавлено (${images.length}). Пришлите ещё фото или нажмите «Готово».`, {
      reply_markup: galleryDoneKeyboard(),
    });
    return;
  }

  const field = parts[2];
  const id = parts[3];

  if (field === "cv") {
    const photo = ctx.message?.photo?.at(-1);
    if (!photo) return void (await ctx.reply("Пожалуйста, отправьте фото."));
    const file = await ctx.api.getFile(photo.file_id);
    if (!file.file_path) return void (await ctx.reply("Не удалось получить файл, попробуйте ещё раз."));
    const url = await uploadPhotoFromTelegram(file.file_path);
    const updated = await updateCase(id, { cover_image: url });
    await clearState(userId);
    await ctx.reply("✅ Обложка обновлена.");
    await ctx.reply(formatCaseSummary(updated), { reply_markup: caseDetailKeyboard(updated) });
    return;
  }

  const text = ctx.message?.text?.trim();
  if (!text) return void (await ctx.reply("Пожалуйста, отправьте текст."));

  const patch: Partial<CaseInput> = {};
  if (field === "t") patch.title = text;
  if (field === "s") patch.subtitle = text === "-" ? null : text;
  if (field === "d") patch.description = text;
  if (field === "g") patch.tags = text === "-" ? [] : text.split(",").map((t) => t.trim()).filter(Boolean);
  if (field === "p") patch.project_url = text === "-" ? null : text;

  try {
    const updated = await updateCase(id, patch);
    await clearState(userId);
    await ctx.reply("✅ Обновлено.");
    await ctx.reply(formatCaseSummary(updated), { reply_markup: caseDetailKeyboard(updated) });
  } catch (err: any) {
    await ctx.reply(`⚠️ Не удалось сохранить: ${err.message ?? "неизвестная ошибка"}`);
  }
}

