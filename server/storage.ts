// Blueprint reference: javascript_database
import { 
  users, 
  properties,
  type User, 
  type InsertUser,
  type Property,
  type InsertProperty,
  type UpdateProperty
} from "@shared/schema";
import { db } from "./db";
import { eq, like, and, or, gte, lte, desc, asc } from "drizzle-orm";
import { JsonStorage } from "./jsonStorage";

export interface IStorage {
  // User methods for internal authentication
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User>;
  
  // Property methods
  getProperties(filters?: PropertyFilters): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, updates: UpdateProperty): Promise<Property>;
  deleteProperty(id: string): Promise<void>;
  searchProperties(query: string, filters?: PropertyFilters): Promise<Property[]>;
}

export interface PropertyFilters {
  listingType?: 'sale' | 'rent';
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  minBaths?: number;
  city?: string;
  state?: string;
  featured?: boolean;
  status?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return user;
  }

  // Property methods
  async getProperties(filters: PropertyFilters = {}): Promise<Property[]> {
    let query = db.select().from(properties);
    
    const conditions = [];
    
    if (filters.listingType) {
      conditions.push(eq(properties.listingType, filters.listingType));
    }
    
    if (filters.propertyType) {
      conditions.push(eq(properties.propertyType, filters.propertyType));
    }
    
    if (filters.minPrice) {
      conditions.push(gte(properties.price, filters.minPrice.toString()));
    }
    
    if (filters.maxPrice) {
      conditions.push(lte(properties.price, filters.maxPrice.toString()));
    }
    
    if (filters.minBeds) {
      conditions.push(gte(properties.bedrooms, filters.minBeds));
    }
    
    if (filters.minBaths) {
      conditions.push(gte(properties.bathrooms, filters.minBaths));
    }
    
    if (filters.city) {
      conditions.push(like(properties.city, `%${filters.city}%`));
    }
    
    if (filters.state) {
      conditions.push(eq(properties.state, filters.state));
    }
    
    if (filters.featured !== undefined) {
      conditions.push(eq(properties.featured, filters.featured));
    }
    
    if (filters.status) {
      conditions.push(eq(properties.status, filters.status));
    } else {
      // Default to active properties only
      conditions.push(eq(properties.status, 'active'));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_asc':
        query = query.orderBy(asc(properties.price));
        break;
      case 'price_desc':
        query = query.orderBy(desc(properties.price));
        break;
      case 'oldest':
        query = query.orderBy(asc(properties.createdAt));
        break;
      case 'newest':
      default:
        query = query.orderBy(desc(properties.createdAt));
        break;
    }

    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async getProperty(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property || undefined;
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const [property] = await db
      .insert(properties)
      .values({
        ...insertProperty,
        updatedAt: new Date()
      })
      .returning();
    return property;
  }

  async updateProperty(id: string, updates: UpdateProperty): Promise<Property> {
    const [property] = await db
      .update(properties)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(properties.id, id))
      .returning();
    
    if (!property) {
      throw new Error(`Property with id ${id} not found`);
    }
    
    return property;
  }

  async deleteProperty(id: string): Promise<void> {
    await db.delete(properties).where(eq(properties.id, id));
  }

  async searchProperties(query: string, filters: PropertyFilters = {}): Promise<Property[]> {
    const searchConditions = [
      like(properties.title, `%${query}%`),
      like(properties.description, `%${query}%`),
      like(properties.location, `%${query}%`),
      like(properties.city, `%${query}%`),
      like(properties.address, `%${query}%`)
    ];

    const filterConditions = [];
    
    if (filters.listingType) {
      filterConditions.push(eq(properties.listingType, filters.listingType));
    }
    
    if (filters.propertyType) {
      filterConditions.push(eq(properties.propertyType, filters.propertyType));
    }
    
    // Default to active properties
    filterConditions.push(eq(properties.status, 'active'));

    let dbQuery = db.select().from(properties);
    
    if (searchConditions.length > 0 || filterConditions.length > 0) {
      const allConditions = [];
      
      if (searchConditions.length > 0) {
        // Use OR for search terms so any field can match
        allConditions.push(or(...searchConditions));
      }
      
      if (filterConditions.length > 0) {
        allConditions.push(and(...filterConditions));
      }
      
      dbQuery = dbQuery.where(and(...allConditions));
    }

    dbQuery = dbQuery.orderBy(desc(properties.featured), desc(properties.createdAt));

    if (filters.limit) {
      dbQuery = dbQuery.limit(filters.limit);
    }

    return await dbQuery;
  }
}

export const storage = new JsonStorage();
