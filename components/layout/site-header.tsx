"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { CtaLink } from "@/components/ui/cta-link";
import { BRAND, TERESOPOLIS_PARTNERS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  listingType?: "sale" | "rent";
  onListingTypeChange?: (type: "sale" | "rent") => void;
};

export function SiteHeader({
  listingType = "sale",
  onListingTypeChange,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isTeresopolis = pathname.startsWith("/teresopolis");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="container flex h-20 items-center justify-between gap-4">
        <Link
          href={isTeresopolis ? "/teresopolis" : "/"}
          className="group flex min-w-0 items-center gap-3"
        >
          {isTeresopolis ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={TERESOPOLIS_PARTNERS.logo}
                alt={TERESOPOLIS_PARTNERS.label}
                className="h-12 w-auto shrink-0 rounded-lg object-contain sm:h-14"
              />
              <span className="leading-tight">
                <span className="block text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
                  {TERESOPOLIS_PARTNERS.label}
                </span>
                <span className="hidden text-sm font-medium text-muted-foreground sm:block">
                  {TERESOPOLIS_PARTNERS.tagline}
                </span>
              </span>
            </>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={BRAND.logo}
                alt={BRAND.name}
                className="h-12 w-12 shrink-0 rounded-xl object-cover shadow-sm"
              />
              <span className="leading-tight">
                <span className="block text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
                  {BRAND.name}
                </span>
                <span className="hidden text-sm font-medium text-muted-foreground sm:block">
                  {BRAND.tagline}
                </span>
              </span>
            </>
          )}
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {onListingTypeChange && (
            <div className="flex rounded-lg bg-secondary p-1">
              <button
                type="button"
                onClick={() => onListingTypeChange("sale")}
                className={cn(
                  "rounded-md px-4 py-1.5 text-sm font-semibold transition",
                  listingType === "sale"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Comprar
              </button>
              <button
                type="button"
                onClick={() => onListingTypeChange("rent")}
                className={cn(
                  "rounded-md px-4 py-1.5 text-sm font-semibold transition",
                  listingType === "rent"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Alugar
              </button>
            </div>
          )}

          {isTeresopolis ? (
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold transition hover:bg-secondary"
            >
              <MapPin className="h-4 w-4 text-brand" />
              Imóveis Gerais
            </Link>
          ) : (
            <CtaLink href="/teresopolis">
              <MapPin className="cta-pin h-4 w-4" />
              Imóveis Teresópolis
            </CtaLink>
          )}

          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="rounded-lg border border-border bg-card p-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {onListingTypeChange && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-semibold",
                    listingType === "sale" && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => {
                    onListingTypeChange("sale");
                    setOpen(false);
                  }}
                >
                  Comprar
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-semibold",
                    listingType === "rent" && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => {
                    onListingTypeChange("rent");
                    setOpen(false);
                  }}
                >
                  Alugar
                </button>
              </div>
            )}
            {isTeresopolis ? (
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"
                onClick={() => setOpen(false)}
              >
                <MapPin className="h-4 w-4 text-brand" />
                Imóveis Gerais
              </Link>
            ) : (
              <CtaLink
                href="/teresopolis"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                <MapPin className="cta-pin h-4 w-4" />
                Imóveis Teresópolis
              </CtaLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
