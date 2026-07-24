"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

/**
 * Лёгкая обёртка для плавного появления заголовка на серверных
 * страницах (cases/page.tsx и т.п., где нельзя напрямую
 * использовать framer-motion в самом файле).
 */
export default function PageHeaderReveal({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
