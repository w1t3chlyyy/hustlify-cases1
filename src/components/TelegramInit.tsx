"use client";

import { useEffect } from "react";
import { getTelegramWebApp } from "@/lib/telegram";

export default function TelegramInit() {
  useEffect(() => {
    const wa = getTelegramWebApp();
    if (!wa) return;
    wa.ready();
    wa.expand();
    try {
      wa.setHeaderColor("#0A0A0A");
      wa.setBackgroundColor("#0A0A0A");
    } catch {
      // older clients may not support these calls — safe to ignore
    }
  }, []);

  return null;
}
