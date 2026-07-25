import { InlineKeyboard } from "grammy";
import { CaseItem } from "@/types/case";
import type { AddStep } from "./addFlow";
import type { WelcomeButton } from "./welcomeService";

export function mainMenuKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("📋 Список кейсов", "m:list")
    .row()
    .text("➕ Добавить кейс", "m:add")
    .row()
    .text("⚙️ Приветствие (/start)", "m:welcome");
}

export function welcomeSettingsKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("✏️ Текст", "w:text")
    .row()
    .text("🖼 Фото", "w:photo")
    .row()
    .text("🔘 Кнопки", "w:buttons")
    .row()
    .text("👁 Предпросмотр", "w:preview")
    .row()
    .text("⬅️ В меню", "m:menu");
}

export function welcomeButtonsKeyboard(buttons: WelcomeButton[]): InlineKeyboard {
  const kb = new InlineKeyboard();
  buttons.forEach((b, i) => {
    kb.text(`🗑 ${b.label}`, `w:btn:del:${i}`).row();
  });
  kb.text("➕ Добавить кнопку", "w:btn:add").row();
  kb.text("⬅️ Назад", "w:menu");
  return kb;
}

/** Builds an inline keyboard of link-buttons from stored welcome settings, or undefined if there are none. */
export function buttonsToKeyboard(buttons: WelcomeButton[]): InlineKeyboard | undefined {
  if (!buttons.length) return undefined;
  const kb = new InlineKeyboard();
  buttons.forEach((b, i) => {
    kb.url(b.label, b.url);
    if (i < buttons.length - 1) kb.row();
  });
  return kb;
}

export function cancelKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text("❌ Отмена", "a:cancel");
}

export function skipCancelKeyboard(step: AddStep): InlineKeyboard {
  return new InlineKeyboard()
    .text("⏭ Пропустить", `a:skip:${step}`)
    .row()
    .text("❌ Отмена", "a:cancel");
}

export function slugChoiceKeyboard(suggested: string): InlineKeyboard {
  return new InlineKeyboard()
    .text(`Использовать «${suggested}»`, "a:slugauto")
    .row()
    .text("❌ Отмена", "a:cancel");
}

export function publishChoiceKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("✅ Опубликовать сейчас", "a:pub:yes")
    .text("🙈 Черновик", "a:pub:no");
}

export function galleryDoneKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text("✅ Готово", "a:gal:done").row().text("❌ Отмена", "a:cancel");
}

export function casesListKeyboard(cases: CaseItem[]): InlineKeyboard {
  const kb = new InlineKeyboard();
  for (const c of cases) {
    const mark = c.is_published ? "🟢" : "⚪️";
    kb.text(`${mark} ${c.title}`, `c:${c.id}`).row();
  }
  kb.text("⬅️ В меню", "m:menu");
  return kb;
}

export function caseDetailKeyboard(c: CaseItem): InlineKeyboard {
  return new InlineKeyboard()
    .text("✏️ Заголовок", `e:t:${c.id}`)
    .text("✏️ Подзаголовок", `e:s:${c.id}`)
    .row()
    .text("✏️ Описание", `e:d:${c.id}`)
    .text("✏️ Теги", `e:g:${c.id}`)
    .row()
    .text("✏️ Ссылка", `e:p:${c.id}`)
    .text("🖼 Обложка", `e:cv:${c.id}`)
    .row()
    .text("🖼➕ Галерея", `e:gl:${c.id}`)
    .row()
    .text(c.is_published ? "🙈 Скрыть" : "✅ Опубликовать", `e:pub:${c.id}`)
    .row()
    .text("🗑 Удалить", `e:del:${c.id}`)
    .row()
    .text("⬅️ К списку", "m:list");
}

export function confirmDeleteKeyboard(id: string): InlineKeyboard {
  return new InlineKeyboard()
    .text("✅ Да, удалить", `e:delY:${id}`)
    .text("❌ Отмена", `c:${id}`);
}
