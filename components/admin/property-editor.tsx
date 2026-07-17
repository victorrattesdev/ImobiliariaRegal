"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Plus,
  Save,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { PropertyCard } from "@/components/properties/property-card";
import { PriceDisplay } from "@/components/properties/price-display";
import { Spinner } from "@/components/ui/spinner";
import {
  AMENITIES,
  PORTFOLIO_REGIONS,
  PROPERTY_TYPES,
  RIO_CITY,
  TERESOPOLIS_CITY,
  type PortfolioRegion,
} from "@/lib/constants";
import {
  formatAmenity,
  formatArea,
  formatCurrency,
  formatIntegerBR,
  formatListingType,
  formatPropertyType,
  parseBrazilianCurrency,
  parseIntegerBR,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Property } from "@/shared/schema";

type FormState = {
  title: string;
  price: string;
  city: string;
  state: string;
  address: string;
  propertyType: string;
  listingType: "sale" | "rent";
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  description: string;
  carSpaces: string;
  mapEmbedUrl: string;
  iptu: string;
  featured: boolean;
  amenities: string[];
  images: string[];
};

const PRESET_AMENITY_VALUES = new Set(AMENITIES.map((a) => a.value));

function resolveAmenityValue(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  const preset = AMENITIES.find(
    (a) => a.value === lower || a.label.toLowerCase() === lower
  );
  return preset?.value ?? trimmed;
}

function detectRegion(city: string): PortfolioRegion {
  const normalized = city.trim().toLowerCase();
  if (normalized.includes("teres")) return "teresopolis";
  return "rio";
}

function regionCity(region: PortfolioRegion) {
  return region === "teresopolis" ? TERESOPOLIS_CITY : RIO_CITY;
}

function propertyToForm(property: Property): FormState {
  return {
    title: property.title ?? "",
    price: String(Math.round(Number(property.price) || 0)),
    city: property.city ?? "",
    state: property.state ?? "RJ",
    address: property.address ?? "",
    propertyType: property.propertyType ?? "house",
    listingType: (property.listingType as "sale" | "rent") || "sale",
    bedrooms: String(property.bedrooms ?? 2),
    bathrooms: String(property.bathrooms ?? 1),
    sqft: String(property.sqft ?? ""),
    description: property.description ?? "",
    carSpaces: String(property.carSpaces ?? 1),
    mapEmbedUrl: property.mapEmbedUrl ?? "",
    iptu: property.iptu
      ? String(Math.round(Number(property.iptu) || 0))
      : "",
    featured: Boolean(property.featured),
    amenities: property.amenities ?? [],
    images: property.images ?? [],
  };
}

const emptyForm = (): FormState => ({
  title: "",
  price: "",
  city: RIO_CITY,
  state: "RJ",
  address: "",
  propertyType: "house",
  listingType: "sale",
  bedrooms: "2",
  bathrooms: "1",
  sqft: "",
  description: "",
  carSpaces: "1",
  mapEmbedUrl: "",
  iptu: "",
  featured: false,
  amenities: [],
  images: [],
});

const softInput =
  "h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm font-medium outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15";

type Props = {
  initialProperty?: Property;
};

