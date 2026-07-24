import "server-only";
import { Bot } from "grammy";
import { registerHandlers } from "./handlers";

// Created lazily (on first webhook request) rather than at module load time,
// so that `next build` doesn't fail just because TELEGRAM_BOT_TOKEN isn't
// present in the build environment.
let botInstance: Bot | undefined;

export function getBot(): Bot {
  if (botInstance) return botInstance;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN не задан в переменных окружения.");
  }

  botInstance = new Bot(token);
  registerHandlers(botInstance);
  return botInstance;
}
