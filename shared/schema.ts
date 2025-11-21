import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(), // Changed from password to hashedPassword
});

export const businessMetrics = pgTable("business_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull().defaultNow(),
  revenue: numeric("revenue", { precision: 10, scale: 2 }).notNull(),
  sales: numeric("sales", { precision: 10, scale: 0 }).notNull(),
  expenses: numeric("expenses", { precision: 10, scale: 2 }),
  profit: numeric("profit", { precision: 10, scale: 2 }),
  notes: text("notes"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  hashedPassword: true, // Changed from password to hashedPassword
});

export const insertBusinessMetricSchema = createInsertSchema(businessMetrics).omit({
  id: true,
}).extend({
  date: z.string().optional(),
  revenue: z.string().or(z.number()),
  sales: z.string().or(z.number()),
  expenses: z.string().or(z.number()).optional(),
  profit: z.string().or(z.number()).optional(),
  notes: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PublicUser = Omit<User, "hashedPassword">;
export type BusinessMetric = typeof businessMetrics.$inferSelect;
export type InsertBusinessMetric = z.infer<typeof insertBusinessMetricSchema>;

export const salesItems = pgTable("sales_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  link: text("link"),
  name: text("name").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 0 }).notNull(),
  state: text("state").notNull().default("pending"), // "pending" or "done"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSalesItemSchema = createInsertSchema(salesItems).omit({
  id: true,
  createdAt: true,
});

export type SalesItem = typeof salesItems.$inferSelect;
export type InsertSalesItem = z.infer<typeof insertSalesItemSchema>;
