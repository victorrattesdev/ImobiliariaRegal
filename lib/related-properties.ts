import type { Property } from "@/shared/schema";

function tokens(text: string | null | undefined): Set<string> {
  if (!text) return new Set();
  return new Set(
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 2)
  );
}

function sharedTokenCount(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const token of a) {
    if (b.has(token)) count += 1;
  }
  return count;
}

function priceScore(current: number, other: number): number {
  if (!current || !other) return 0;
  const ratio = Math.abs(current - other) / current;
  if (ratio <= 0.15) return 25;
  if (ratio <= 0.3) return 18;
  if (ratio <= 0.45) return 10;
  if (ratio <= 0.6) return 4;
  return 0;
}

export function scoreRelatedProperty(
  current: Property,
  candidate: Property
): number {
  let score = 0;
  const currentPrice = Number(current.price) || 0;
  const candidatePrice = Number(candidate.price) || 0;

  if (
    current.city &&
    candidate.city &&
    current.city.toLowerCase() === candidate.city.toLowerCase()
  ) {
    score += 45;
  }

  if (current.listingType === candidate.listingType) score += 20;
  if (current.propertyType === candidate.propertyType) score += 14;

  const currentAmenities = new Set(current.amenities ?? []);
  const overlap = (candidate.amenities ?? []).filter((a) =>
    currentAmenities.has(a)
  ).length;
  score += Math.min(overlap * 8, 32);

  score += priceScore(currentPrice, candidatePrice);

  const bedDiff = Math.abs((current.bedrooms ?? 0) - (candidate.bedrooms ?? 0));
  if (bedDiff === 0) score += 12;
  else if (bedDiff === 1) score += 6;

  const areaDiff = Math.abs((current.sqft ?? 0) - (candidate.sqft ?? 0));
  if (current.sqft && areaDiff / current.sqft <= 0.25) score += 8;

  const locationTokens = tokens(
    `${current.address ?? ""} ${current.location ?? ""} ${current.city ?? ""}`
  );
  const candidateTokens = tokens(
    `${candidate.address ?? ""} ${candidate.location ?? ""} ${candidate.city ?? ""}`
  );
  score += Math.min(sharedTokenCount(locationTokens, candidateTokens) * 6, 24);

  return score;
}

export function rankRelatedProperties(
  current: Property,
  candidates: Property[],
  limit = 8
): Property[] {
  return candidates
    .filter((p) => p.id !== current.id && p.status === "active")
    .map((property) => ({
      property,
      score: scoreRelatedProperty(current, property),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.property);
}
