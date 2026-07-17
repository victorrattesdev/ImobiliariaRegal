"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  title: string;
};

export function PropertyGallery({ images, title }: Props) {
  const photos = (Array.isArray(images) ? images : []).filter(Boolean);
  const list = photos.length
    ? photos
    : ["/assets/generated_images/Luxury_house_hero_image_f495f766.png"];
  const [lightbox, setLightbox] = useState<number | null>(null);

  const main = list[0];
  const side = list.slice(1, 5);
  const extra = Math.max(0, list.length - 5);

  function openAt(index: number) {
    setLightbox(index);
  }

  function move(delta: number) {
    if (lightbox === null) return;
    const next = (lightbox + delta + list.length) % list.length;
    setLightbox(next);
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-xl bg-secondary">
        <div className="grid gap-2 md:grid-cols-4 md:grid-rows-2 md:h-[420px] lg:h-[480px]">
          <button
            type="button"
            onClick={() => openAt(0)}
            className="relative col-span-1 row-span-1 h-64 overflow-hidden md:col-span-2 md:row-span-2 md:h-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={main}
              alt={title}
              className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
            />
          </button>

          {side.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => openAt(i + 1)}
              className={cn(
                "relative hidden overflow-hidden md:block",
                i >= 2 && side.length < 4 ? "md:col-span-1" : ""
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
              />
              {i === side.length - 1 && extra > 0 && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
                  +{extra} fotos
                </span>
              )}
            </button>
          ))}

          {side.length === 0 && (
            <div className="hidden bg-secondary md:col-span-2 md:row-span-2 md:block" />
          )}
        </div>

        <button
          type="button"
          onClick={() => openAt(0)}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-panel"
        >
          <Images className="h-4 w-4" />
          Ver todas as fotos
        </button>
      </div>

      {lightbox !== null && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setLightbox(null)}
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => move(-1)}
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={list[lightbox]}
            alt={`${title} — foto ${lightbox + 1}`}
            className="max-h-[85vh] max-w-[92vw] rounded-lg object-contain"
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => move(1)}
            aria-label="Próxima"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <p className="absolute bottom-6 text-sm text-white/80">
            {lightbox + 1} / {list.length}
          </p>
        </div>
      )}
    </>
  );
}
