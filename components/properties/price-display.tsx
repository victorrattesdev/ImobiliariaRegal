import {
  formatCurrency,
} from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  price: string | number;
  listingType: "sale" | "rent" | string;
  className?: string;
  size?: "sm" | "card" | "md" | "lg" | "xl";
};

function sizeFor(price: string | number, size: Props["size"], isRent: boolean) {
  const digits = String(Math.round(Number(price) || 0)).length;
  const weight = digits + (isRent ? 1 : 0);

  if (size === "sm") {
    if (weight >= 9) return "text-sm";
    if (weight >= 8) return "text-base";
    return "text-lg";
  }
  if (size === "card") {
    if (weight >= 9) return "text-base";
    if (weight >= 8) return "text-lg";
    if (weight >= 7) return "text-xl";
    return "text-xl";
  }
  if (size === "md") {
    if (weight >= 9) return "text-lg sm:text-xl";
    if (weight >= 8) return "text-xl sm:text-2xl";
    if (weight >= 7) return "text-2xl";
    return "text-2xl sm:text-[1.75rem]";
  }
  if (size === "xl") {
    if (weight >= 9) return "text-2xl sm:text-3xl";
    if (weight >= 8) return "text-3xl sm:text-4xl";
    return "text-4xl sm:text-[2.75rem]";
  }
  // lg
  if (weight >= 9) return "text-xl sm:text-2xl";
  if (weight >= 8) return "text-2xl sm:text-3xl";
  return "text-3xl";
}

export function PriceDisplay({
  price,
  listingType,
  className,
  size = "md",
}: Props) {
  const isRent = listingType === "rent";

  return (
    <p
      className={cn(
        "min-w-0 font-extrabold leading-snug tracking-tight text-foreground break-words",
        sizeFor(price, size, isRent),
        className
      )}
    >
      {formatCurrency(price)}
      {isRent && (
        <span className="ml-1.5 text-[0.62em] font-bold tracking-normal text-muted-foreground">
          aluguel
        </span>
      )}
    </p>
  );
}
