import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Filter, MapPin } from "lucide-react";

interface FilterState {
  priceRange: [number, number];
  location: string;
  propertyType: string;
  beds: string;
  baths: string;
  amenities: string[];
}

interface FilterPanelProps {
  onFiltersChange?: (filters: FilterState) => void;
  onReset?: () => void;
}

export default function FilterPanel({ onFiltersChange, onReset }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 2000000],
    location: "",
    propertyType: "",
    beds: "",
    baths: "",
    amenities: []
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const amenitiesList = [
    "Swimming Pool", "Gym", "Parking", "Garden", "Balcony", 
    "Air Conditioning", "Fireplace", "Walk-in Closet"
  ];

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
    console.log('Filters changed:', key, value);
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    handleFilterChange('amenities', newAmenities);
  };

  const handleReset = () => {
    const defaultFilters: FilterState = {
      priceRange: [0, 2000000],
      location: "",
      propertyType: "",
      beds: "",
      baths: "",
      amenities: []
    };
    setFilters(defaultFilters);
    onFiltersChange?.(defaultFilters);
    onReset?.();
    console.log('Filters reset');
  };

  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'priceRange') return count + (value[0] !== 0 || value[1] !== 2000000 ? 1 : 0);
    if (key === 'amenities') return count + (value as string[]).length;
    return count + (value ? 1 : 0);
  }, 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid="button-toggle-filters"
            >
              {isExpanded ? 'Menos' : 'Mais'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              data-testid="button-reset-filters"
            >
              Limpar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Localização</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              placeholder="Pesquise pela cidade, endereço, bairro..."
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="pl-10"
              data-testid="input-location"
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label>Faixa de preço</Label>
          
          {/* Price Input Fields */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="min-price" className="text-xs text-muted-foreground">Mínimo</Label>
              <Input
                id="min-price"
                type="number"
                placeholder="0"
                value={filters.priceRange[0] || ''}
                onChange={(e) => {
                  const value = Math.max(0, Math.min(Number(e.target.value) || 0, filters.priceRange[1]));
                  handleFilterChange('priceRange', [value, filters.priceRange[1]]);
                }}
                className="text-sm"
                data-testid="input-min-price"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="max-price" className="text-xs text-muted-foreground">Máximo</Label>
              <Input
                id="max-price"
                type="number"
                placeholder="2000000"
                value={filters.priceRange[1] || ''}
                onChange={(e) => {
                  const value = Math.max(filters.priceRange[0], Math.min(Number(e.target.value) || 2000000, 2000000));
                  handleFilterChange('priceRange', [filters.priceRange[0], value]);
                }}
                className="text-sm"
                data-testid="input-max-price"
              />
            </div>
          </div>

          {/* Price Slider */}
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => handleFilterChange('priceRange', value)}
              max={2000000}
              min={0}
              step={25000}
              className="w-full"
              data-testid="slider-price-range"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>R${filters.priceRange[0].toLocaleString()}</span>
            <span>R${filters.priceRange[1].toLocaleString()}</span>
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <Label>Tipo de propriedade</Label>
          <Select 
            value={filters.propertyType}
            onValueChange={(value) => handleFilterChange('propertyType', value)}
          >
            <SelectTrigger data-testid="select-property-type">
              <SelectValue placeholder="Selecione o tipo de propriedade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="house">Casa</SelectItem>
              <SelectItem value="apartment">Apartamento</SelectItem>
              <SelectItem value="condo">Loja Comercial</SelectItem>
              <SelectItem value="townhouse">Condomínio</SelectItem>
              <SelectItem value="villa">Casa em vila</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Beds & Baths */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Quartos</Label>
            <Select 
              value={filters.beds}
              onValueChange={(value) => handleFilterChange('beds', value)}
            >
              <SelectTrigger data-testid="select-beds">
                <SelectValue placeholder="Qualquer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Banheiros</Label>
            <Select 
              value={filters.baths}
              onValueChange={(value) => handleFilterChange('baths', value)}
            >
              <SelectTrigger data-testid="select-baths">
                <SelectValue placeholder="Qualquer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Amenities - Expanded */}
        {isExpanded && (
          <div className="space-y-3">
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 gap-2">
              {amenitiesList.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={filters.amenities.includes(amenity)}
                    onCheckedChange={() => handleAmenityToggle(amenity)}
                    data-testid={`checkbox-${amenity.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                  <Label 
                    htmlFor={amenity} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Amenities */}
        {filters.amenities.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Amenities</Label>
            <div className="flex flex-wrap gap-1">
              {filters.amenities.map((amenity) => (
                <Badge 
                  key={amenity} 
                  variant="secondary" 
                  className="text-xs"
                  data-testid={`badge-amenity-${amenity.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {amenity}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => handleAmenityToggle(amenity)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}