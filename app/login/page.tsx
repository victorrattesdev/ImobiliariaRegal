"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { BRAND } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Falha no login");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-soft">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          {BRAND.name}
        </Link>
        <h1 className="mt-6 text-xl font-semibold">Acesso administrativo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Entre para gerenciar o portfólio de imóveis.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Usuário</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-11 w-full rounded-xl border bg-background px-3 outline-none ring-primary/30 focus:ring-2"
              autoComplete="username"
              required
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-xl border bg-background px-3 outline-none ring-primary/30 focus:ring-2"
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand font-bold text-brand-foreground transition hover:brightness-110 disabled:opacity-60"
          >
            {loading && <Spinner size="sm" />}
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