export function PropertyEditor({ initialProperty }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initialProperty);
  const [form, setForm] = useState<FormState>(
    initialProperty ? propertyToForm(initialProperty) : emptyForm()
  );
  const [region, setRegion] = useState<PortfolioRegion>(() =>
    detectRegion(initialProperty?.city ?? RIO_CITY)
  );
  const [customAmenity, setCustomAmenity] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function selectRegion(next: PortfolioRegion) {
    setRegion(next);
    setForm((prev) => ({
      ...prev,
      city: regionCity(next),
      state: "RJ",
    }));
  }

  const previewProperty = useMemo(() => {
    const priceNum = parseIntegerBR(form.price);
    const now = new Date();
    const property: Property = {
      id: initialProperty?.id ?? "preview",
      title: form.title.trim() || "Título do imóvel",
      description:
        form.description.trim() ||
        "A descrição aparece aqui conforme você escreve…",
      price: String(priceNum || 0),
      location: form.address
        ? `${form.city || "Cidade"}, ${form.address}`
        : `${form.city || "Cidade"}, ${form.state || "RJ"}`,
      address: form.address || null,
      city: form.city.trim() || "Cidade",
      state: form.state.trim() || "RJ",
      zipCode: null,
      propertyType: form.propertyType,
      listingType: form.listingType,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      sqft: Number(form.sqft) || 0,
      parking: 0,
      yearBuilt: null,
      lotSize: null,
      images: form.images.length
        ? form.images
        : ["/assets/generated_images/Luxury_house_hero_image_f495f766.png"],
      amenities: form.amenities,
      carSpaces: Number(form.carSpaces) || 0,
      strongPoints: [],
      iptu: form.iptu ? parseBrazilianCurrency(form.iptu) : null,
      mapEmbedUrl: form.mapEmbedUrl || null,
      featured: form.featured,
      status: initialProperty?.status ?? "active",
      createdAt: initialProperty?.createdAt ?? now,
      updatedAt: now,
    };
    return property;
  }, [form, initialProperty]);

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      Array.from(files).forEach((file) => body.append("images", file));
      const res = await fetch("/api/properties/upload", {
        method: "POST",
        body,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Falha no upload");
      }
      update("images", [...form.images, ...json.data.imageUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(src: string) {
    update(
      "images",
      form.images.filter((img) => img !== src)
    );
  }

  function setCoverImage(src: string) {
    if (form.images[0] === src) return;
    update("images", [src, ...form.images.filter((img) => img !== src)]);
  }

  function toggleAmenity(value: string) {
    const next = form.amenities.includes(value)
      ? form.amenities.filter((a) => a !== value)
      : [...form.amenities, value];
    update("amenities", next);
  }

  function addCustomAmenity() {
    const value = resolveAmenityValue(customAmenity);
    if (!value) return;
    if (!form.amenities.includes(value)) {
      update("amenities", [...form.amenities, value]);
    }
    setCustomAmenity("");
  }

  function buildPayload() {
    const price = parseBrazilianCurrency(form.price.replace(/\D/g, "") || "0");
    return {
      title: form.title.trim(),
      description: form.description.trim() || null,
      price,
      location: form.address
        ? `${form.city}, ${form.address}`
        : `${form.city}, ${form.state}`,
      address: form.address || null,
      city: form.city.trim(),
      state: form.state.trim() || "RJ",
      propertyType: form.propertyType,
      listingType: form.listingType,
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      sqft: Number(form.sqft),
      carSpaces: Number(form.carSpaces),
      strongPoints: [] as string[],
      amenities: form.amenities,
      images: form.images,
      mapEmbedUrl: form.mapEmbedUrl || null,
      iptu: form.iptu ? parseBrazilianCurrency(form.iptu) : null,
      featured: form.featured,
      status: initialProperty?.status ?? "active",
    };
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = buildPayload();
      // Garante cidade alinhada ao portfólio escolhido
      payload.city = regionCity(region);
      payload.state = form.state.trim() || "RJ";
      if (
        !payload.title ||
        !payload.price ||
        Number(payload.price) <= 0 ||
        !payload.city ||
        !payload.sqft
      ) {
        throw new Error("Preencha título, preço, cidade e área (m²).");
      }

      const res = await fetch(
        isEdit ? `/api/properties/${initialProperty!.id}` : "/api/properties",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Falha ao salvar");
      }
      router.push(`/imovel/${json.data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-semibold hover:bg-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <div>
              <p className="text-sm font-bold">
                {isEdit ? "Editar anúncio" : "Novo anúncio"}
              </p>
              <p className="text-xs text-muted-foreground">
                Preview em tempo real · salve quando estiver pronto
              </p>
            </div>
          </div>
          <button
            type="submit"
            form="property-editor-form"
            disabled={saving || uploading}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-brand-foreground hover:brightness-110 disabled:opacity-60"
          >
            {saving ? (
              <Spinner size="sm" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving
              ? "Salvando…"
              : isEdit
                ? "Salvar alterações"
                : "Publicar imóvel"}
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_400px] sm:px-6">
        <form
          id="property-editor-form"
          onSubmit={onSubmit}
          className="space-y-6"
        >
          <section className="rounded-3xl border border-border bg-card p-6 shadow-panel">
            <div className="mb-5 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" />
              <h2 className="text-lg font-extrabold">Portfólio de destino *</h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Escolha onde o imóvel deve aparecer. Isso define a cidade e evita
              misturar anúncios da capital com os da serra.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {PORTFOLIO_REGIONS.map((item) => {
                const active = region === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => selectRegion(item.value)}
                    className={cn(
                      "rounded-2xl border px-4 py-4 text-left transition",
                      active
                        ? "border-brand bg-brand/10 shadow-sm"
                        : "border-border bg-card hover:border-brand/40"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-extrabold">{item.label}</p>
                      {active && (
                        <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-foreground">
                          Selecionado
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <p className="mt-3 text-xs font-semibold text-foreground">
                      Cidade: {item.city}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-panel">
            <div className="mb-5 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" />
              <h2 className="text-lg font-extrabold">Informações principais</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm sm:col-span-2">
                <span className="font-semibold">Título *</span>
                <input
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="Ex: Apartamento amplo com vista para a serra"
                  className={softInput}
                  required
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-semibold">Finalidade</span>
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1">
                  {(["sale", "rent"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => update("listingType", type)}
                      className={cn(
                        "h-10 rounded-xl text-sm font-bold transition",
                        form.listingType === type
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground"
                      )}
                    >
                      {type === "sale" ? "Venda" : "Aluguel"}
                    </button>
                  ))}
                </div>
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-semibold">Tipo</span>
                <select
                  value={form.propertyType}
                  onChange={(e) => update("propertyType", e.target.value)}
                  className={cn(softInput, "appearance-none")}
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-semibold">Preço (R$) *</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                    R$
                  </span>
                  <input
                    inputMode="numeric"
                    value={formatIntegerBR(parseIntegerBR(form.price))}
                    onChange={(e) =>
                      update("price", String(parseIntegerBR(e.target.value)))
                    }
                    placeholder="850.000"
                    className={cn(softInput, "pl-12")}
                    required
                  />
                </div>
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-semibold">IPTU (R$)</span>
                <input
                  inputMode="numeric"
                  value={formatIntegerBR(parseIntegerBR(form.iptu))}
                  onChange={(e) =>
                    update("iptu", String(parseIntegerBR(e.target.value) || ""))
                  }
                  placeholder="2.500"
                  className={softInput}
                />
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-panel">
            <h2 className="mb-5 text-lg font-extrabold">Localização</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-semibold">Cidade *</span>
                <input
                  value={form.city}
                  readOnly
                  className={cn(softInput, "bg-secondary/50 text-muted-foreground")}
                  required
                />
                <span className="text-xs text-muted-foreground">
                  Definida pelo portfólio selecionado acima.
                </span>
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-semibold">Estado</span>
                <input
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  className={softInput}
                />
              </label>
              <label className="space-y-2 text-sm sm:col-span-2">
                <span className="font-semibold">Endereço / bairro</span>
                <input
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder={
                    region === "teresopolis"
                      ? "Ex: Centro, Alto, Várzea…"
                      : "Ex: Copacabana, Botafogo, Barra…"
                  }
                  className={softInput}
                />
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-panel">
            <h2 className="mb-5 text-lg font-extrabold">Características</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["bedrooms", "Quartos", form.bedrooms],
                ["bathrooms", "Banheiros", form.bathrooms],
                ["sqft", "Área m² *", form.sqft],
                ["carSpaces", "Vagas", form.carSpaces],
              ].map(([key, label, value]) => (
                <label key={key} className="space-y-2 text-sm">
                  <span className="font-semibold">{label}</span>
                  <input
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) =>
                      update(key as keyof FormState, e.target.value as never)
                    }
                    className={softInput}
                    required={key === "sqft"}
                  />
                </label>
              ))}
            </div>

            <label className="mt-4 block space-y-2 text-sm">
              <span className="font-semibold">Descrição</span>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={5}
                placeholder="Conte os diferenciais do imóvel com naturalidade…"
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </label>

            <div className="mt-5 space-y-3">
              <span className="text-sm font-semibold">Comodidades</span>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((item) => {
                  const active = form.amenities.includes(item.value);
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => toggleAmenity(item.value)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition",
                        active
                          ? "border-brand bg-brand/10"
                          : "border-border bg-card text-muted-foreground hover:border-brand/40"
                      )}
                    >
                      {active && <Check className="h-3.5 w-3.5 text-brand" />}
                      {item.label}
                    </button>
                  );
                })}
                {form.amenities
                  .filter((a) => !PRESET_AMENITY_VALUES.has(a))
                  .map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAmenity(item)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-brand bg-brand/10 px-3.5 py-2 text-xs font-semibold"
                    >
                      {formatAmenity(item)}
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomAmenity();
                    }
                  }}
                  placeholder="Adicionar outra comodidade…"
                  className={cn(softInput, "flex-1")}
                />
                <button
                  type="button"
                  onClick={addCustomAmenity}
                  disabled={!customAmenity.trim()}
                  className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-2xl border border-border px-4 text-sm font-bold hover:bg-secondary disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-panel">
            <h2 className="mb-5 text-lg font-extrabold">Fotos e mapa</h2>
            <label
              className={cn(
                "relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-secondary/40 px-4 py-10 text-center transition hover:bg-secondary/70",
                uploading && "pointer-events-none opacity-80"
              )}
            >
              {uploading ? (
                <Spinner size="lg" className="mb-3 text-brand" />
              ) : (
                <ImagePlus className="mb-3 h-8 w-8 text-brand" />
              )}
              <p className="text-sm font-bold">
                {uploading ? "Enviando fotos…" : "Adicionar fotos do imóvel"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                JPG, PNG ou WebP · até 5MB cada
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                disabled={uploading || saving}
                onChange={(e) => onUpload(e.target.files)}
              />
            </label>

            {form.images.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Clique na estrela para definir a foto de destaque do anúncio
                  (capa do card e da página).
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {form.images.map((src, index) => {
                    const isCover = index === 0;
                    return (
                      <div key={src} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt=""
                          className={cn(
                            "aspect-square rounded-2xl object-cover",
                            isCover && "ring-2 ring-brand ring-offset-2"
                          )}
                        />
                        {isCover && (
                          <span className="absolute bottom-1.5 left-1.5 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-brand-foreground">
                            Destaque
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setCoverImage(src)}
                          className={cn(
                            "absolute left-1.5 top-1.5 rounded-full p-1.5 text-white shadow-sm",
                            isCover
                              ? "bg-brand"
                              : "bg-black/55 hover:bg-black/80"
                          )}
                          aria-label={
                            isCover
                              ? "Foto de destaque"
                              : "Definir como destaque"
                          }
                          title={
                            isCover
                              ? "Foto de destaque"
                              : "Definir como destaque"
                          }
                        >
                          <Star
                            className={cn(
                              "h-3.5 w-3.5",
                              isCover && "fill-current"
                            )}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(src)}
                          className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                          aria-label="Remover foto"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <label className="mt-5 block space-y-2 text-sm">
              <span className="font-semibold">URL do mapa (Google Embed)</span>
              <input
                value={form.mapEmbedUrl}
                onChange={(e) => update("mapEmbedUrl", e.target.value)}
                placeholder="Cole o src do iframe do Google Maps"
                className={softInput}
              />
            </label>

            <label className="mt-4 flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => update("featured", e.target.checked)}
                className="h-4 w-4 accent-[hsl(var(--brand))]"
              />
              Destacar este imóvel na vitrine
            </label>
          </section>

          {error && (
            <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || uploading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand text-base font-bold text-brand-foreground hover:brightness-110 disabled:opacity-60 lg:hidden"
          >
            {saving && <Spinner size="sm" />}
            {saving
              ? "Salvando…"
              : isEdit
                ? "Salvar alterações"
                : "Publicar imóvel"}
          </button>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-4 shadow-panel">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Preview do card
            </p>
            <PropertyCard property={previewProperty} preview />
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-panel">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Como fica na página
            </p>
            <p className="text-sm font-semibold text-muted-foreground">
              {formatListingType(previewProperty.listingType)} ·{" "}
              {formatPropertyType(previewProperty.propertyType)}
            </p>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight">
              {previewProperty.title}
            </h3>
            <PriceDisplay
              price={previewProperty.price}
              listingType={previewProperty.listingType}
              size="lg"
              className="mt-3"
            />
            {previewProperty.iptu && (
              <p className="mt-1 text-sm text-muted-foreground">
                IPTU {formatCurrency(previewProperty.iptu, true)}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-muted-foreground">
              <span>{previewProperty.bedrooms} quartos</span>
              <span>{previewProperty.bathrooms} banheiros</span>
              <span>
                {previewProperty.sqft
                  ? formatArea(previewProperty.sqft)
                  : "— m²"}
              </span>
              <span>{previewProperty.carSpaces || 0} vagas</span>
            </div>
            <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
              {previewProperty.description}
            </p>
            {previewProperty.amenities &&
              previewProperty.amenities.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {previewProperty.amenities.map((a) => (
                    <span
                      key={a}
                      className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold"
                    >
                      {formatAmenity(a)}
                    </span>
                  ))}
                </div>
              )}
          </div>
        </aside>
      </div>
    </div>
  );
}
