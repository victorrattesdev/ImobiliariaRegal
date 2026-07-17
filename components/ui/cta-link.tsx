import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CtaLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "primary" | "soft";
};

export function CtaLink({
  href,
  children,
  className,
  onClick,
  variant = "primary",
}: CtaLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "cta-link group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-4 py-2.5 text-sm font-bold tracking-tight transition-all duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        variant === "primary" && "cta-link--primary",
        variant === "soft" && "cta-link--soft",
        className
      )}
    >
      <span className="cta-link__shine" aria-hidden />
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </Link>
  );
}
