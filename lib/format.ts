const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const currencyPrecise = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("pt-BR");

export function formatCurrency(value: string | number, precise = false): string {
  const amount = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(amount)) return "R$ —";
  return (precise ? currencyPrecise : currencyFormatter).format(amount);
}

export function formatPriceLabel(
  value: string | number,
  listingType: "sale" | "rent"
): string {
  const formatted = formatCurrency(value);
  return listingType === "rent" ? `${formatted} aluguel` : formatted;
}

export function formatArea(sqft: number): string {
  return `${numberFormatter.format(sqft)} m²`;
}

export function formatListingType(type: string): string {
  return type === "rent" ? "Aluguel" : "Venda";
}

export function formatPropertyType(type: string): string {
  const map: Record<string, string> = {
    house: "Casa",
    apartment: "Apartamento",
    condo: "Sala comercial",
    townhouse: "Casa em condomínio",
    villa: "Casa em vila",
  };
  return map[type] || type;
}

export function formatStatus(status: string): string {
  const map: Record<string, string> = {
    active: "Ativo",
    pending: "Pendente",
    sold: "Vendido",
    inactive: "Inativo",
  };
  return map[status] || status;
}

export function formatAmenity(value: string): string {
  const map: Record<string, string> = {
    piscina: "Piscina",
    academia: "Academia",
    garagem: "Garagem",
    jardim: "Jardim",
    varanda: "Varanda",
    ar_condicionado: "Ar-condicionado",
    mobiliado: "Mobiliado",
    seguranca: "Segurança 24h",
  };
  return map[value] || value;
}

export function parseBrazilianCurrency(input: string): string {
  const cleaned = input.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const num = Number(cleaned);
  if (!Number.isFinite(num)) return "";
  return num.toFixed(2);
}

/** Formata só dígitos para exibição BR (1.234.567) */
export function formatIntegerBR(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "";
  return numberFormatter.format(Math.round(value));
}

/** Extrai número inteiro de string com pontuação BR */
export function parseIntegerBR(input: string): number {
  const digits = input.replace(/\D/g, "");
  if (!digits) return 0;
  return Number(digits);
}

export function formatPricePerSqm(
  price: string | number,
  sqft: number
): string | null {
  const amount = typeof price === "string" ? Number(price) : price;
  if (!Number.isFinite(amount) || !sqft || sqft <= 0) return null;
  return formatCurrency(amount / sqft, true);
}
