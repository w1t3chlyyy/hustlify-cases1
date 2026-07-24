"use client";

import { motion } from "framer-motion";
import { useTelegramUser } from "@/lib/useTelegramUser";
import { hapticTap } from "@/lib/telegram";
import MagneticButton from "@/components/MagneticButton";

export default function HomePage() {
  const user = useTelegramUser();
  const name = user?.first_name;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="eyebrow"
      >
        {name ? `Добро пожаловать, ${name}` : "Добро пожаловать"}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="mt-5 font-display text-6xl font-semibold tracking-tightest sm:text-7xl"
      >
        Hustlify
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className="mt-4 max-w-xs text-sm text-fog"
      >
        Каждый проект здесь — закрытый заказ. Не питчи, а результат.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        className="mt-12"
      >
        <MagneticButton href="/cases" onClick={() => hapticTap("medium")}>
          Смотреть кейсы
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </MagneticButton>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 flex items-center gap-2"
      >
        <span className="h-1.5 w-1.5 animate-blink rounded-full bg-paper/60" />
        <span className="eyebrow">closed orders archive</span>
      </motion.div>
    </main>
  );
}
