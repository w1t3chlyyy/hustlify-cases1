import { Context, InlineKeyboard } from "grammy";
import { CaseInput } from "@/types/case";
import { setState, clearState, BotState } from "./state";
import { createCase, slugify, uploadPhotoFromTelegram } from "./caseService";
import {
  cancelKeyboard,
  skipCancelKeyboard,
  slugChoiceKeyboard,
  publishChoiceKeyboard,
  galleryDoneKeyboard,
  mainMenuKeyboard,
} from "./keyboards";

export const ADD_STEPS = [
  "title",
  "slug",
  "subtitle",
  "description",
  "tags",
  "project_url",
  "cover",
  "gallery",
  "publish",
] as const;

export type AddStep = (typeof ADD_STEPS)[number];

const OPTIONAL_STEPS = new Set<AddStep>([
  "subtitle",
  "tags",
  "project_url",
  "cover",
  "gallery",
]);

const QUESTIONS: Record<AddStep, string> = {
  title: "Введите заголовок кейса:",
  slug: "",
  subtitle: "Введите подзаголовок (короткая фраза для карточки):",
  description: "Введите полное описание кейса:",
  tags: "Введите теги через запятую (например: Дизайн, Веб, Брендинг):",
  project_url: "Отправьте ссылку на проект (кнопка «Посмотреть проект»):",
  cover: "Отправьте обложку кейса (фото):",
  gallery:
    "Отправьте фото для галереи — можно несколько подряд. Когда закончите — нажмите «Готово».",
  publish: "Опубликовать кейс сразу или сохранить как черновик?",
};

function nextAddStep(step: AddStep): AddStep {
  return ADD_STEPS[ADD_STEPS.indexOf(step) + 1];
}

export async function startAddFlow(ctx: Context, userId: number) {
  await setState(userId, "add:title", {});
  await ctx.reply(`➕ Новый кейс\n\n${QUESTIONS.title}`, { reply_markup: cancelKeyboard() });
}

async function promptStep(ctx: Context, step: AddStep, data: Record<string, any>) {
  if (step === "slug") {
    const suggested: string = data._suggestedSlug ?? slugify(data.title ?? "");
    await ctx.reply(
      `Слаг для ссылки — предложенный вариант: ${suggested}\n\nОтправьте свой вариант текстом или нажмите кнопку ниже.`,
      { reply_markup: slugChoiceKeyboard(suggested) }
    );
    return;
  }
  if (step === "publish") {
    await ctx.reply(QUESTIONS.publish, { reply_markup: publishChoiceKeyboard() });
    return;
  }
  const kb = OPTIONAL_STEPS.has(step) ? skipCancelKeyboard(step) : cancelKeyboard();
  await ctx.reply(QUESTIONS[step], { reply_markup: kb });
}

async function goToNextStep(
  ctx: Context,
  userId: number,
  currentStep: AddStep,
  data: Record<string, any>
) {
  const next = nextAddStep(currentStep);
  if (next === "gallery") data.images = data.images ?? [];
  await setState(userId, `add:${next}`, data);
  await promptStep(ctx, next, data);
}

