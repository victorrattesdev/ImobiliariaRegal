import { useState } from "react";
import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Grid, List, ArrowUpDown, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Property } from "@shared/schema";

// Fallback images for properties without images
import heroImage from '@assets/generated_images/Luxury_house_hero_image_f495f766.png';
import apartmentImage from '@assets/generated_images/Modern_apartment_building_35d6793e.png';
import interiorImage from '@assets/generated_images/Modern_living_room_interior_f45c2a76.png';

// Helper function to get fallback image for properties
const getFallbackImage = (index: number) => {
  const images = [heroImage, apartmentImage, interiorImage];
  return images[index % images.length];
};

interface FilterState {
  priceRange: [number, number];
  location: string;
  propertyType: string;
  beds: string;
  baths: string;
  amenities: string[];
}

interface PropertyGridProps {
  searchQuery?: string;
  activeTab?: 'buy' | 'rent';
  filters?: FilterState;
}

export default function PropertyGrid({ 
  searchQuery = "", 
  activeTab = 'buy',
  filters
}: PropertyGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState("price-low");

  // Build query parameters
  const queryParams = new URLSearchParams();
  queryParams.set('listingType', activeTab === 'buy' ? 'sale' : 'rent');
  queryParams.set('limit', '50');
  
  if (sortBy === 'price-low') queryParams.set('sortBy', 'price_asc');
  if (sortBy === 'price-high') queryParams.set('sortBy', 'price_desc');
  if (sortBy === 'newest') queryParams.set('sortBy', 'newest');
  
  // Add filter parameters
  if (filters) {
    if (filters.priceRange[0] !== 0) queryParams.set('minPrice', filters.priceRange[0].toString());
    if (filters.priceRange[1] !== 2000000) queryParams.set('maxPrice', filters.priceRange[1].toString());
    if (filters.location) {
      // Try to parse location as "City, State" or send as both city and state search
      const locationParts = filters.location.split(',').map(part => part.trim());
      if (locationParts.length >= 2) {
        queryParams.set('city', locationParts[0]);
        queryParams.set('state', locationParts[1]);
      } else {
        // Single location term - search in city
        queryParams.set('city', filters.location);
      }
    }
    if (filters.propertyType) queryParams.set('propertyType', filters.propertyType);
    if (filters.beds) queryParams.set('minBeds', filters.beds);
    if (filters.baths) queryParams.set('minBaths', filters.baths);
    // Note: Amenities filtering not yet supported by backend
    // if (filters.amenities && filters.amenities.length > 0) {
    //   queryParams.set('amenities', filters.amenities.join(','));
    // }
  }

  // Fetch properties from API
  const apiUrl = searchQuery 
    ? `/api/properties/search?q=${encodeURIComponent(searchQuery)}&${queryParams.toString()}`
    : `/api/properties?${queryParams.toString()}`;
    
  const { data: apiResponse, isLoading, error } = useQuery({
    queryKey: [apiUrl]
  });

  // Process properties from API response
  const properties = ((apiResponse as any)?.data || []).map((property: Property, index: number) => ({
    ...property,
    // Format price based on listing type
    price: property.listingType === 'sale' 
      ? `R$ ${Number(property.price).toLocaleString()}`
      : `R$ ${Number(property.price).toLocaleString()}/mês`,
    // Use fallback image if no images
    image: property.images && property.images.length > 0 
      ? property.images[0] 
      : getFallbackImage(index),
    // Map database fields to component props
    type: property.listingType,
    location: `${property.city}, ${property.state}`,
    beds: property.bedrooms,
    baths: property.bathrooms,
    sqft: property.sqft,
    parking: property.carSpaces || 0
  }));

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            Propriedas para {activeTab === 'buy' ? 'Venda' : 'Aluguel'}
          </h2>
          <Badge variant="secondary" data-testid="text-results-count">
            {isLoading ? "Carregando..." : `${properties.length} resultados`}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]" data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-low">Menor preço primeiro</SelectItem>
                <SelectItem value="price-high">Maior preço primeiro</SelectItem>
                <SelectItem value="newest">Mais recente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              data-testid="button-grid-view"
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              data-testid="button-list-view"
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Mostrando resultados para "<span className="font-medium">{searchQuery}</span>"
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-lg text-muted-foreground">Carregando propriedades...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-lg text-destructive">Falha ao carregar propriedades</p>
          <p className="text-sm text-muted-foreground mt-1">
            Por favor tente novamente.
          </p>
        </div>
      )}

      {/* Properties Grid/List */}
      {!isLoading && !error && properties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Nenhuma propriedade encontrada</p>
          <p className="text-sm text-muted-foreground mt-1">
            Tente ajustar seus critérios de busca
          </p>
        </div>
      )}

      {!isLoading && !error && properties.length > 0 && (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {properties.map((property: any) => (
            <PropertyCard
              key={property.id}
              {...property}
              onFavorite={(id) => console.log('Favorited:', id)}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {!isLoading && !error && properties.length > 0 && (
        <div className="text-center pt-8">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => console.log('Load more properties')}
            data-testid="button-load-more"
          >
            Carregue mais propriedades
          </Button>
        </div>
      )}
    </div>
  );
}