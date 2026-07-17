export type PropertyFilters = {
  listingType?: "sale" | "rent";
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  minBaths?: number;
  city?: string;
  excludeCity?: string;
  state?: string;
  featured?: boolean;
  status?: string;
  amenities?: string[];
  q?: string;
  limit?: number;
  offset?: number;
  sortBy?: "price_asc" | "price_desc" | "newest" | "oldest";
  includeInactive?: boolean;
};
