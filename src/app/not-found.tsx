import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold">Кейс не найден</h1>
      <p className="mt-2 text-fog">Возможно, он ещё не опубликован.</p>
      <Link
        href="/cases"
        className="mt-8 rounded-full border border-paper/25 px-6 py-3 font-display text-xs uppercase tracking-widest hover:border-paper"
      >
        Ко всем кейсам
      </Link>
    </main>
  );
}
