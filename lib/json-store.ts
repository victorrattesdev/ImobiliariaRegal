import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type {
  InsertProperty,
  InsertUser,
  Property,
  UpdateProperty,
  User,
} from "@/shared/schema";
import type { PropertyFilters } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const PROPERTIES_FILE = path.join(DATA_DIR, "properties.json");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJsonFile<T>(filePath: string): Promise<T[]> {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T[];
  } catch {
    await writeJsonFile(filePath, []);
    return [];
  }
}

async function writeJsonFile<T>(filePath: string, data: T[]) {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function normalizeProperty(row: Record<string, unknown>): Property {
  return {
    id: String(row.id),
    title: String(row.title),
    description: (row.description as string | null) ?? null,
    price: String(row.price),
    location: String(row.location),
    address: (row.address as string | null) ?? null,
    city: String(row.city),
    state: String(row.state),
    zipCode:
      (row.zipCode as string | null) ??
      (row.zip_code as string | null) ??
      null,
    propertyType: String(row.propertyType ?? row.property_type),
    listingType: String(row.listingType ?? row.listing_type),
    bedrooms: Number(row.bedrooms),
    bathrooms: Number(row.bathrooms),
    sqft: Number(row.sqft),
    parking: (row.parking as number | null) ?? 0,
    yearBuilt:
      (row.yearBuilt as number | null) ??
      (row.year_built as number | null) ??
      null,
    lotSize:
      (row.lotSize as string | null) ??
      (row.lot_size as string | null) ??
      null,
    images: (row.images as string[] | null) ?? [],
    amenities: (row.amenities as string[] | null) ?? [],
    carSpaces:
      (row.carSpaces as number | null) ??
      (row.car_spaces as number | null) ??
      1,
    strongPoints:
      (row.strongPoints as string[] | null) ??
      (row.strong_points as string[] | null) ??
      [],
    iptu: (row.iptu as string | null) ?? null,
    mapEmbedUrl:
      (row.mapEmbedUrl as string | null) ??
      (row.map_embed_url as string | null) ??
      null,
    featured: Boolean(row.featured),
    status: String(row.status ?? "active"),
    createdAt: row.createdAt
      ? new Date(row.createdAt as string)
      : new Date((row.created_at as string) || Date.now()),
    updatedAt: row.updatedAt
      ? new Date(row.updatedAt as string)
      : new Date((row.updated_at as string) || Date.now()),
  };
}

function applyFilters(list: Property[], filters: PropertyFilters = {}) {
  let properties = [...list];

  if (filters.listingType) {
    properties = properties.filter((p) => p.listingType === filters.listingType);
  }
  if (filters.propertyType) {
    properties = properties.filter((p) => p.propertyType === filters.propertyType);
  }
  if (filters.minPrice !== undefined) {
    properties = properties.filter(
      (p) => parseFloat(p.price) >= filters.minPrice!
    );
  }
  if (filters.maxPrice !== undefined) {
    properties = properties.filter(
      (p) => parseFloat(p.price) <= filters.maxPrice!
    );
  }
  if (filters.minBeds !== undefined) {
    properties = properties.filter((p) => p.bedrooms >= filters.minBeds!);
  }
  if (filters.minBaths !== undefined) {
    properties = properties.filter((p) => p.bathrooms >= filters.minBaths!);
  }
  if (filters.city) {
    const city = filters.city.toLowerCase();
    properties = properties.filter(
      (p) =>
        p.city.toLowerCase().includes(city) ||
        p.address?.toLowerCase().includes(city) ||
        p.location.toLowerCase().includes(city)
    );
  }
  if (filters.excludeCity) {
    const excluded = filters.excludeCity.toLowerCase();
    properties = properties.filter(
      (p) => !p.city.toLowerCase().includes(excluded)
    );
  }
  if (filters.state) {
    const state = filters.state.toLowerCase();
    properties = properties.filter((p) => p.state.toLowerCase().includes(state));
  }
  if (filters.featured !== undefined) {
    properties = properties.filter((p) => p.featured === filters.featured);
  }
  if (filters.status) {
    properties = properties.filter((p) => p.status === filters.status);
  } else if (!filters.includeInactive) {
    properties = properties.filter((p) => p.status === "active");
  }
  if (filters.amenities?.length) {
    properties = properties.filter((p) =>
      filters.amenities!.every((a) => p.amenities?.includes(a))
    );
  }
  if (filters.q) {
    const term = filters.q.toLowerCase();
    properties = properties.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term) ||
        p.city.toLowerCase().includes(term) ||
        p.address?.toLowerCase().includes(term)
    );
  }

  switch (filters.sortBy) {
    case "price_asc":
      properties.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      break;
    case "price_desc":
      properties.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      break;
    case "oldest":
      properties.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      break;
    case "newest":
    default:
      properties.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
  }

  if (filters.offset) properties = properties.slice(filters.offset);
  if (filters.limit) properties = properties.slice(0, filters.limit);
  return properties;
}

export async function jsonGetProperties(filters?: PropertyFilters) {
  const rows = await readJsonFile<Record<string, unknown>>(PROPERTIES_FILE);
  return applyFilters(rows.map(normalizeProperty), filters);
}

export async function jsonGetProperty(id: string) {
  const rows = await readJsonFile<Record<string, unknown>>(PROPERTIES_FILE);
  const found = rows.map(normalizeProperty).find((p) => p.id === id);
  return found;
}

export async function jsonCreateProperty(data: InsertProperty) {
  const rows = await readJsonFile<Record<string, unknown>>(PROPERTIES_FILE);
  const property = normalizeProperty({
    ...data,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  rows.push(property as unknown as Record<string, unknown>);
  await writeJsonFile(PROPERTIES_FILE, rows);
  return property;
}

export async function jsonUpdateProperty(id: string, updates: UpdateProperty) {
  const rows = await readJsonFile<Record<string, unknown>>(PROPERTIES_FILE);
  const index = rows.findIndex((p) => p.id === id);
  if (index < 0) throw new Error("Imóvel não encontrado");
  const updated = normalizeProperty({
    ...normalizeProperty(rows[index]),
    ...updates,
    updatedAt: new Date().toISOString(),
  });
  rows[index] = updated as unknown as Record<string, unknown>;
  await writeJsonFile(PROPERTIES_FILE, rows);
  return updated;
}

export async function jsonDeleteProperty(id: string) {
  const rows = await readJsonFile<Record<string, unknown>>(PROPERTIES_FILE);
  await writeJsonFile(
    PROPERTIES_FILE,
    rows.filter((p) => p.id !== id)
  );
}

export async function jsonGetUserByUsername(username: string) {
  const rows = await readJsonFile<User>(USERS_FILE);
  return rows.find((u) => u.username === username);
}

export async function jsonGetUser(id: string) {
  const rows = await readJsonFile<User>(USERS_FILE);
  return rows.find((u) => u.id === id);
}

export async function jsonCreateUser(data: InsertUser) {
  const rows = await readJsonFile<User>(USERS_FILE);
  const user: User = {
    id: randomUUID(),
    username: data.username,
    email: data.email ?? null,
    password: data.password,
    firstName: data.firstName ?? null,
    lastName: data.lastName ?? null,
    profileImageUrl: data.profileImageUrl ?? null,
    role: data.role ?? "user",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  rows.push(user);
  await writeJsonFile(USERS_FILE, rows);
  return user;
}
