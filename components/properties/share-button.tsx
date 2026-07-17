"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="mt-4 inline-flex w-full items-center justify-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-brand" />
          Link copiado
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          Compartilhar imóvel
        </>
      )}
    </button>
  );
}
