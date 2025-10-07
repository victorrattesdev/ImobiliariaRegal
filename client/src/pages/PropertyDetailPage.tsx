import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  MapPin,
  Home,
  Bath,
  Square,
  Calendar,
  Share2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Car,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import type { Property } from "@shared/schema";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  // Fetch specific property
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/api/properties/${id}`],
  });

  const property = (apiResponse as any)?.data as Property;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Property Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The property you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => setLocation("/")}
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "sold":
        return "destructive";
      default:
        return "outline";
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "pending":
        return "Pendente";
      case "sold":
        return "Vendido";
      case "inactive":
        return "Inativo";
      default:
        return status;
    }
  };

  const translateListingType = (listingType: string) => {
    switch (listingType) {
      case "sale":
        return "Venda";
      case "rent":
        return "Aluguel";
      default:
        return listingType;
    }
  };

  const translatePropertyType = (propertyType: string) => {
    switch (propertyType) {
      case "house":
        return "Casa";
      case "apartment":
        return "Apartamento";
      case "condo":
        return "Condomínio";
      case "townhouse":
        return "Sobrado";
      case "villa":
        return "Vila";
      default:
        return propertyType;
    }
  };

  // Property Image Gallery Component
  const PropertyImageGallery = ({
    images,
    title,
  }: {
    images: string[];
    title: string;
  }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [brokenImages, setBrokenImages] = useState(new Set<number>());

    // If no images, show placeholder
    if (!images || images.length === 0) {
      return (
        <div className="aspect-[16/10] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Home className="h-16 w-16 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium">Fotos do imóvel</p>
            <p className="text-sm">Sem fotos disponíveis</p>
          </div>
        </div>
      );
    }

    const nextImage = () => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length,
      );
    };

    const handleImageError = (index: number) => {
      setBrokenImages((prev) => new Set(prev).add(index));
    };

    return (
      <div className="relative">
        {/* Main Image */}
        <div className="aspect-[16/10] relative overflow-hidden rounded-lg">
          {brokenImages.has(currentImageIndex) ? (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Home className="h-16 w-16 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium">Imagem Indisponível</p>
                <p className="text-sm">Falha ao carregar imagem</p>
              </div>
            </div>
          ) : (
            <img
              src={images[currentImageIndex]}
              alt={`${title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
              onError={() => handleImageError(currentImageIndex)}
            />
          )}

          {/* Navigation Arrows - only show if more than 1 image */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full"
                onClick={prevImage}
                data-testid="button-prev-image"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full"
                onClick={nextImage}
                data-testid="button-next-image"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Strip - only show if more than 1 image */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4 p-4 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-20 h-16 rounded border-2 overflow-hidden transition-all ${
                  index === currentImageIndex
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-primary/50"
                }`}
                data-testid={`thumbnail-${index}`}
              >
                {brokenImages.has(index) ? (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">?</span>
                  </div>
                ) : (
                  <img
                    src={image}
                    alt={`${title} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(index)}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 grid grid-cols-3 items-center">
          <div className="flex justify-start">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">Regal Imobiliária</span>
          </div>
          
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="icon"
              data-testid="button-share"
              onClick={() =>
                window.open(
                  "https://www.google.com",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Images */}
            <Card>
              <CardContent className="p-0">
                <PropertyImageGallery
                  images={property.images || []}
                  title={property.title}
                />
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1
                      className="text-3xl font-bold mb-2"
                      data-testid="text-property-title"
                    >
                      {property.title}
                    </h1>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span data-testid="text-property-location">
                        {property.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={getStatusColor(property.status) as any}
                        className="capitalize"
                        data-testid="badge-property-status"
                      >
                        {translateStatus(property.status)}
                      </Badge>
                      <Badge variant="outline">
                        {translateListingType(property.listingType)}
                      </Badge>
                      <Badge variant="outline">
                        {translatePropertyType(property.propertyType)}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-3xl font-bold text-primary"
                      data-testid="text-property-price"
                    >
                      R$ {Number(property.price).toLocaleString()}
                      {property.listingType === "rent" && (
                        <span className="text-lg">/mês</span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Property Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Home className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="font-semibold" data-testid="text-bedrooms">
                      {property.bedrooms}
                    </div>
                    <div className="text-sm text-muted-foreground">Quartos</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Bath className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="font-semibold" data-testid="text-bathrooms">
                      {property.bathrooms}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Banheiros
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Square className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="font-semibold" data-testid="text-sqft">
                      {property.sqft.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">m²</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Car className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div
                      className="font-semibold"
                      data-testid="text-car-spaces"
                    >
                      {property.carSpaces || 1}
                    </div>
                    <div className="text-sm text-muted-foreground">Vagas</div>
                  </div>
                </div>

                {/* Description */}
                {property.description && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Descrição</h3>
                      <p
                        className="text-muted-foreground leading-relaxed"
                        data-testid="text-description"
                      >
                        {property.description}
                      </p>
                    </div>
                  </>
                )}

                {/* Strong Points */}
                {property.strongPoints && property.strongPoints.length > 0 && (
                  <>
                    <Separator className="my-6" />

                    <div>
                      <h3 className="text-xl font-semibold mb-3">
                        Pontos Fortes
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {property.strongPoints.map((point, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2"
                            data-testid={`strong-point-${index}`}
                          >
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                            <span className="text-muted-foreground">
                              {point}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Property Details */}
                <Separator className="my-6" />
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    Detalhes do Imóvel
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">
                        Tipo de Imóvel
                      </span>
                      <span className="font-medium capitalize">
                        {property.propertyType}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Tipo</span>
                      <span className="font-medium capitalize">
                        {property.listingType}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Cidade</span>
                      <span className="font-medium">{property.city}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Endereço</span>
                      <span className="font-medium">{property.state}</span>
                    </div>
                    {property.iptu && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">IPTU</span>
                        <span className="font-medium" data-testid="text-property-iptu">
                          R$ {parseFloat(property.iptu).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Embedded Map */}
                {property.mapEmbedUrl && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        Localização
                      </h3>
                      <div
                        className="aspect-video w-full rounded-lg overflow-hidden border"
                        data-testid="map-container"
                      >
                        <iframe
                          src={property.mapEmbedUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen={true}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Mapa da propriedade"
                          data-testid="map-iframe"
                        ></iframe>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Agent */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Contate-nos</h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Home className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="font-semibold">Corretor da Regal Imóveis</h4>
                    <p className="text-sm text-muted-foreground">
                      Especialista em Imóveis
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <Button className="w-full" data-testid="button-call-agent">
                      <Phone className="h-4 w-4 mr-2" />
                      Entrar em Contato
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
