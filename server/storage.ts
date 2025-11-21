import { type User, type InsertUser, type BusinessMetric, type InsertBusinessMetric, type SalesItem, type InsertSalesItem, users, businessMetrics, salesItems } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema: { users, businessMetrics, salesItems } });

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getBusinessMetrics(): Promise<BusinessMetric[]>;
  createBusinessMetric(metric: InsertBusinessMetric): Promise<BusinessMetric>;
  getSalesItems(): Promise<SalesItem[]>;
  createSalesItem(item: InsertSalesItem): Promise<SalesItem>;
  updateSalesItem(id: string, updates: Partial<SalesItem>): Promise<SalesItem | undefined>;
  deleteSalesItem(id: string): Promise<boolean>;
  findUserByUsername(username: string): Promise<User | undefined>;
}

export class DrizzleStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.findUserByUsername(username);
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(insertUser).returning();
    return newUser;
  }

  async getBusinessMetrics(): Promise<BusinessMetric[]> {
    const metrics = await db.query.businessMetrics.findMany();
    return metrics;
  }

  async createBusinessMetric(metric: InsertBusinessMetric): Promise<BusinessMetric> {
    const [newMetric] = await db.insert(businessMetrics).values({
      ...metric,
      date: metric.date ? new Date(metric.date) : new Date(),
      revenue: String(metric.revenue),
      sales: String(metric.sales),
      expenses: metric.expenses ? String(metric.expenses) : null,
      profit: metric.profit ? String(metric.profit) : null,
      notes: metric.notes || null,
    }).returning();
    return newMetric;
  }

  async getSalesItems(): Promise<SalesItem[]> {
    const items = await db.query.salesItems.findMany();
    return items;
  }

  async createSalesItem(item: InsertSalesItem): Promise<SalesItem> {
    const [newItem] = await db.insert(salesItems).values({
      ...item,
      createdAt: new Date(),
      quantity: String(item.quantity),
      state: item.state || "pending",
    }).returning();
    return newItem;
  }

  async updateSalesItem(id: string, updates: Partial<SalesItem>): Promise<SalesItem | undefined> {
    const [updatedItem] = await db.update(salesItems).set(updates).where(eq(salesItems.id, id)).returning();
    return updatedItem;
  }

  async deleteSalesItem(id: string): Promise<boolean> {
    const [deletedItem] = await db.delete(salesItems).where(eq(salesItems.id, id)).returning();
    return !!deletedItem;
  }
}

export const storage = new DrizzleStorage();
