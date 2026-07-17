import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { db, usePostgres } from "@/lib/db";
import {
  jsonCreateProperty,
  jsonCreateUser,
  jsonDeleteProperty,
  jsonGetProperties,
  jsonGetProperty,
  jsonGetUser,
  jsonGetUserByUsername,
  jsonUpdateProperty,
} from "@/lib/json-store";
import {
  properties,
  users,
  type InsertProperty,
  type InsertUser,
  type Property,
  type UpdateProperty,
  type User,
} from "@/shared/schema";

import type { PropertyFilters } from "@/lib/types";
import { formatAmenity } from "@/lib/format";

export type { PropertyFilters };

function buildConditions(filters: PropertyFilters): SQL[] {
  const conditions: SQL[] = [];

  if (filters.listingType) {
    conditions.push(eq(properties.listingType, filters.listingType));
  }
  if (filters.propertyType) {
    conditions.push(eq(properties.propertyType, filters.propertyType));
  }
  if (filters.minPrice !== undefined) {
    conditions.push(gte(properties.price, filters.minPrice.toString()));
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(lte(properties.price, filters.maxPrice.toString()));
  }
  if (filters.minBeds !== undefined) {
    conditions.push(gte(properties.bedrooms, filters.minBeds));
  }
  if (filters.minBaths !== undefined) {
    conditions.push(gte(properties.bathrooms, filters.minBaths));
  }
  if (filters.city) {
    conditions.push(ilike(properties.city, `%${filters.city}%`));
  }
  if (filters.excludeCity) {
    conditions.push(
      sql`LOWER(${properties.city}) NOT LIKE ${"%" + filters.excludeCity.toLowerCase() + "%"}`
    );
  }
  if (filters.state) {
    conditions.push(ilike(properties.state, `%${filters.state}%`));
  }
  if (filters.featured !== undefined) {
    conditions.push(eq(properties.featured, filters.featured));
  }
  if (filters.status) {
    conditions.push(eq(properties.status, filters.status));
  } else if (!filters.includeInactive) {
    conditions.push(eq(properties.status, "active"));
  }
  if (filters.amenities?.length) {
    for (const amenity of filters.amenities) {
      conditions.push(sql`${amenity} = ANY(${properties.amenities})`);
    }
  }
  if (filters.q) {
    const term = `%${filters.q}%`;
    conditions.push(
      or(
        ilike(properties.title, term),
        ilike(properties.description, term),
        ilike(properties.location, term),
        ilike(properties.city, term),
        ilike(properties.address, term)
      )!
    );
  }

  return conditions;
}

export async function getProperties(
  filters: PropertyFilters = {}
): Promise<Property[]> {
  if (!usePostgres || !db) return jsonGetProperties(filters);

  const conditions = buildConditions(filters);
  let query = db.select().from(properties);

  if (conditions.length) {
    query = query.where(and(...conditions)) as typeof query;
  }

  switch (filters.sortBy) {
    case "price_asc":
      query = query.orderBy(asc(properties.price)) as typeof query;
      break;
    case "price_desc":
      query = query.orderBy(desc(properties.price)) as typeof query;
      break;
    case "oldest":
      query = query.orderBy(asc(properties.createdAt)) as typeof query;
      break;
    case "newest":
    default:
      query = query.orderBy(
        desc(properties.featured),
        desc(properties.createdAt)
      ) as typeof query;
      break;
  }

  if (filters.limit) query = query.limit(filters.limit) as typeof query;
  if (filters.offset) query = query.offset(filters.offset) as typeof query;

  return query;
}

export async function getProperty(id: string) {
  if (!usePostgres || !db) return jsonGetProperty(id);
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id))
    .limit(1);
  return property;
}

export async function getDistinctAmenities(scope?: {
  city?: string;
  excludeCity?: string;
}): Promise<string[]> {
  const rows = await getProperties({
    city: scope?.city,
    excludeCity: scope?.excludeCity,
    limit: 500,
    sortBy: "newest",
  });

  const unique = new Set<string>();
  for (const row of rows) {
    for (const amenity of row.amenities ?? []) {
      const value = amenity.trim();
      if (value) unique.add(value);
    }
  }

  return Array.from(unique).sort((a, b) =>
    formatAmenity(a).localeCompare(formatAmenity(b), "pt-BR", {
      sensitivity: "base",
    })
  );
}

