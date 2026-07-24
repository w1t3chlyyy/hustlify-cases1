import { Bot } from "grammy";
import { isAdmin } from "./auth";
import { getState, setState, clearState } from "./state";
import { listCases, getCase } from "./caseService";
import { formatCaseSummary } from "./format";
import { mainMenuKeyboard, casesListKeyboard, caseDetailKeyboard } from "./keyboards";
import {
  AddStep,
  startAddFlow,
  handleAddFlowMessage,
  handleSkip,
  handleSlugAuto,
  handleGalleryDone,
  finalizeAdd,
} from "./addFlow";
import { handleEditAction, handleGalleryDoneEdit, handleEditFlowMessage } from "./editFlow";

export function registerHandlers(bot: Bot) {
  bot.command("admin", async (ctx) => {
    if (!isAdmin(ctx.from?.id)) return; // stay silent for non-admins
    await clearState(ctx.from!.id);
    await ctx.reply("👋 Админ-панель Hustlify\n\nВыберите действие:", {
      reply_markup: mainMenuKeyboard(),
    });
  });

  bot.on("callback_query:data", async (ctx) => {
    if (!isAdmin(ctx.from?.id)) {
      await ctx.answerCallbackQuery();
      return;
    }
    const userId = ctx.from!.id;
    const data = ctx.callbackQuery.data;
    await ctx.answerCallbackQuery();

    try {
      if (data === "m:menu") {
        await clearState(userId);
        await ctx.editMessageText("👋 Админ-панель Hustlify\n\nВыберите действие:", {
          reply_markup: mainMenuKeyboard(),
        });
        return;
      }

      if (data === "m:list") {
        await clearState(userId);
        const cases = await listCases();
        if (!cases.length) {
          await ctx.editMessageText("Пока нет ни одного кейса.", { reply_markup: mainMenuKeyboard() });
          return;
        }
        await ctx.editMessageText("Кейсы:", { reply_markup: casesListKeyboard(cases) });
        return;
      }

      if (data === "m:add") {
        await startAddFlow(ctx, userId);
        return;
      }

      if (data === "a:cancel") {
        await clearState(userId);
        await ctx.editMessageText("Отменено.", { reply_markup: mainMenuKeyboard() });
        return;
      }

      if (data.startsWith("a:skip:")) {
        const step = data.slice("a:skip:".length) as AddStep;
        const state = await getState(userId);
        if (state) await handleSkip(ctx, userId, step, state);
        return;
      }

      if (data === "a:slugauto") {
        const state = await getState(userId);
        if (state) await handleSlugAuto(ctx, userId, state);
        return;
      }

      if (data === "a:gal:done") {
        const state = await getState(userId);
        if (!state) return;
        if (state.step === "add:gallery") {
          await handleGalleryDone(ctx, userId, state);
        } else if (state.step.startsWith("edit:gallery:")) {
          const id = state.step.split(":")[2];
          await handleGalleryDoneEdit(ctx, userId, id);
        }
        return;
      }

      if (data === "a:pub:yes" || data === "a:pub:no") {
        const state = await getState(userId);
        if (state) await finalizeAdd(ctx, userId, data === "a:pub:yes", state);
        return;
      }

      if (data.startsWith("c:")) {
        const id = data.slice(2);
        const c = await getCase(id);
        await clearState(userId);
        if (!c) {
          await ctx.editMessageText("Кейс не найден (возможно, уже удалён).", {
            reply_markup: mainMenuKeyboard(),
          });
          return;
        }
        await ctx.editMessageText(formatCaseSummary(c), { reply_markup: caseDetailKeyboard(c) });
        return;
      }

      if (data.startsWith("e:")) {
        const [, field, id] = data.split(":");
        await handleEditAction(ctx, userId, field, id);
        return;
      }
    } catch (err) {
      console.error("[bot callback]", err);
      await ctx.reply("⚠️ Что-то пошло не так, попробуйте ещё раз.");
    }
  });

  bot.on("message", async (ctx) => {
    if (!isAdmin(ctx.from?.id)) return;
    const userId = ctx.from!.id;
    const state = await getState(userId);
    if (!state) return; // no active /admin flow — ignore free text

    try {
      if (state.step.startsWith("add:")) {
        await handleAddFlowMessage(ctx, userId, state);
        return;
      }
      if (state.step.startsWith("edit:")) {
        await handleEditFlowMessage(ctx, userId, state);
        return;
      }
    } catch (err) {
      console.error("[bot message]", err);
      await ctx.reply("⚠️ Что-то пошло не так, попробуйте ещё раз.");
    }
  });

  bot.catch((err) => {
    console.error("[bot error]", err.error);
  });
}
