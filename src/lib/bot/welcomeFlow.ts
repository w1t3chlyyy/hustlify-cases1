import { Context } from "grammy";
import { setState, clearState, BotState } from "./state";
import { getWelcomeSettings, updateWelcomeSettings, WelcomeButton } from "./welcomeService";
import {
  cancelKeyboard,
  welcomeSettingsKeyboard,
  welcomeButtonsKeyboard,
  buttonsToKeyboard,
} from "./keyboards";

function formatSettingsSummary(text: string, photo: string | null, buttons: WelcomeButton[]): string {
  return [
    "⚙️ Настройки приветствия (/start)",
    "",
    `Фото: ${photo ? "есть" : "нет"}`,
    `Кнопок: ${buttons.length}`,
    "",
    "Текущий текст:",
    text,
  ].join("\n");
}

export async function showWelcomeMenu(ctx: Context, userId: number) {
  await clearState(userId);
  const s = await getWelcomeSettings();
  await ctx.editMessageText(formatSettingsSummary(s.text, s.photo_url, s.buttons), {
    reply_markup: welcomeSettingsKeyboard(),
  });
}

export async function startEditText(ctx: Context, userId: number) {
  await setState(userId, "welcome:text", {});
  await ctx.reply("Отправьте новый текст приветствия:", { reply_markup: cancelKeyboard() });
}

export async function startEditPhoto(ctx: Context, userId: number) {
  await setState(userId, "welcome:photo", {});
  await ctx.reply(
    "Отправьте новое фото для приветствия (или отправьте «-», чтобы убрать фото):",
    { reply_markup: cancelKeyboard() }
  );
}

export async function showButtonsMenu(ctx: Context, userId: number) {
  await clearState(userId);
  const s = await getWelcomeSettings();
  const text = s.buttons.length
    ? "Кнопки приветствия (нажмите, чтобы удалить):"
    : "Кнопок пока нет.";
  await ctx.editMessageText(text, { reply_markup: welcomeButtonsKeyboard(s.buttons) });
}

export async function startAddButton(ctx: Context, userId: number) {
  await setState(userId, "welcome:btn_label", {});
  await ctx.reply("Введите текст кнопки:", { reply_markup: cancelKeyboard() });
}

export async function deleteButton(ctx: Context, userId: number, index: number) {
  const s = await getWelcomeSettings();
  const buttons = s.buttons.filter((_, i) => i !== index);
  await updateWelcomeSettings({ buttons });
  await showButtonsMenu(ctx, userId);
}

export async function showPreview(ctx: Context, userId: number) {
  const s = await getWelcomeSettings();
  const kb = buttonsToKeyboard(s.buttons);
  if (s.photo_url) {
    await ctx.replyWithPhoto(s.photo_url, { caption: s.text, reply_markup: kb });
  } else {
    await ctx.reply(s.text, { reply_markup: kb });
  }
  await showWelcomeMenuAsNewMessage(ctx, userId);
}

async function showWelcomeMenuAsNewMessage(ctx: Context, userId: number) {
  await clearState(userId);
  const s = await getWelcomeSettings();
  await ctx.reply(formatSettingsSummary(s.text, s.photo_url, s.buttons), {
    reply_markup: welcomeSettingsKeyboard(),
  });
}

export async function handleWelcomeFlowMessage(ctx: Context, userId: number, state: BotState) {
  const step = state.step;

  if (step === "welcome:text") {
    const text = ctx.message?.text?.trim();
    if (!text) return void (await ctx.reply("Пожалуйста, отправьте текст."));
    await updateWelcomeSettings({ text });
    await clearState(userId);
    await ctx.reply("✅ Текст приветствия обновлён.");
    await showWelcomeMenuAsNewMessage(ctx, userId);
    return;
  }

  if (step === "welcome:photo") {
    const dash = ctx.message?.text?.trim();
    if (dash === "-") {
      await updateWelcomeSettings({ photo_url: null });
      await clearState(userId);
      await ctx.reply("✅ Фото убрано.");
      await showWelcomeMenuAsNewMessage(ctx, userId);
      return;
    }
    const photo = ctx.message?.photo?.at(-1);
    if (!photo) return void (await ctx.reply("Пришлите фото или «-», чтобы убрать текущее."));
    // Store the Telegram file_id directly — no need to re-upload to Storage,
    // sendPhoto/replyWithPhoto accept file_id as-is.
    await updateWelcomeSettings({ photo_url: photo.file_id });
    await clearState(userId);
    await ctx.reply("✅ Фото приветствия обновлено.");
    await showWelcomeMenuAsNewMessage(ctx, userId);
    return;
  }

  if (step === "welcome:btn_label") {
    const label = ctx.message?.text?.trim();
    if (!label) return void (await ctx.reply("Пожалуйста, отправьте текст кнопки."));
    await setState(userId, "welcome:btn_url", { label });
    await ctx.reply("Теперь отправьте ссылку (URL) для этой кнопки:", {
      reply_markup: cancelKeyboard(),
    });
    return;
  }

  if (step === "welcome:btn_url") {
    const url = ctx.message?.text?.trim();
    if (!url || !/^https?:\/\//i.test(url)) {
      return void (await ctx.reply("Ссылка должна начинаться с http:// или https://. Попробуйте ещё раз:"));
    }
    const label = state.data.label as string;
    const s = await getWelcomeSettings();
    await updateWelcomeSettings({ buttons: [...s.buttons, { label, url }] });
    await clearState(userId);
    await ctx.reply(`✅ Кнопка «${label}» добавлена.`);
    await showWelcomeMenuAsNewMessage(ctx, userId);
    return;
  }
}
