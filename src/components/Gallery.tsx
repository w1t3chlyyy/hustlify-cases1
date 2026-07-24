"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-2xl border border-paper/10 text-fog">
        Нет изображений
      </div>
    );
  }

  const go = (delta: number) => {
    setDirection(delta);
    setIndex((prev) => (prev + delta + images.length) % images.length);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) go(1);
    else if (info.offset.x > 60) go(-1);
  };

  return (
    <div>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-paper/10 bg-line">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            initial={{ x: direction >= 0 ? 80 : -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction >= 0 ? -80 : 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            className="absolute inset-0"
          >
            <Image
              src={images[index]}
              alt={`${alt} — фото ${index + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, 640px"
              className="object-cover"
              priority={index === 0}
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              aria-label="Предыдущее фото"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-paper backdrop-blur transition hover:bg-ink/90"
            >
              ←
            </button>
            <button
              aria-label="Следующее фото"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-paper backdrop-blur transition hover:bg-ink/90"
            >
              →
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`Фото ${i + 1}`}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-paper" : "w-1.5 bg-paper/25"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
