"use client";

import Ferrofluid from "@/components/Ferrofluid";

export default function AppBackground() {
  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <Ferrofluid
        className="h-full w-full"
        dpr={typeof window !== "undefined" ? window.devicePixelRatio : 1}
        mixBlendMode="normal"
        colors={["#ffffff", "#ffffff", "#ffffff"]}
        speed={0.5}
        scale={1.6}
        turbulence={1}
        fluidity={0.1}
        rimWidth={0.2}
        sharpness={2.5}
        shimmer={1.5}
        glow={2}
        flowDirection="down"
        opacity={1}
        mouseInteraction
        mouseStrength={1}
        mouseRadius={0.35}
      />
    </div>
  );
}