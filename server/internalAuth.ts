import bcrypt from "bcrypt";
import session from "express-session";
import createMemoryStore from "memorystore";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { loginSchema } from "@shared/schema";

// Session configuration for internal auth using memory storage
export function getSession() {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET environment variable is required in production');
  }
  if (!sessionSecret && process.env.NODE_ENV !== 'development') {
    throw new Error('SESSION_SECRET environment variable is required');
  }

  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const MemoryStore = createMemoryStore(session);
  const sessionStore = new MemoryStore({
    checkPeriod: sessionTtl
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const isHttps = process.env.REPLIT_DOMAINS || process.env.NODE_ENV === 'production';

  return session({
    secret: sessionSecret || 'dev-secret-key-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

// Hash password utility
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Verify password utility
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Setup internal authentication
export async function setupInternalAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid login data',
          details: validation.error.issues
        });
      }

      const { username, password } = validation.data;
      
      // Find user by username
      const user = await storage.getUserByUsername(username);
      if (!user || !user.password) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid username or password' 
        });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid username or password' 
        });
      }

      // Store user in session
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      res.json({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to logout' 
        });
      }
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });

  // Get current user endpoint
  app.get("/api/auth/user", isAuthenticated, (req, res) => {
    const user = (req.session as any).user;
    res.json(user);
  });
}

// Authentication middleware
export const isAuthenticated: RequestHandler = (req, res, next) => {
  const userId = (req.session as any)?.userId;
  
  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized - please login' 
    });
  }

  next();
};