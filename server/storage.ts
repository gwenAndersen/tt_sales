import { type User, type InsertUser, type Transaction, type InsertTransaction, type TransactionWithSaleDetails, type Sale, users, transactions, sales } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, inArray } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema: { users, transactions, sales } });

export type SaleWithTransactions = Sale & { transactions: Transaction[] };

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  findUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getTransactions(): Promise<TransactionWithSaleDetails[]>;
  createTransaction(tx: InsertTransaction): Promise<Transaction>;
  getSales(): Promise<SaleWithTransactions[]>;
  createSaleEvent(saleData: { name: string; price: number; link?: string; state?: string }): Promise<void>;
  updateSale(saleId: string, updates: { link?: string; price?: number }): Promise<void>;
  updateSaleState(saleId: string, state: string): Promise<void>;
  deleteSale(saleId: string): Promise<void>;
}

export class DrizzleStorage implements IStorage {

  async getUser(id: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.username, username) });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(insertUser).returning();
    return newUser;
  }

  async getTransactions(): Promise<TransactionWithSaleDetails[]> {
    const allTransactions = await db.query.transactions.findMany({
      orderBy: (transactions, { desc }) => [desc(transactions.date)],
    });
    const allSales = await db.query.sales.findMany();
    const salesMap = new Map(allSales.map(s => [s.id, s]));
    return allTransactions.map(tx => ({
      ...tx,
      sale: tx.saleId ? salesMap.get(tx.saleId) || null : null,
    }));
  }

  async createTransaction(tx: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values({
      ...tx,
      amount: String(tx.amount),
      date: new Date(),
    }).returning();
    return newTransaction;
  }

  async getSales(): Promise<SaleWithTransactions[]> {
    const allSales = await db.query.sales.findMany({
      orderBy: (sales, { desc }) => [desc(sales.createdAt)],
    });
    if (allSales.length === 0) return [];

    const saleIds = allSales.map(s => s.id);
    const relatedTransactions = await db.query.transactions.findMany({
      where: inArray(transactions.saleId, saleIds),
    });

    const transactionsBySaleId = new Map<string, Transaction[]>();
    for (const tx of relatedTransactions) {
      if (tx.saleId) {
        if (!transactionsBySaleId.has(tx.saleId)) {
          transactionsBySaleId.set(tx.saleId, []);
        }
        transactionsBySaleId.get(tx.saleId)!.push(tx);
      }
    }

    return allSales.map(s => ({
      ...s,
      transactions: transactionsBySaleId.get(s.id) || [],
    }));
  }

  async createSaleEvent(saleData: { name: string; price: number; link?: string; state?: string }): Promise<void> {
    const saleDate = new Date();
    const [newSale] = await db.insert(sales).values({
      link: saleData.link,
      state: saleData.state,
      createdAt: saleDate,
    }).returning();

    await this.createTransaction({
      date: saleDate,
      description: `Sale of ${saleData.name}`,
      category: "Sale",
      amount: saleData.price,
      saleId: newSale.id,
    });

    await this.createTransaction({
      date: saleDate,
      description: `Cost for sale of ${saleData.name}`,
      category: "coin sell",
      amount: -150,
      saleId: newSale.id,
    });
  }

  async updateSale(saleId: string, updates: { link?: string; price?: number }): Promise<void> {
    if (updates.link) {
      await db.update(sales).set({ link: updates.link }).where(eq(sales.id, saleId));
    }
    if (updates.price) {
      await db.update(transactions)
        .set({ amount: String(updates.price) })
        .where(and(eq(transactions.saleId, saleId), eq(transactions.category, "Sale")));
    }
  }

  async updateSaleState(saleId: string, state: string): Promise<void> {
    await db.update(sales).set({ state }).where(eq(sales.id, saleId));
  }

  async deleteSale(saleId: string): Promise<void> {
    await db.delete(sales).where(eq(sales.id, saleId));
  }
}

export const storage = new DrizzleStorage();