import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const sizeClass: Record<Size, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-8 w-8",
};

type SpinnerProps = {
  className?: string;
  size?: Size;
  label?: string;
};

export function Spinner({ className, size = "md", label }: SpinnerProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      role="status"
      aria-live="polite"
    >
      <Loader2
        className={cn("animate-spin text-current", sizeClass[size])}
        aria-hidden
      />
      {label ? (
        <span className="text-sm font-medium">{label}</span>
      ) : (
        <span className="sr-only">Carregando</span>
      )}
    </span>
  );
}

export function LoadingBlock({
  label = "Carregando…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-14 text-muted-foreground",
        className
      )}
    >
      <span className="relative flex h-12 w-12 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-brand/15" />
        <Spinner size="lg" className="text-brand" />
      </span>
      <p className="text-sm font-semibold">{label}</p>
    </div>
  );
}
