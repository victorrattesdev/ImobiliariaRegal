"use client";

import { useState } from "react";
import { Check, ChevronDown, Filter, RotateCcw } from "lucide-react";
import { PROPERTY_TYPES } from "@/lib/constants";
import {
  formatAmenity,
  formatCurrency,
  formatIntegerBR,
  parseIntegerBR,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export type ListingFilters = {
  priceMin: number;
  priceMax: number;
  location: string;
  propertyType: string;
  beds: string;
  baths: string;
  amenities: string[];
};

export const MAX_PRICE_SALE = 5_000_000;
export const MAX_PRICE_RENT = 50_000;

export const DEFAULT_FILTERS: ListingFilters = {
  priceMin: 0,
  priceMax: MAX_PRICE_SALE,
  location: "",
  propertyType: "",
  beds: "",
  baths: "",
  amenities: [],
};

type Props = {
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
  onReset: () => void;
  listingType?: "sale" | "rent";
  hideLocation?: boolean;
  availableAmenities?: string[];
};

const fieldClass =
  "h-11 w-full appearance-none rounded-xl border border-border bg-card px-3.5 text-sm font-medium outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

export function FilterPanel({
  filters,
  onChange,
  onReset,
  listingType = "sale",
  hideLocation = false,
  availableAmenities = [],
}: Props) {
  const [open, setOpen] = useState(true);
  const maxPrice = listingType === "rent" ? MAX_PRICE_RENT : MAX_PRICE_SALE;
  const step = listingType === "rent" ? 500 : 25_000;

  function update<K extends keyof ListingFilters>(
    key: K,
    value: ListingFilters[K]
  ) {
    onChange({ ...filters, [key]: value });
  }

  function setPrice(kind: "min" | "max", raw: string) {
    const parsed = Math.min(maxPrice, Math.max(0, parseIntegerBR(raw)));
    if (kind === "min") {
      update("priceMin", Math.min(parsed, filters.priceMax));
    } else {
      update("priceMax", Math.max(parsed, filters.priceMin || 0));
    }
  }

  function toggleAmenity(value: string) {
    const next = filters.amenities.includes(value)
      ? filters.amenities.filter((a) => a !== value)
      : [...filters.amenities, value];
    update("amenities", next);
  }

  const activeCount =
    (!hideLocation && filters.location ? 1 : 0) +
    (filters.propertyType ? 1 : 0) +
    (filters.beds ? 1 : 0) +
    (filters.baths ? 1 : 0) +
    (filters.priceMin > 0 || filters.priceMax < maxPrice ? 1 : 0) +
    filters.amenities.length;

  const body = (
    <div className="space-y-5">
      {!hideLocation && (
        <label className="block space-y-2 text-sm">
          <span className="font-semibold text-foreground">Localização</span>
          <input
            value={filters.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="Cidade, bairro ou região"
            className={fieldClass}
          />
        </label>
      )}

      <div className="space-y-3 text-sm">
        <span className="font-semibold text-foreground">Faixa de preço</span>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Mínimo
            </span>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                R$
              </span>
              <input
                inputMode="numeric"
                value={formatIntegerBR(filters.priceMin)}
                onChange={(e) => setPrice("min", e.target.value)}
                placeholder="0"
                className={cn(fieldClass, "pl-9")}
              />
            </div>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Máximo
            </span>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                R$
              </span>
              <input
                inputMode="numeric"
                value={formatIntegerBR(filters.priceMax)}
                onChange={(e) => setPrice("max", e.target.value)}
                placeholder={formatIntegerBR(maxPrice)}
                className={cn(fieldClass, "pl-9")}
              />
            </div>
          </label>
        </div>
        <input
          type="range"
          min={0}
          max={maxPrice}
          step={step}
          value={Math.min(filters.priceMax, maxPrice)}
          onChange={(e) =>
            update(
              "priceMax",
              Math.max(filters.priceMin, Number(e.target.value))
            )
          }
          className="w-full accent-[hsl(var(--brand))]"
        />
        <div className="flex justify-between text-xs font-semibold text-muted-foreground">
          <span>{formatCurrency(filters.priceMin)}</span>
          <span>
            até {formatCurrency(Math.min(filters.priceMax, maxPrice))}
          </span>
        </div>
      </div>

      <label className="block space-y-2 text-sm">
        <span className="font-semibold">Tipo de imóvel</span>
        <select
          value={filters.propertyType}
          onChange={(e) => update("propertyType", e.target.value)}
          className={fieldClass}
        >
          <option value="">Todos os tipos</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="space-y-2">
          <span className="font-semibold">Quartos</span>
          <select
            value={filters.beds}
            onChange={(e) => update("beds", e.target.value)}
            className={fieldClass}
          >
            <option value="">Qualquer</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={String(n)}>
                {n}+
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="font-semibold">Banheiros</span>
          <select
            value={filters.baths}
            onChange={(e) => update("baths", e.target.value)}
            className={fieldClass}
          >
            <option value="">Qualquer</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={String(n)}>
                {n}+
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-3 text-sm">
        <span className="font-semibold">Comodidades</span>
        {availableAmenities.length === 0 ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            As comodidades aparecem aqui conforme forem cadastradas nos
            imóveis.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableAmenities.map((value) => {
              const active = filters.amenities.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleAmenity(value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    active
                      ? "border-brand bg-brand/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground"
                  )}
                >
                  {active && <Check className="h-3.5 w-3.5 text-brand" />}
                  {formatAmenity(value)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Mobile */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5 shadow-panel"
        >
          <span className="inline-flex items-center gap-2 text-sm font-bold">
            <Filter className="h-4 w-4 text-brand" />
            Filtros
            {activeCount > 0 && (
              <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand">
                {activeCount}
              </span>
            )}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition",
              open && "rotate-180"
            )}
          />
        </button>
        {open && (
          <div className="mt-3 rounded-2xl border border-border bg-card p-5 shadow-panel">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Limpar
              </button>
            </div>
            {body}
          </div>
        )}
      </div>

      {/* Desktop — full panel, no overflow trap on selects */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 shadow-panel">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-brand" />
              <h2 className="text-base font-bold">Filtros</h2>
              {activeCount > 0 && (
                <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand">
                  {activeCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpar
            </button>
          </div>
          {body}
        </div>
      </aside>
    </div>
  );
}
