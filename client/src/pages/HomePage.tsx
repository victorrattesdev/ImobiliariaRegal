import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FilterPanel from "@/components/FilterPanel";
import PropertyGrid from "@/components/PropertyGrid";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";

interface FilterState {
  priceRange: [number, number];
  location: string;
  propertyType: string;
  beds: string;
  baths: string;
  amenities: string[];
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'buy' | 'rent'>('buy');
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 2000000],
    location: "",
    propertyType: "",
    beds: "",
    baths: "",
    amenities: []
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Search query updated:', query);
  };

  const handleTabChange = (tab: 'buy' | 'rent') => {
    setActiveTab(tab);
    console.log('Tab changed to:', tab);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    console.log('Filters applied:', newFilters);
  };

  const handleFiltersReset = () => {
    setFilters({
      priceRange: [0, 2000000],
      location: "",
      propertyType: "",
      beds: "",
      baths: "",
      amenities: []
    });
    console.log('Filters reset');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSearch={handleSearch}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      
      <HeroSection onSearch={handleSearch} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24">
              <FilterPanel 
                onFiltersChange={handleFiltersChange}
                onReset={handleFiltersReset}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-mobile-filters"
                className="w-full"
              >
                {showFilters ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Hide Filters
                  </>
                ) : (
                  <>
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Show Filters
                  </>
                )}
              </Button>
            </div>

            <PropertyGrid
              searchQuery={searchQuery}
              activeTab={activeTab}
              filters={filters}
            />
          </div>
        </div>
      </main>
    </div>
  );
}