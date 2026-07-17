"use client";

import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { TERESOPOLIS_PARTNERS } from "@/lib/constants";

type HeroVariant = "default" | "teresopolis";

const content = {
  default: {
    eyebrow: "Regal Imobiliária",
    title: "Encontre o imóvel certo com segurança",
    subtitle:
      "Compra, venda e locação com curadoria profissional. Transparência em cada etapa.",
    image: "/assets/heroes/rio-cristo-redentor.jpg",
    imageAlt: "Rio de Janeiro visto de cima com o Cristo Redentor ao fundo",
  },
  teresopolis: {
    eyebrow: `${TERESOPOLIS_PARTNERS.label} · Teresópolis`,
    title: "Imóveis com vista para a serra",
    subtitle:
      "Casas, sítios e apartamentos em Teresópolis, sob a presença do Dedo de Deus. Atendimento por Regal e Ferraro.",
    image: "/assets/heroes/dedo-de-deus-teresopolis.jpg",
    imageAlt: "Dedo de Deus visto do Mirante do Soberbo, Teresópolis — RJ",
  },
} as const;

type HeroProps = {
  variant?: HeroVariant;
  onSearch?: (query: string) => void;
};

export function Hero({ variant = "default", onSearch }: HeroProps) {
  const [query, setQuery] = useState("");
  const data = content[variant];

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSearch?.(query.trim());
  }

  return (
    <section className="relative min-h-[560px] overflow-hidden md:min-h-[620px]">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.image}
          alt={data.imageAlt}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F33]/90 via-[#0B1F33]/70 to-[#0B1F33]/30" />
      </div>

      <div className="relative z-10 container flex min-h-[560px] items-center py-16 md:min-h-[620px]">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-white/75">
            {data.eyebrow}
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {data.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
            {data.subtitle}
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-2 rounded-xl bg-card p-2.5 shadow-soft sm:flex-row"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por bairro, cidade ou tipo de imóvel"
              className="h-14 flex-1 rounded-lg border-0 bg-transparent px-4 text-base outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-base font-bold text-brand-foreground transition hover:brightness-110"
            >
              <Search className="h-5 w-5" />
              Buscar
            </button>
          </form>

          {variant === "default" && (
            <p className="mt-4 text-sm text-white/75">
              Procurando na serra?{" "}
              <Link
                href="/teresopolis"
                className="inline-flex items-center gap-1 font-semibold text-white underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
              >
                <MapPin className="h-3.5 w-3.5" />
                Ver imóveis em Teresópolis
              </Link>
            </p>
          )}

          {variant === "teresopolis" && (
            <p className="mt-4 text-sm text-white/75">
              Prefere a capital?{" "}
              <Link
                href="/"
                className="inline-flex items-center gap-1 font-semibold text-white underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
              >
                <MapPin className="h-3.5 w-3.5" />
                Ver imóveis no Rio de Janeiro
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
