"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EyeOff,
  LogOut,
  Pencil,
  Plus,
  Power,
  Trash2,
} from "lucide-react";
import { LoadingBlock, Spinner } from "@/components/ui/spinner";
import {
  formatCurrency,
  formatListingType,
  formatPropertyType,
  formatStatus,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Property } from "@/shared/schema";

export function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: async () => {
      const res = await fetch("/api/properties?limit=200&includeInactive=true");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data as Property[];
    },
  });

  const properties = useMemo(() => data ?? [], [data]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setPendingId(id);
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Falha ao excluir");
      }
    },
    onSettled: () => setPendingId(null),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] }),
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "active" | "inactive";
    }) => {
      setPendingId(id);
      const res = await fetch(`/api/properties/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Falha ao atualizar status");
      }
      return json.data;
    },
    onSettled: () => setPendingId(null),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] }),
  });

  const stats = useMemo(
    () => [
      { label: "Total", value: properties.length },
      {
        label: "Ativos na home",
        value: properties.filter((p) => p.status === "active").length,
      },
      {
        label: "Desativados",
        value: properties.filter((p) => p.status === "inactive").length,
      },
    ],
    [properties]
  );

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <Link href="/" className="text-xl font-extrabold tracking-tight">
              Regal · Admin
            </Link>
            <p className="text-sm text-muted-foreground">
              Gestão profissional do portfólio
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/novo"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-bold text-brand-foreground hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              Novo imóvel
            </Link>
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold disabled:opacity-60"
            >
              {loggingOut ? (
                <Spinner size="sm" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              {loggingOut ? "Saindo…" : "Sair"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border bg-card p-5 shadow-sm"
            >
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight">
                {isLoading ? (
                  <Spinner size="sm" className="text-brand" />
                ) : (
                  stat.value
                )}
              </p>
            </div>
          ))}
        </div>

        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-bold">Imóveis cadastrados</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Desativar remove o anúncio da home sem apagar os dados.
            </p>
          </div>
          {isLoading ? (
            <LoadingBlock label="Carregando imóveis…" />
          ) : properties.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum imóvel ainda.
              </p>
              <Link
                href="/admin/novo"
                className="mt-4 inline-flex rounded-full bg-brand px-4 py-2 text-sm font-bold text-brand-foreground"
              >
                Criar o primeiro anúncio
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {properties.map((property) => {
                const inactive = property.status === "inactive";
                const busy = pendingId === property.id;
                return (
                  <div
                    key={property.id}
                    className={cn(
                      "flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
                      inactive && "bg-secondary/40",
                      busy && "opacity-80"
                    )}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{property.title}</p>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                            inactive
                              ? "bg-muted text-muted-foreground"
                              : "bg-brand/10 text-brand"
                          )}
                        >
                          {formatStatus(property.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {property.city} ·{" "}
                        {formatPropertyType(property.propertyType)} ·{" "}
                        {formatListingType(property.listingType)} ·{" "}
                        {formatCurrency(property.price)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/imovel/${property.id}`}
                        className="rounded-full border px-3 py-1.5 text-sm font-semibold"
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/admin/imovel/${property.id}`}
                        className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-semibold"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Link>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          statusMutation.mutate({
                            id: property.id,
                            status: inactive ? "active" : "inactive",
                          })
                        }
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-semibold disabled:opacity-60",
                          inactive
                            ? "border-brand/30 text-brand"
                            : "border-border text-muted-foreground"
                        )}
                      >
                        {busy && statusMutation.isPending ? (
                          <Spinner size="sm" />
                        ) : inactive ? (
                          <Power className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                        {busy && statusMutation.isPending
                          ? inactive
                            ? "Ativando…"
                            : "Desativando…"
                          : inactive
                            ? "Ativar"
                            : "Desativar"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          if (confirm("Excluir este imóvel permanentemente?")) {
                            deleteMutation.mutate(property.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-destructive/30 px-3 py-1.5 text-sm font-semibold text-destructive disabled:opacity-60"
                      >
                        {busy && deleteMutation.isPending ? (
                          <Spinner size="sm" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        {busy && deleteMutation.isPending
                          ? "Excluindo…"
                          : "Excluir"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
