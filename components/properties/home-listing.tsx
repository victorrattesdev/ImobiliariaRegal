"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { Hero } from "@/components/layout/hero";
import {
  DEFAULT_FILTERS,
  FilterPanel,
  MAX_PRICE_RENT,
  MAX_PRICE_SALE,
  type ListingFilters,
} from "@/components/properties/filter-panel";
import { PropertyCard } from "@/components/properties/property-card";
import { LoadingBlock, Spinner } from "@/components/ui/spinner";
import { CtaLink } from "@/components/ui/cta-link";
import { BRAND, TERESOPOLIS_CITY, TERESOPOLIS_PARTNERS } from "@/lib/constants";
import type { Property } from "@/shared/schema";

type Props = {
  variant?: "default" | "teresopolis";
};

function maxFor(listingType: "sale" | "rent") {
  return listingType === "rent" ? MAX_PRICE_RENT : MAX_PRICE_SALE;
}

function buildUrl(
  listingType: "sale" | "rent",
  filters: ListingFilters,
  searchQuery: string,
  variant: "default" | "teresopolis"
) {
  const params = new URLSearchParams();
  params.set("listingType", listingType);
  params.set("limit", "48");
  params.set("sortBy", "newest");

  if (variant === "teresopolis") {
    params.set("city", TERESOPOLIS_CITY);
  } else {
    params.set("excludeCity", TERESOPOLIS_CITY);
  }

  const ceiling = maxFor(listingType);
  if (filters.priceMin > 0) params.set("minPrice", String(filters.priceMin));
  if (filters.priceMax > 0 && filters.priceMax < ceiling) {
    params.set("maxPrice", String(filters.priceMax));
  }
  if (filters.propertyType) params.set("propertyType", filters.propertyType);
  if (filters.beds) params.set("minBeds", filters.beds);
  if (filters.baths) params.set("minBaths", filters.baths);
  if (filters.amenities.length) {
    params.set(
      "amenities",
      filters.amenities.map((a) => encodeURIComponent(a)).join(",")
    );
  }

  if (filters.location && variant !== "teresopolis") {
    params.set("city", filters.location);
  }

  if (searchQuery) {
    params.set("q", searchQuery);
    return `/api/properties/search?${params.toString()}`;
  }

  return `/api/properties?${params.toString()}`;
}

