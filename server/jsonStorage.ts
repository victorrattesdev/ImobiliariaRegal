import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import type { IStorage, PropertyFilters } from './storage';
import type { 
  User,
  InsertUser,
  Property, 
  InsertProperty, 
  UpdateProperty 
} from '@shared/schema';

// JSON storage files
const DATA_DIR = 'data';
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Helper functions for file operations
async function readJsonFile<T>(filePath: string, defaultValue: T[] = []): Promise<T[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    // File doesn't exist or is invalid, return default value
    await writeJsonFile(filePath, defaultValue);
    return defaultValue as T[];
  }
}

async function writeJsonFile<T>(filePath: string, data: T[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export class JsonStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const users = await readJsonFile<User>(USERS_FILE);
    return users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await readJsonFile<User>(USERS_FILE);
    return users.find(user => user.username === username);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const users = await readJsonFile<User>(USERS_FILE);
    
    const newUser: User = {
      id: randomUUID(),
      username: userData.username,
      email: userData.email || null,
      password: userData.password,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      role: userData.role || 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    users.push(newUser);
    await writeJsonFile(USERS_FILE, users);
    return newUser;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const users = await readJsonFile<User>(USERS_FILE);
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = {
      ...users[userIndex],
      ...userData,
      updatedAt: new Date(),
    };
    
    users[userIndex] = updatedUser;
    await writeJsonFile(USERS_FILE, users);
    return updatedUser;
  }

  // Property methods
  async getProperties(filters?: PropertyFilters): Promise<Property[]> {
    let properties = await readJsonFile<Property>(PROPERTIES_FILE);
    
    // Apply filters
    if (filters) {
      if (filters.listingType) {
        properties = properties.filter(p => p.listingType === filters.listingType);
      }
      if (filters.propertyType) {
        properties = properties.filter(p => p.propertyType === filters.propertyType);
      }
      if (filters.minPrice) {
        properties = properties.filter(p => parseFloat(p.price) >= filters.minPrice!);
      }
      if (filters.maxPrice) {
        properties = properties.filter(p => parseFloat(p.price) <= filters.maxPrice!);
      }
      if (filters.minBeds) {
        properties = properties.filter(p => p.bedrooms >= filters.minBeds!);
      }
      if (filters.minBaths) {
        properties = properties.filter(p => p.bathrooms >= filters.minBaths!);
      }
      if (filters.city) {
        properties = properties.filter(p => p.city.toLowerCase().includes(filters.city!.toLowerCase()));
      }
      if (filters.state) {
        properties = properties.filter(p => p.state.toLowerCase().includes(filters.state!.toLowerCase()));
      }
      if (filters.featured !== undefined) {
        properties = properties.filter(p => p.featured === filters.featured);
      }
      if (filters.status) {
        properties = properties.filter(p => p.status === filters.status);
      }

      // Apply sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price_asc':
            properties.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
          case 'price_desc':
            properties.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
          case 'newest':
            properties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case 'oldest':
            properties.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            break;
        }
      }

      // Apply pagination
      if (filters.offset) {
        properties = properties.slice(filters.offset);
      }
      if (filters.limit) {
        properties = properties.slice(0, filters.limit);
      }
    }
    
    return properties;
  }

  async getProperty(id: string): Promise<Property | undefined> {
    const properties = await readJsonFile<Property>(PROPERTIES_FILE);
    return properties.find(property => property.id === id);
  }

  async createProperty(propertyData: InsertProperty): Promise<Property> {
    const properties = await readJsonFile<Property>(PROPERTIES_FILE);
    
    const newProperty: Property = {
      id: randomUUID(),
      title: propertyData.title,
      description: propertyData.description || null,
      price: propertyData.price,
      location: propertyData.location,
      address: propertyData.address || null,
      city: propertyData.city,
      state: propertyData.state,
      zipCode: propertyData.zipCode || null,
      propertyType: propertyData.propertyType,
      listingType: propertyData.listingType,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      sqft: propertyData.sqft,
      parking: propertyData.parking || 0,
      yearBuilt: propertyData.yearBuilt || null,
      lotSize: propertyData.lotSize || null,
      images: propertyData.images || [],
      amenities: propertyData.amenities || [],
      carSpaces: propertyData.carSpaces || 1,
      strongPoints: propertyData.strongPoints || [],
      iptu: propertyData.iptu || null, // New IPTU field
      mapEmbedUrl: propertyData.mapEmbedUrl || null,
      featured: propertyData.featured || false,
      status: propertyData.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    properties.push(newProperty);
    await writeJsonFile(PROPERTIES_FILE, properties);
    return newProperty;
  }

  async updateProperty(id: string, updates: UpdateProperty): Promise<Property> {
    const properties = await readJsonFile<Property>(PROPERTIES_FILE);
    const propertyIndex = properties.findIndex(property => property.id === id);
    
    if (propertyIndex === -1) {
      throw new Error(`Property with id ${id} not found`);
    }
    
    const updatedProperty = {
      ...properties[propertyIndex],
      ...updates,
      updatedAt: new Date(),
    };
    
    properties[propertyIndex] = updatedProperty;
    await writeJsonFile(PROPERTIES_FILE, properties);
    return updatedProperty;
  }

  async deleteProperty(id: string): Promise<void> {
    const properties = await readJsonFile<Property>(PROPERTIES_FILE);
    const filteredProperties = properties.filter(property => property.id !== id);
    
    if (properties.length === filteredProperties.length) {
      throw new Error(`Property with id ${id} not found`);
    }
    
    await writeJsonFile(PROPERTIES_FILE, filteredProperties);
  }

  async searchProperties(query: string, filters?: PropertyFilters): Promise<Property[]> {
    const properties = await this.getProperties(filters);
    
    if (!query) {
      return properties;
    }
    
    const searchTerm = query.toLowerCase();
    
    return properties.filter(property => 
      property.title.toLowerCase().includes(searchTerm) ||
      property.description?.toLowerCase().includes(searchTerm) ||
      property.location.toLowerCase().includes(searchTerm) ||
      property.address?.toLowerCase().includes(searchTerm) ||
      property.city.toLowerCase().includes(searchTerm) ||
      property.state.toLowerCase().includes(searchTerm) ||
      property.propertyType.toLowerCase().includes(searchTerm) ||
      property.amenities?.some((amenity: string) => amenity.toLowerCase().includes(searchTerm)) ||
      property.strongPoints?.some((point: string) => point.toLowerCase().includes(searchTerm))
    );
  }
}