export async function handleAddFlowMessage(ctx: Context, userId: number, state: BotState) {
  const step = state.step.slice("add:".length) as AddStep;
  const data = state.data;
  const text = ctx.message?.text?.trim();

  switch (step) {
    case "title": {
      if (!text) return void (await ctx.reply("Пожалуйста, отправьте текст заголовка."));
      data.title = text;
      data._suggestedSlug = slugify(text);
      await setState(userId, "add:slug", data);
      await promptStep(ctx, "slug", data);
      return;
    }
    case "slug": {
      if (!text) return void (await ctx.reply("Отправьте текст для слага."));
      data.slug = slugify(text);
      delete data._suggestedSlug;
      await goToNextStep(ctx, userId, "slug", data);
      return;
    }
    case "subtitle": {
      data.subtitle = text || null;
      await goToNextStep(ctx, userId, "subtitle", data);
      return;
    }
    case "description": {
      if (!text) return void (await ctx.reply("Пожалуйста, отправьте текст описания."));
      data.description = text;
      await goToNextStep(ctx, userId, "description", data);
      return;
    }
    case "tags": {
      data.tags = text ? text.split(",").map((t) => t.trim()).filter(Boolean) : [];
      await goToNextStep(ctx, userId, "tags", data);
      return;
    }
    case "project_url": {
      data.project_url = text || null;
      await goToNextStep(ctx, userId, "project_url", data);
      return;
    }
    case "cover": {
      const photo = ctx.message?.photo?.at(-1);
      if (!photo) return void (await ctx.reply("Пожалуйста, отправьте фото или нажмите «Пропустить»."));
      const file = await ctx.api.getFile(photo.file_id);
      if (!file.file_path) return void (await ctx.reply("Не удалось получить файл, попробуйте ещё раз."));
      await ctx.reply("Загружаю обложку...");
      data.cover_image = await uploadPhotoFromTelegram(file.file_path);
      await goToNextStep(ctx, userId, "cover", data);
      return;
    }
    case "gallery": {
      const photo = ctx.message?.photo?.at(-1);
      if (!photo) return void (await ctx.reply("Пришлите фото или нажмите «Готово»."));
      const file = await ctx.api.getFile(photo.file_id);
      if (!file.file_path) return void (await ctx.reply("Не удалось получить файл, попробуйте ещё раз."));
      const url = await uploadPhotoFromTelegram(file.file_path);
      data.images = data.images ?? [];
      data.images.push(url);
      await setState(userId, "add:gallery", data);
      await ctx.reply(`Добавлено (${data.images.length}). Пришлите ещё фото или нажмите «Готово».`, {
        reply_markup: galleryDoneKeyboard(),
      });
      return;
    }
    case "publish": {
      await ctx.reply("Пожалуйста, используйте кнопки ниже.", { reply_markup: publishChoiceKeyboard() });
      return;
    }
  }
}

export async function handleSkip(ctx: Context, userId: number, step: AddStep, state: BotState) {
  if (state.step !== `add:${step}`) return;
  const data = state.data;
  if (step === "subtitle") data.subtitle = null;
  if (step === "tags") data.tags = [];
  if (step === "project_url") data.project_url = null;
  if (step === "cover") data.cover_image = null;
  if (step === "gallery") data.images = data.images ?? [];
  await goToNextStep(ctx, userId, step, data);
}

export async function handleSlugAuto(ctx: Context, userId: number, state: BotState) {
  if (state.step !== "add:slug") return;
  const data = state.data;
  data.slug = data._suggestedSlug ?? slugify(data.title ?? "case");
  delete data._suggestedSlug;
  await goToNextStep(ctx, userId, "slug", data);
}

export async function handleGalleryDone(ctx: Context, userId: number, state: BotState) {
  if (state.step !== "add:gallery") return;
  await goToNextStep(ctx, userId, "gallery", state.data);
}

export async function finalizeAdd(
  ctx: Context,
  userId: number,
  publish: boolean,
  state: BotState
) {
  if (state.step !== "add:publish") return;
  const d = state.data;
  const input: CaseInput = {
    slug: d.slug,
    title: d.title,
    subtitle: d.subtitle ?? null,
    description: d.description,
    cover_image: d.cover_image ?? null,
    images: d.images ?? [],
    project_url: d.project_url ?? null,
    tags: d.tags ?? [],
    is_published: publish,
    sort_order: 0,
  };

  try {
    const created = await createCase(input);
    await clearState(userId);
    await ctx.reply(
      `✅ Кейс «${created.title}» сохранён (${publish ? "опубликован" : "черновик"}).`,
      { reply_markup: mainMenuKeyboard() }
    );
  } catch (err: any) {
    if (err?.code === "23505") {
      await ctx.reply(`⚠️ Слаг «${d.slug}» уже занят другим кейсом. Введите другой слаг:`, {
        reply_markup: cancelKeyboard(),
      });
      await setState(userId, "add:slug", d);
      return;
    }
    throw err;
  }
}
