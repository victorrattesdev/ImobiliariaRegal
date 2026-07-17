export const BRAND = {
  name: "Regal Imobiliária",
  shortName: "Regal",
  tagline: "Compra, venda e locação com atendimento especializado",
  logo: "/assets/logos/regal-rio.png",
} as const;

/** Parceiros responsáveis pelo portfólio de Teresópolis */
export const TERESOPOLIS_PARTNERS = {
  label: "Regal & Ferraro",
  names: ["Regal", "Ferraro"] as const,
  tagline: "Atendimento compartilhado em Teresópolis",
  description:
    "Em Teresópolis, o atendimento é feito por Regal e Ferraro — os dois responsáveis pelo portfólio da serra.",
  logo: "/assets/logos/rf-imobiliaria-teresopolis.png",
} as const;

export const TERESOPOLIS_CITY = "Teresópolis";
export const RIO_CITY = "Rio de Janeiro";

export const PORTFOLIO_REGIONS = [
  {
    value: "rio",
    label: "Rio de Janeiro · Capital",
    description: "Aparece na home geral (fora de Teresópolis).",
    city: RIO_CITY,
  },
  {
    value: "teresopolis",
    label: "Teresópolis · Serra",
    description:
      "Aparece em /teresopolis · atendimento Regal & Ferraro.",
    city: TERESOPOLIS_CITY,
  },
] as const;

export type PortfolioRegion = (typeof PORTFOLIO_REGIONS)[number]["value"];

export const PROPERTY_TYPES = [
  { value: "house", label: "Casa" },
  { value: "apartment", label: "Apartamento" },
  { value: "townhouse", label: "Casa em condomínio" },
  { value: "condo", label: "Sala comercial" },
  { value: "villa", label: "Casa em vila" },
] as const;

export const AMENITIES = [
  { value: "piscina", label: "Piscina" },
  { value: "academia", label: "Academia" },
  { value: "garagem", label: "Garagem" },
  { value: "jardim", label: "Jardim" },
  { value: "varanda", label: "Varanda" },
  { value: "ar_condicionado", label: "Ar-condicionado" },
  { value: "mobiliado", label: "Mobiliado" },
  { value: "seguranca", label: "Segurança 24h" },
] as const;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
