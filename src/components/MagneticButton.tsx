"use client";

import { ReactNode } from "react";
import Link from "next/link";

interface MagneticButtonProps {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "solid" | "outline";
  className?: string;
}

/**
 * Кнопка со стилем From Uiverse.io by JaydipPrajapati1910:
 * тёмная заливка, которая при наведении сменяется светлой заливкой
 * слева направо (::before растёт по ширине).
 */
export default function MagneticButton({
  href,
  onClick,
  children,
  className = "",
}: MagneticButtonProps) {
  const classes = `uiverse-btn group w-full sm:w-auto ${className}`.trim();

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