export function HomeListing({ variant = "default" }: Props) {
  const [listingType, setListingType] = useState<"sale" | "rent">("sale");
  const [filters, setFilters] = useState<ListingFilters>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");

  function handleListingTypeChange(type: "sale" | "rent") {
    setListingType(type);
    setFilters((prev) => ({
      ...prev,
      priceMin: 0,
      priceMax: maxFor(type),
    }));
  }

  function handleResetFilters() {
    setFilters({
      ...DEFAULT_FILTERS,
      priceMax: maxFor(listingType),
    });
  }

  const apiUrl = useMemo(
    () => buildUrl(listingType, filters, searchQuery, variant),
    [listingType, filters, searchQuery, variant]
  );

  const amenitiesUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (variant === "teresopolis") {
      params.set("city", TERESOPOLIS_CITY);
    } else {
      params.set("excludeCity", TERESOPOLIS_CITY);
    }
    return `/api/properties/amenities?${params.toString()}`;
  }, [variant]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["properties", apiUrl],
    queryFn: async () => {
      const res = await fetch(apiUrl);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erro ao carregar");
      return json.data as Property[];
    },
  });

  const { data: availableAmenities = [] } = useQuery({
    queryKey: ["amenities", amenitiesUrl],
    queryFn: async () => {
      const res = await fetch(amenitiesUrl);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erro ao carregar");
      return json.data as string[];
    },
  });

  const amenityOptions = useMemo(() => {
    const set = new Set([...availableAmenities, ...filters.amenities]);
    return Array.from(set);
  }, [availableAmenities, filters.amenities]);

  const properties = data ?? [];

  return (
    <div className="min-h-screen">
      <SiteHeader
        listingType={listingType}
        onListingTypeChange={handleListingTypeChange}
      />
      <Hero variant={variant} onSearch={setSearchQuery} />

      {variant === "default" && (
        <div className="border-b border-border/70 bg-card">
          <div className="container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Também atendemos Teresópolis
                </p>
                <p className="text-sm text-muted-foreground">
                  Casas e apartamentos na Região Serrana, com atendimento de{" "}
                  {TERESOPOLIS_PARTNERS.label}.
                </p>
              </div>
            </div>
            <CtaLink href="/teresopolis" variant="soft" className="self-start sm:self-auto">
              Explorar a serra
              <ArrowRight className="cta-arrow h-4 w-4" />
            </CtaLink>
          </div>
        </div>
      )}

      {variant === "teresopolis" && (
        <div className="border-b border-border/70 bg-card">
          <div className="container flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Responsáveis
                </p>
                <p className="mt-1 text-sm font-bold text-foreground">
                  {TERESOPOLIS_PARTNERS.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {TERESOPOLIS_PARTNERS.names.map((name) => (
                  <span
                    key={name}
                    className="rounded-full border border-brand/25 bg-brand/10 px-3.5 py-1.5 text-sm font-bold text-foreground"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 self-start rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-brand/40 hover:bg-brand/5 sm:self-auto"
            >
              Ver capital
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      <main className="container py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="w-full shrink-0 lg:w-80">
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
              listingType={listingType}
              hideLocation={variant === "teresopolis"}
              availableAmenities={amenityOptions}
            />
          </div>

          <section className="min-w-0 flex-1 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {variant === "teresopolis"
                    ? TERESOPOLIS_PARTNERS.label
                    : "Portfólio"}
                </p>
                <h2 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Imóveis para {listingType === "sale" ? "venda" : "aluguel"}
                  {variant === "teresopolis" ? " em Teresópolis" : ""}
                </h2>
              </div>
              <p className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3.5 py-2 text-base font-semibold text-muted-foreground">
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="text-brand" />
                    Carregando…
                  </>
                ) : (
                  `${properties.length} ${properties.length === 1 ? "resultado" : "resultados"}`
                )}
              </p>
            </div>

            {searchQuery && (
              <p className="rounded-xl bg-secondary/70 px-4 py-3 text-sm text-muted-foreground">
                Resultados para{" "}
                <span className="font-medium text-foreground">
                  &ldquo;{searchQuery}&rdquo;
                </span>
              </p>
            )}

            {isError && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
                <p className="font-medium text-destructive">
                  Não foi possível carregar os imóveis.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Verifique a conexão com o banco e tente novamente.
                </p>
              </div>
            )}

            {isLoading && <LoadingBlock label="Buscando imóveis…" />}

            {!isLoading && !isError && properties.length === 0 && (
              <div className="rounded-xl border border-dashed p-12 text-center">
                <p className="text-xl font-bold">Nenhum imóvel encontrado</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ajuste os filtros ou cadastre novos imóveis no painel admin.
                </p>
              </div>
            )}

            {!isLoading && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}

            {variant === "default" && !isLoading && (
              <Link
                href="/teresopolis"
                className="group flex items-center justify-between gap-4 rounded-2xl border border-dashed border-border bg-secondary/40 px-5 py-4 transition hover:border-brand/30 hover:bg-brand/5"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-brand" />
                  <div>
                    <p className="text-sm font-bold">
                      Quer ver opções em Teresópolis?
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Abra o portfólio da serra sem sair do fluxo de busca.
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            )}

            {variant === "teresopolis" && !isLoading && (
              <Link
                href="/"
                className="group flex items-center justify-between gap-4 rounded-2xl border border-dashed border-border bg-secondary/40 px-5 py-4 transition hover:border-brand/30 hover:bg-brand/5"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-brand" />
                  <div>
                    <p className="text-sm font-bold">
                      Quer ver opções no Rio de Janeiro?
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Abra o portfólio da capital com a mesma curadoria.
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            )}
          </section>
        </div>
      </main>

      <footer className="mt-8 border-t bg-primary text-primary-foreground">
        <div className="container flex flex-col gap-4 py-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {variant === "teresopolis" ? (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={TERESOPOLIS_PARTNERS.logo}
                    alt={TERESOPOLIS_PARTNERS.label}
                    className="h-12 w-auto rounded-md object-contain"
                  />
                  <div>
                    <p className="text-lg font-extrabold tracking-tight">
                      {TERESOPOLIS_PARTNERS.label}
                    </p>
                    <p className="mt-0.5 text-sm text-primary-foreground/70">
                      {TERESOPOLIS_PARTNERS.tagline}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={BRAND.logo}
                    alt={BRAND.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <p className="text-lg font-extrabold tracking-tight">
                    {BRAND.name}
                  </p>
                </div>
              )}
            </div>
            <p className="text-sm text-primary-foreground/70">
              Atendimento profissional · Compra, venda e locação
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-primary-foreground/80">
            <Link href="/" className="hover:text-white">
              Imóveis gerais
            </Link>
            <Link href="/teresopolis" className="hover:text-white">
              Imóveis em Teresópolis
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
