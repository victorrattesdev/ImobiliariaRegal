import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bath,
  BedDouble,
  Building2,
  Calendar,
  Car,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { PropertyGallery } from "@/components/properties/property-gallery";
import { PriceDisplay } from "@/components/properties/price-display";
import { RelatedPropertiesCarousel } from "@/components/properties/related-properties-carousel";
import { ShareButton } from "@/components/properties/share-button";
import { getProperty, getRelatedProperties } from "@/lib/properties";
import { TERESOPOLIS_CITY, TERESOPOLIS_PARTNERS } from "@/lib/constants";
import {
  formatAmenity,
  formatArea,
  formatCurrency,
  formatListingType,
  formatPriceLabel,
  formatPricePerSqm,
  formatPropertyType,
} from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

function safeMapSrc(embed?: string | null) {
  if (!embed) return null;
  const match = embed.match(/src=["']([^"']+)["']/i);
  const url = match?.[1] || embed;
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname === "www.google.com" ||
      parsed.hostname === "maps.google.com" ||
      parsed.hostname.endsWith(".google.com")
    ) {
      return parsed.toString();
    }
  } catch {
    return null;
  }
  return null;
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  const images = property.images?.length ? property.images : [];
  const mapSrc = safeMapSrc(property.mapEmbedUrl);
  const listingType = property.listingType as "sale" | "rent";
  const isTeresopolis = property.city
    .toLowerCase()
    .includes(TERESOPOLIS_CITY.toLowerCase());
  const agencyLabel = isTeresopolis
    ? TERESOPOLIS_PARTNERS.label
    : "Regal Imobiliária";
  const pricePerSqm = formatPricePerSqm(property.price, property.sqft);
  const code = property.id.slice(0, 8).toUpperCase();
  const whatsappText = encodeURIComponent(
    `Olá! Tenho interesse no imóvel "${property.title}" (cód. ${code}) — ${formatPriceLabel(property.price, listingType)}.`
  );

  const related = await getRelatedProperties(property, 8);

  const specs = [
    {
      icon: BedDouble,
      label: property.bedrooms === 1 ? "quarto" : "quartos",
      value: property.bedrooms,
    },
    {
      icon: Bath,
      label: property.bathrooms === 1 ? "banheiro" : "banheiros",
      value: property.bathrooms,
    },
    {
      icon: Maximize2,
      label: "área",
      value: formatArea(property.sqft),
    },
    {
      icon: Car,
      label: (property.carSpaces || 0) === 1 ? "vaga" : "vagas",
      value: property.carSpaces || 0,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 sm:px-6">
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Imóveis
          </Link>
          <span>/</span>
          <span>{formatPropertyType(property.propertyType)}</span>
          <span>/</span>
          <span className="font-medium text-foreground">{property.city}</span>
        </nav>

        <PropertyGallery images={images} title={property.title} />

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-10">
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground">
                  {formatListingType(property.listingType)}
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                  {formatPropertyType(property.propertyType)}
                </span>
                <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                  Cód. {code}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {property.title}
              </h1>

              <p className="flex items-start gap-2 text-base text-muted-foreground sm:text-lg">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-brand" />
                <span>
                  {property.location || `${property.city}, ${property.state}`}
                </span>
              </p>

              <div className="grid grid-cols-2 gap-4 border-y border-border py-6 sm:grid-cols-4">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex items-center gap-3.5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-foreground">
                      <spec.icon className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="text-2xl font-extrabold leading-none tracking-tight">
                        {spec.value}
                      </p>
                      <p className="mt-1.5 text-sm font-medium text-muted-foreground">
                        {spec.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </header>

            <section>
              <h2 className="text-2xl font-extrabold tracking-tight">
                Sobre o imóvel
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-base leading-8 text-muted-foreground">
                {property.description ||
                  `Este imóvel ainda não possui descrição detalhada. Fale com ${
                    isTeresopolis
                      ? "Regal ou Ferraro"
                      : "um corretor Regal"
                  } para mais informações.`}
              </p>
            </section>

            {property.amenities && property.amenities.length > 0 && (
              <section>
                <h2 className="text-2xl font-extrabold tracking-tight">
                  Comodidades
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {property.amenities.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold"
                    >
                      {formatAmenity(item)}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-extrabold tracking-tight">
                Valores e detalhes
              </h2>
              <dl className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {[
                  ["Tipo", formatPropertyType(property.propertyType)],
                  ["Finalidade", formatListingType(property.listingType)],
                  [
                    listingType === "rent" ? "Aluguel" : "Preço",
                    formatCurrency(property.price),
                  ],
                  ...(property.iptu
                    ? [["IPTU", formatCurrency(property.iptu, true)] as const]
                    : []),
                  ...(pricePerSqm
                    ? [["Valor por m²", pricePerSqm] as const]
                    : []),
                  ["Cidade", property.city],
                  ["Estado", property.state],
                  ["Área", formatArea(property.sqft)],
                  ["Quartos", String(property.bedrooms)],
                  ["Banheiros", String(property.bathrooms)],
                  ["Vagas", String(property.carSpaces || 0)],
                  ["Código", code],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm sm:text-base"
                  >
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-bold text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {mapSrc && (
              <section>
                <h2 className="text-2xl font-extrabold tracking-tight">
                  Localização
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Confira a região no mapa. O endereço exato pode ser confirmado
                  com o corretor na visita.
                </p>
                <div className="mt-4 overflow-hidden rounded-2xl border border-border">
                  <iframe
                    title="Mapa do imóvel"
                    src={mapSrc}
                    className="h-[360px] w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-panel">
              <p className="text-base font-semibold text-muted-foreground">
                {listingType === "rent" ? "Aluguel" : "Preço de venda"}
              </p>
              <PriceDisplay
                price={property.price}
                listingType={listingType}
                size="xl"
                className="mt-2"
              />

              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                {property.iptu && (
                  <p>
                    IPTU{" "}
                    <span className="font-bold text-foreground">
                      {formatCurrency(property.iptu, true)}
                    </span>
                  </p>
                )}
                {pricePerSqm && (
                  <p>
                    {pricePerSqm}
                    <span className="font-medium"> / m²</span>
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-3">
                <a
                  href={`https://wa.me/5521999999999?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand text-base font-bold text-brand-foreground transition hover:brightness-110"
                >
                  <MessageCircle className="h-5 w-5" />
                  Falar com corretor
                </a>
                <a
                  href={`https://wa.me/5521999999999?text=${encodeURIComponent(
                    `Olá! Gostaria de agendar uma visita ao imóvel "${property.title}" (cód. ${code}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-border bg-card text-base font-bold text-foreground transition hover:bg-secondary"
                >
                  <Calendar className="h-5 w-5" />
                  Agendar visita
                </a>
                <a
                  href="tel:+5521999999999"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-muted-foreground transition hover:text-foreground"
                >
                  <Phone className="h-4 w-4" />
                  Ligar agora
                </a>
              </div>

              <div className="mt-5 rounded-2xl bg-secondary/80 p-4">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Building2 className="h-4 w-4 text-brand" />
                  {agencyLabel}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {isTeresopolis
                    ? TERESOPOLIS_PARTNERS.description
                    : "Anúncio verificado · Atendimento para compra, venda e locação."}
                </p>
              </div>

              <ShareButton title={property.title} />
            </div>
          </aside>
        </div>
      </main>

      <RelatedPropertiesCarousel
        properties={related}
        title={`Imóveis relacionados em ${property.city}`}
        subtitle="Próximos em localização, comodidades, tipo e faixa de valor ao que você está vendo."
      />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <PriceDisplay
              price={property.price}
              listingType={listingType}
              size="sm"
            />
            <p className="truncate text-xs text-muted-foreground">
              {property.city} · Cód. {code}
            </p>
          </div>
          <a
            href={`https://wa.me/5521999999999?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-brand px-5 text-sm font-bold text-brand-foreground"
          >
            Contatar
          </a>
        </div>
      </div>
    </div>
  );
}
