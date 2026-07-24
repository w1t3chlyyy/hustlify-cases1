"use client";

import { useRef, useState, MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface MagneticButtonProps {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "solid" | "outline";
  className?: string;
}

/**
 * Кнопка, которая слегка "тянется" к курсору и заливается цветом
 * снизу вверх при наведении. Используется вместо обычных
 * hover:bg-paper переходов на CTA-элементах.
 */
export default function MagneticButton({
  href,
  onClick,
  children,
  variant = "outline",
  className = "",
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      x: (e.clientX - rect.left - rect.width / 2) * 0.2,
      y: (e.clientY - rect.top - rect.height / 2) * 0.3,
    });
  };

  const reset = () => setPos({ x: 0, y: 0 });

  const base =
    "group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-full px-8 py-4 font-display text-sm font-medium uppercase tracking-widest transition-[letter-spacing,color] duration-300";

  const solid = "bg-paper text-ink";
  const outline = "border border-paper/25 text-paper";

  const inner = (
    <span
      className={`${base} ${variant === "solid" ? solid : outline} ${className} hover:tracking-[0.22em] ${
        variant === "outline" ? "hover:text-ink hover:border-paper" : ""
      }`}
    >
      {variant === "outline" && (
        <span className="absolute inset-0 -z-10 translate-y-full bg-paper transition-transform duration-300 ease-out group-hover:translate-y-0" />
      )}
      {children}
    </span>
  );

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 12, mass: 0.3 }}
      whileTap={{ scale: 0.97 }}
      className="inline-block w-full sm:w-auto"
    >
      {href ? (
        <Link href={href} onClick={onClick}>
          {inner}
        </Link>
      ) : (
        <button onClick={onClick} className="w-full">
          {inner}
        </button>
      )}
    </motion.div>
  );
}
