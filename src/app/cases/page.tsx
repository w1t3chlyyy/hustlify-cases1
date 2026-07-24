import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CaseItem } from "@/types/case";
import CaseCard from "@/components/CaseCard";
import BottomLinks from "@/components/BottomLinks";
import PageHeaderReveal from "@/components/PageHeaderReveal";

export const revalidate = 0;

async function getCases(): Promise<CaseItem[]> {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data ?? [];
}

export default async function CasesPage() {
  const cases = await getCases();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 pb-24 pt-10">
      <PageHeaderReveal>
        <div className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="link-underline font-display text-xl font-semibold tracking-tightest"
          >
            Hustlify
          </Link>
          <span className="eyebrow">{cases.length} closed</span>
        </div>

        <h1 className="mb-8 font-display text-3xl font-semibold leading-tight sm:text-4xl">
          Кейсы
        </h1>
      </PageHeaderReveal>

      {cases.length === 0 ? (
        <p className="rounded-2xl border border-paper/10 p-8 text-center text-fog">
          Кейсов пока нет — загляните позже.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {cases.map((item, i) => (
            <CaseCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}

      <BottomLinks />
    </main>
  );
}
