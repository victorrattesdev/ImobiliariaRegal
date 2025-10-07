import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Car,
  Eye 
} from "lucide-react";

interface PropertyCardProps {
  id: string;
  title: string;
  price: string;
  location: string;
  image: string;
  beds: number;
  baths: number;
  sqft: number;
  parking?: number;
  type: 'sale' | 'rent';
  featured?: boolean;
  onFavorite?: (id: string) => void;
}

export default function PropertyCard({
  id,
  title,
  price,
  location,
  image,
  beds,
  baths,
  sqft,
  parking,
  type,
  featured = false,
  onFavorite
}: PropertyCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [, setLocation] = useLocation();

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    onFavorite?.(id);
    console.log('Property favorited:', id, !isFavorited);
  };

  const handleView = () => {
    setLocation(`/property/${id}`);
    console.log('Navigate to property:', id);
  };

  return (
    <Card className="group hover-elevate cursor-pointer transition-all duration-200" onClick={handleView}>
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover rounded-t-lg"
          data-testid={`img-property-${id}`}
        />
        <div className="absolute top-2 left-2 flex gap-2">
          {featured && (
            <Badge variant="destructive" className="text-xs">
              Featured
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {type === 'sale' ? 'Venda' : 'Aluguel'}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-background/80 hover:bg-background"
          onClick={handleFavorite}
          data-testid={`button-favorite-${id}`}
        >
          <Heart 
            className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-foreground'}`} 
          />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg leading-tight" data-testid={`text-title-${id}`}>
              {title}
            </h3>
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              <span className="text-sm" data-testid={`text-location-${id}`}>{location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary" data-testid={`text-price-${id}`}>
              {price}
            </span>
            {type === 'rent' && (
              <span className="text-sm text-muted-foreground"></span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span data-testid={`text-beds-${id}`}>{beds}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span data-testid={`text-baths-${id}`}>{baths}</span>
            </div>
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              <span data-testid={`text-sqft-${id}`}>{sqft.toLocaleString()} m²</span>
            </div>
            {parking && (
              <div className="flex items-center gap-1">
                <Car className="h-4 w-4" />
                <span data-testid={`text-parking-${id}`}>{parking}</span>
              </div>
            )}
          </div>

          <Button 
            className="w-full mt-3" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleView();
            }}
            data-testid={`button-view-details-${id}`}
          >
            <Eye className="h-4 w-4 mr-2" />
            Veja Mais
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}