export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation?: () => void;
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    selectionChanged: () => void;
  };
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  initDataUnsafe?: {
    user?: TelegramUser;
  };
  colorScheme: "light" | "dark";
  themeParams?: Record<string, string>;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

export function getTelegramUser(): TelegramUser | null {
  const wa = getTelegramWebApp();
  return wa?.initDataUnsafe?.user ?? null;
}

export function hapticTap(style: "light" | "medium" | "heavy" = "light") {
  getTelegramWebApp()?.HapticFeedback?.impactOccurred(style);
}

/** Opens a URL, using Telegram's own navigation when running inside the MiniApp. */
export function openExternal(url: string) {
  const wa = getTelegramWebApp();
  if (wa) {
    if (url.includes("t.me/")) {
      wa.openTelegramLink(url);
    } else {
      wa.openLink(url);
    }
  } else if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
