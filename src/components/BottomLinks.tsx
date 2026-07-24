"use client";

import { openExternal, hapticTap } from "@/lib/telegram";
import MagneticButton from "@/components/MagneticButton";

export default function BottomLinks() {
  const botUrl = process.env.NEXT_PUBLIC_BOT_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!botUrl && !siteUrl) return null;

  return (
    <div className="mx-auto mt-14 flex max-w-md flex-col gap-3 sm:flex-row">
      {botUrl && (
        <MagneticButton
          className="text-xs !py-3.5"
          onClick={() => {
            hapticTap();
            openExternal(botUrl);
          }}
        >
          Перейти в бота
        </MagneticButton>
      )}
      {siteUrl && (
        <MagneticButton
          className="text-xs !py-3.5"
          onClick={() => {
            hapticTap();
            openExternal(siteUrl);
          }}
        >
          Сайт сервиса
        </MagneticButton>
      )}
    </div>
  );
}
