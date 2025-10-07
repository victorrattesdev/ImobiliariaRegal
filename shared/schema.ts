import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for internal authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default('user'), // user, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  location: text("location").notNull(),
  address: text("address"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code"),
  propertyType: text("property_type").notNull(), // house, apartment, condo, townhouse, villa
  listingType: text("listing_type").notNull(), // sale, rent
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  sqft: integer("sqft").notNull(),
  parking: integer("parking").default(0),
  yearBuilt: integer("year_built"),
  lotSize: decimal("lot_size", { precision: 10, scale: 2 }),
  images: text("images").array().default(sql`'{}'::text[]`),
  amenities: text("amenities").array().default(sql`'{}'::text[]`),
  carSpaces: integer("car_spaces").default(1), // 1, 2, 3, or 4 car spaces
  strongPoints: text("strong_points").array().default(sql`'{}'::text[]`), // list of property strong points
  iptu: decimal("iptu", { precision: 10, scale: 2 }), // Brazilian property tax (IPTU)
  mapEmbedUrl: text("map_embed_url"), // embed map URL for the property
  featured: boolean("featured").default(false),
  status: text("status").notNull().default('active'), // active, pending, sold, inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  properties: many(properties),
}));

export const propertyRelations = relations(properties, ({ one }) => ({
  createdBy: one(users, { 
    fields: [properties.id], 
    references: [users.id] 
  }),
}));

// User schemas for internal authentication
export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// Property schemas
export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePropertySchema = insertPropertySchema.partial();

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type UpdateProperty = z.infer<typeof updatePropertySchema>;
export type Property = typeof properties.$inferSelect;
