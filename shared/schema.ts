import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Users Table ---
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
});

// --- Sales Table ---
export const sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  link: text("link"),
  state: text("state").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Transactions Table ---
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull().defaultNow(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  saleId: varchar("sale_id").references(() => sales.id, { onDelete: 'cascade' }), // Foreign key placeholder
});

// --- RELATIONS ---
export const salesRelations = relations(sales, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  sale: one(sales, {
    fields: [transactions.saleId],
    references: [sales.id],
  }),
}));


// --- Zod Schemas and Types ---
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  hashedPassword: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PublicUser = Omit<User, "hashedPassword">;

export type Sale = typeof sales.$inferSelect;

export const insertTransactionSchema = createInsertSchema(transactions, {
  amount: z.coerce.number(),
}).omit({
  id: true,
  date: true,
});
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type TransactionWithSaleDetails = Transaction & {
  sale: Sale | null;
};