export async function getRelatedProperties(
  current: Property,
  limit = 8
): Promise<Property[]> {
  const { rankRelatedProperties } = await import("@/lib/related-properties");

  const pool = await getProperties({
    listingType: current.listingType as "sale" | "rent",
    limit: 60,
    sortBy: "newest",
  });

  const ranked = rankRelatedProperties(current, pool, limit);
  if (ranked.length >= Math.min(4, limit)) return ranked;

  // Fallback: same city if scoring returned too few
  const sameCity = await getProperties({
    city: current.city,
    listingType: current.listingType as "sale" | "rent",
    limit: 20,
    sortBy: "newest",
  });

  const merged = new Map<string, Property>();
  for (const item of [...ranked, ...sameCity]) {
    if (item.id === current.id) continue;
    merged.set(item.id, item);
  }
  return Array.from(merged.values()).slice(0, limit);
}

export async function createProperty(data: InsertProperty) {
  if (!usePostgres || !db) return jsonCreateProperty(data);
  const [property] = await db.insert(properties).values(data).returning();
  return property;
}

export async function updateProperty(id: string, updates: UpdateProperty) {
  if (!usePostgres || !db) return jsonUpdateProperty(id, updates);
  const [property] = await db
    .update(properties)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(properties.id, id))
    .returning();
  if (!property) throw new Error("Imóvel não encontrado");
  return property;
}

export async function deleteProperty(id: string) {
  if (!usePostgres || !db) return jsonDeleteProperty(id);
  await db.delete(properties).where(eq(properties.id, id));
}

export async function getUserByUsername(
  username: string
): Promise<User | undefined> {
  if (!usePostgres || !db) return jsonGetUserByUsername(username);
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  return user;
}

export async function getUser(id: string) {
  if (!usePostgres || !db) return jsonGetUser(id);
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user;
}

export async function createUser(data: InsertUser) {
  if (!usePostgres || !db) return jsonCreateUser(data);
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

export function parsePropertyFilters(
  searchParams: URLSearchParams
): PropertyFilters {
  const filters: PropertyFilters = {};

  const listingType = searchParams.get("listingType");
  if (listingType === "sale" || listingType === "rent") {
    filters.listingType = listingType;
  }

  const propertyType = searchParams.get("propertyType");
  if (propertyType) filters.propertyType = propertyType;

  const minPrice = searchParams.get("minPrice");
  if (minPrice && !Number.isNaN(Number(minPrice))) {
    filters.minPrice = Number(minPrice);
  }
  const maxPrice = searchParams.get("maxPrice");
  if (maxPrice && !Number.isNaN(Number(maxPrice))) {
    filters.maxPrice = Number(maxPrice);
  }
  const minBeds = searchParams.get("minBeds");
  if (minBeds && !Number.isNaN(Number(minBeds))) {
    filters.minBeds = Number(minBeds);
  }
  const minBaths = searchParams.get("minBaths");
  if (minBaths && !Number.isNaN(Number(minBaths))) {
    filters.minBaths = Number(minBaths);
  }
  const city = searchParams.get("city");
  if (city) filters.city = city;
  const excludeCity = searchParams.get("excludeCity");
  if (excludeCity) filters.excludeCity = excludeCity;
  const state = searchParams.get("state");
  if (state) filters.state = state;
  const featured = searchParams.get("featured");
  if (featured !== null) filters.featured = featured === "true";
  const status = searchParams.get("status");
  if (status) filters.status = status;
  const q = searchParams.get("q");
  if (q) filters.q = q.trim();
  const amenities = searchParams.get("amenities");
  if (amenities) {
    filters.amenities = amenities
      .split(",")
      .map((a) => {
        try {
          return decodeURIComponent(a.trim());
        } catch {
          return a.trim();
        }
      })
      .filter(Boolean);
  }
  const limit = searchParams.get("limit");
  if (limit && !Number.isNaN(Number(limit))) filters.limit = Number(limit);
  const offset = searchParams.get("offset");
  if (offset && !Number.isNaN(Number(offset))) filters.offset = Number(offset);
  const sortBy = searchParams.get("sortBy");
  if (
    sortBy === "price_asc" ||
    sortBy === "price_desc" ||
    sortBy === "newest" ||
    sortBy === "oldest"
  ) {
    filters.sortBy = sortBy;
  }
  if (searchParams.get("includeInactive") === "true") {
    filters.includeInactive = true;
  }

  return filters;
}
