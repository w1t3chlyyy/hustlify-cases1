"use client";

import { openExternal, hapticTap } from "@/lib/telegram";
import MagneticButton from "@/components/MagneticButton";

export default function ViewProjectButton({ url }: { url: string }) {
  return (
    <MagneticButton
      variant="solid"
      onClick={() => {
        hapticTap("medium");
        openExternal(url);
      }}
    >
      Посмотреть проект
       <span>↗</span>
    </MagneticButton>
  );
}
