import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage, type PropertyFilters } from "./storage";
import { 
  insertPropertySchema, 
  updatePropertySchema, 
  type Property 
} from "@shared/schema";
import { z } from "zod";
import { setupInternalAuth, isAuthenticated } from "./internalAuth";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads/properties');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `property-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if the file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup internal authentication
  await setupInternalAuth(app);

  // Serve static files for uploaded images (secure static file serving)
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), { 
    fallthrough: false,
    index: false,
    redirect: false 
  }));

  // Property routes - GET all properties with filtering
  app.get("/api/properties", async (req, res) => {
    try {
      const filters: PropertyFilters = {};
      
      // Extract query parameters
      if (req.query.listingType) {
        filters.listingType = req.query.listingType as 'sale' | 'rent';
      }
      if (req.query.propertyType) {
        filters.propertyType = req.query.propertyType as string;
      }
      if (req.query.minPrice) {
        filters.minPrice = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filters.maxPrice = Number(req.query.maxPrice);
      }
      if (req.query.minBeds) {
        filters.minBeds = Number(req.query.minBeds);
      }
      if (req.query.minBaths) {
        filters.minBaths = Number(req.query.minBaths);
      }
      if (req.query.city) {
        filters.city = req.query.city as string;
      }
      if (req.query.state) {
        filters.state = req.query.state as string;
      }
      if (req.query.featured !== undefined) {
        filters.featured = req.query.featured === 'true';
      }
      if (req.query.status) {
        filters.status = req.query.status as string;
      }
      if (req.query.limit) {
        filters.limit = Number(req.query.limit);
      }
      if (req.query.offset) {
        filters.offset = Number(req.query.offset);
      }
      if (req.query.sortBy) {
        filters.sortBy = req.query.sortBy as 'price_asc' | 'price_desc' | 'newest' | 'oldest';
      }

      const properties = await storage.getProperties(filters);
      res.json({ success: true, data: properties });
    } catch (error) {
      console.error('Error fetching properties:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch properties' 
      });
    }
  });

  // Property routes - Search properties
  app.get("/api/properties/search", async (req, res) => {
    try {
      const { q, ...filterParams } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: 'Search query (q) parameter is required' 
        });
      }

      const filters: PropertyFilters = {};
      if (filterParams.listingType) {
        filters.listingType = filterParams.listingType as 'sale' | 'rent';
      }
      if (filterParams.propertyType) {
        filters.propertyType = filterParams.propertyType as string;
      }
      if (filterParams.limit) {
        filters.limit = Number(filterParams.limit);
      }

      const properties = await storage.searchProperties(q, filters);
      res.json({ success: true, data: properties });
    } catch (error) {
      console.error('Error searching properties:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to search properties' 
      });
    }
  });

  // Property routes - GET single property
  app.get("/api/properties/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const property = await storage.getProperty(id);
      
      if (!property) {
        return res.status(404).json({ 
          success: false, 
          error: 'Property not found' 
        });
      }

      res.json({ success: true, data: property });
    } catch (error) {
      console.error('Error fetching property:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch property' 
      });
    }
  });

  // Property routes - CREATE property (protected)
  app.post("/api/properties", isAuthenticated, async (req, res) => {
    try {
      const validation = insertPropertySchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid property data',
          details: validation.error.issues
        });
      }

      const property = await storage.createProperty(validation.data);
      res.status(201).json({ success: true, data: property });
    } catch (error) {
      console.error('Error creating property:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create property' 
      });
    }
  });

  // Property routes - UPDATE property (protected)
  app.put("/api/properties/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validation = updatePropertySchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid property data',
          details: validation.error.issues
        });
      }

      const property = await storage.updateProperty(id, validation.data);
      res.json({ success: true, data: property });
    } catch (error) {
      console.error('Error updating property:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({ 
          success: false, 
          error: 'Property not found' 
        });
      }
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update property' 
      });
    }
  });

  // Property routes - DELETE property (protected)
  app.delete("/api/properties/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProperty(id);
      res.json({ success: true, message: 'Property deleted successfully' });
    } catch (error) {
      console.error('Error deleting property:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete property' 
      });
    }
  });

  // Image upload endpoint for properties (protected)
  app.post("/api/properties/upload-images", isAuthenticated, (req, res, next) => {
    upload.any()(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ 
          success: false, 
          error: err.message || 'Failed to upload images' 
        });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'No images uploaded' 
        });
      }

      const files = req.files as Express.Multer.File[];
      const imageUrls = files.map(file => `/uploads/properties/${file.filename}`);

      res.json({ 
        success: true, 
        data: {
          imageUrls,
          count: files.length
        }
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to upload images' 
      });
    }
  });

  // Update property images endpoint (protected)
  app.put("/api/properties/:id/images", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { images } = req.body;

      if (!Array.isArray(images)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Images must be an array' 
        });
      }

      const property = await storage.updateProperty(id, { images });
      res.json({ success: true, data: property });
    } catch (error) {
      console.error('Error updating property images:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({ 
          success: false, 
          error: 'Property not found' 
        });
      }
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update property images' 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
