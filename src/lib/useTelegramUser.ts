"use client";

import { useEffect, useState } from "react";
import { getTelegramUser, TelegramUser } from "@/lib/telegram";

export function useTelegramUser(): TelegramUser | null {
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    setUser(getTelegramUser());
  }, []);

  return user;
}
