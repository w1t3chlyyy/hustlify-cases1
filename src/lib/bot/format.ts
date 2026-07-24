import { CaseItem } from "@/types/case";

export function formatCaseSummary(c: CaseItem): string {
  const lines = [
    `📌 ${c.title}`,
    c.subtitle || null,
    "",
    `Slug: ${c.slug}`,
    `Статус: ${c.is_published ? "🟢 опубликован" : "⚪️ черновик"}`,
    c.tags.length ? `Теги: ${c.tags.join(", ")}` : "Теги: —",
    c.project_url ? `Ссылка: ${c.project_url}` : "Ссылка: —",
    `Обложка: ${c.cover_image ? "есть" : "нет"}`,
    `Фото в галерее: ${c.images.length}`,
    "",
    c.description,
  ].filter((l) => l !== null) as string[];
  return lines.join("\n");
}
