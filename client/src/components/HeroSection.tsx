import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, TrendingUp, Users, Award } from "lucide-react";
import heroImage from '@assets/generated_images/Luxury_house_hero_image_f495f766.png';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
    console.log('Hero search triggered:', searchQuery);
  };

  const stats = [
    { icon: TrendingUp, label: "Propriedades vendidas", value: "200+" },
    { icon: Users, label: "Clientes satisfeitos", value: "1000+" },
    { icon: Award, label: "Anos de experiência", value: "25+" }
  ];

  return (
    <section className="relative min-h-[600px] flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Luxury real estate"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-2xl">
          {/* Badge */}
          <Badge variant="secondary" className="mb-4 bg-background/20 text-white border-white/20">
            <Award className="h-3 w-3 mr-1" />
            #1 Imobiliária do Rio de Janeiro
          </Badge>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Encontre a sua
            <span className="block text-chart-3">Casa dos sonhos</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Descubra aqui propriedades perfeitas e adequeadas para o seu estilo de visa.
            Pesquisa dentre várias opções disponíveis.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-3 p-2 bg-background/95 backdrop-blur rounded-lg">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Pesquisa pelo endereço, bairro, ou tipo de propriedade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-0 bg-transparent focus:ring-0"
                  data-testid="input-hero-search"
                />
              </div>
              <Button 
                type="submit" 
                size="lg"
                className="whitespace-nowrap"
                data-testid="button-hero-search"
              >
                <Search className="h-4 w-4 mr-2" />
                Pesquise propriedades
              </Button>
            </div>
          </form>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Button 
              variant="outline" 
              className="bg-background/20 border-white/20 text-white hover:bg-background/30"
              data-testid="button-quick-luxury"
            >
              Propriedades de luxo
            </Button>
            <Button 
              variant="outline" 
              className="bg-background/20 border-white/20 text-white hover:bg-background/30"
              data-testid="button-quick-condos"
            >
              Apartamentos
            </Button>
            <Button 
              variant="outline" 
              className="bg-background/20 border-white/20 text-white hover:bg-background/30"
              data-testid="button-quick-rentals"
            >
              Lojas comerciais
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 text-white"
                data-testid={`stat-${index}`}
              >
                <div className="p-2 bg-white/10 rounded-lg">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}