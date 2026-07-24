import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CaseItem } from "@/types/case";
import Gallery from "@/components/Gallery";
import ViewProjectButton from "@/components/ViewProjectButton";
import PageHeaderReveal from "@/components/PageHeaderReveal";

export const revalidate = 0;

async function getCase(slug: string): Promise<CaseItem | null> {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function CaseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const item = await getCase(params.slug);
  if (!item) notFound();

  const gallery = item.images.length > 0 ? item.images : item.cover_image ? [item.cover_image] : [];

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 pb-16 pt-10">
      <Link href="/cases" className="eyebrow link-underline inline-flex items-center gap-2">
        ← все кейсы
      </Link>

      <div className="mt-6">
        <Gallery images={gallery} alt={item.title} />
      </div>

      <PageHeaderReveal>
        <div className="mt-8">
          {item.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-paper/15 px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-fog"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
            {item.title}
          </h1>
          {item.subtitle && (
            <p className="mt-2 text-base text-fog">{item.subtitle}</p>
          )}

          <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-paper/85">
            {item.description}
          </p>
        </div>
      </PageHeaderReveal>

      {item.project_url && (
        <div className="mt-10">
          <ViewProjectButton url={item.project_url} />
        </div>
      )}
    </main>
  );
}
