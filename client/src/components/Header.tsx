import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Home, 
  Building, 
  MapPin, 
  User, 
  Settings,
  Moon,
  Sun 
} from "lucide-react";

interface HeaderProps {
  onSearch?: (query: string) => void;
  activeTab?: 'buy' | 'rent';
  onTabChange?: (tab: 'buy' | 'rent') => void;
}

export default function Header({ onSearch, activeTab = 'buy', onTabChange }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
    console.log('Search triggered:', searchQuery);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    console.log('Theme toggled:', !isDark ? 'dark' : 'light');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Home className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Regal Imobiliária</span>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={activeTab === 'buy' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange?.('buy')}
              data-testid="button-buy-tab"
              className="h-8"
            >
              <Building className="h-4 w-4 mr-1" />
              Comprar
            </Button>
            <Button
              variant={activeTab === 'rent' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange?.('rent')}
              data-testid="button-rent-tab"
              className="h-8"
            >
              <MapPin className="h-4 w-4 mr-1" />
              Alugar
            </Button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center gap-2 flex-1 max-w-md mx-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquise pelo endereço, tipo de propriedade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Button type="submit" data-testid="button-search">
              Pesquisar
            </Button>
          </form>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden pb-4">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-mobile-search"
              />
            </div>
            <Button type="submit" data-testid="button-mobile-search">
              Search
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}