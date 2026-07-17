"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import {
  Bath,
  BedDouble,
  Car,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import type { Property } from "@/shared/schema";
import { PriceDisplay } from "@/components/properties/price-display";
import { formatArea, formatListingType } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  property: Property;
  preview?: boolean;
};

function locationLine(property: Property) {
  const address = property.address?.trim();
  const city = property.city?.trim();
  if (address && city) return `${address} · ${city}`;
  if (address) return address;
  return city || property.location || "Localização sob consulta";
}

export function PropertyCard({ property, preview = false }: Props) {
  const images =
    property.images?.length > 0
      ? property.images
      : ["/assets/generated_images/Luxury_house_hero_image_f495f766.png"];
  const [index, setIndex] = useState(0);
  const current = images[Math.min(index, images.length - 1)];

  function go(delta: number, e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev + delta + images.length) % images.length);
  }

  const media = (
    <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current}
        alt={property.title}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
      />
      <div className="absolute left-3 top-3 z-10">
        <span className="rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-foreground shadow-sm">
          {formatListingType(property.listingType)}
        </span>
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => go(-1, e)}
            className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-100 backdrop-blur-sm transition hover:bg-black/65 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => go(1, e)}
            className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-100 backdrop-blur-sm transition hover:bg-black/65 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Próxima foto"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {images.slice(0, 8).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={cn(
                  "h-1.5 rounded-full transition",
                  i === index
                    ? "w-4 bg-white"
                    : "w-1.5 bg-white/55 hover:bg-white/80"
                )}
                aria-label={`Foto ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  const body = (
    <div className="space-y-2 p-4">
      <h3 className="line-clamp-1 text-sm font-medium leading-snug text-muted-foreground">
        {property.title}
      </h3>

      <PriceDisplay
        price={property.price}
        listingType={property.listingType}
        size="card"
      />

      <p className="line-clamp-1 text-[13px] leading-snug text-muted-foreground">
        {locationLine(property)}
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[13px] font-medium text-foreground/80">
        <span className="inline-flex items-center gap-1">
          <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
          {property.bedrooms}
        </span>
        <span className="inline-flex items-center gap-1">
          <Bath className="h-3.5 w-3.5 text-muted-foreground" />
          {property.bathrooms}
        </span>
        <span className="inline-flex items-center gap-1">
          <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
          {formatArea(property.sqft)}
        </span>
        {(property.carSpaces ?? 0) > 0 && (
          <span className="inline-flex items-center gap-1">
            <Car className="h-3.5 w-3.5 text-muted-foreground" />
            {property.carSpaces}
          </span>
        )}
      </div>
    </div>
  );

  if (preview) {
    return (
      <div className="group overflow-hidden rounded-xl border border-border bg-card">
        {media}
        {body}
      </div>
    );
  }

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card transition duration-200 hover:shadow-panel">
      <div className="relative">{media}</div>
      <Link href={`/imovel/${property.id}`} className="block">
        {body}
      </Link>
    </article>
  );
}
