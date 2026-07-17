"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { PropertyCard } from "@/components/properties/property-card";
import type { Property } from "@/shared/schema";
import { cn } from "@/lib/utils";

type Props = {
  properties: Property[];
  title?: string;
  subtitle?: string;
};

export function RelatedPropertiesCarousel({
  properties,
  title = "Imóveis que podem interessar",
  subtitle = "Selecionados por proximidade, comodidades e faixa de valor.",
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  function updateEdges() {
    const el = scrollerRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }

  useEffect(() => {
    updateEdges();
    const onResize = () => updateEdges();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [properties]);

  if (!properties.length) return null;

  function scrollBy(direction: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.min(340, el.clientWidth * 0.8);
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  return (
    <section className="relative overflow-hidden border-t border-border">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(15,90,120,0.08),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-secondary/40 to-transparent" />

      <div className="relative container py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              <Sparkles className="h-3.5 w-3.5" />
              Relacionados
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          </div>

          <div className="hidden shrink-0 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={atStart}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition",
                atStart
                  ? "cursor-default border-border/60 opacity-40"
                  : "border-border hover:border-brand/40 hover:bg-brand/5"
              )}
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={atEnd}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition",
                atEnd
                  ? "cursor-default border-border/60 opacity-40"
                  : "border-border hover:border-brand/40 hover:bg-brand/5"
              )}
              aria-label="Próximo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent transition sm:w-12",
              atStart && "opacity-0"
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent transition sm:w-12",
              atEnd && "opacity-0"
            )}
          />

          <div
            ref={scrollerRef}
            onScroll={updateEdges}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {properties.map((property) => (
              <div
                key={property.id}
                className="w-[min(310px,85vw)] shrink-0 snap-start transition duration-300 hover:-translate-y-1"
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
