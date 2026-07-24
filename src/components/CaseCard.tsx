"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CaseItem } from "@/types/case";

export default function CaseCard({ item, index }: { item: CaseItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.6, delay: (index % 6) * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/cases/${item.slug}`}
        className="group relative block overflow-hidden rounded-2xl border border-paper/10 bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 hover:border-paper/40 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-line">
          {item.cover_image ? (
            <Image
              src={item.cover_image}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, 480px"
              className="object-cover grayscale transition-all duration-700 ease-out group-hover:scale-[1.05] group-hover:grayscale-0"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-fog">
              no image
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80" />
          <span className="absolute left-4 top-4 font-mono text-xs text-paper/70">
            №{String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 p-5">
          <div>
            <h3 className="font-display text-lg font-semibold leading-tight transition-[letter-spacing] duration-300 group-hover:tracking-wide">
              {item.title}
            </h3>
            {item.subtitle && (
              <p className="mt-1 text-sm text-fog">{item.subtitle}</p>
            )}
          </div>
          <span className="mt-1 shrink-0 font-mono text-lg text-paper/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-paper">
            →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
