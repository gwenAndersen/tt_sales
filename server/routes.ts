import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "passport";
import { type User, insertTransactionSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized." });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // --- Auth Routes ---
  app.post("/api/auth/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password are required." });
    try {
      const existingUser = await storage.findUserByUsername(username);
      if (existingUser) return res.status(409).json({ message: "Username already exists." });
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await storage.createUser({ username, hashedPassword });
      req.login(newUser, (err) => {
        if (err) return res.status(500).json({ message: "Login after registration failed." });
        res.status(201).json({ id: newUser.id, username: newUser.username });
      });
    } catch (error) {
      console.error("Error during user registration:", error);
      res.status(500).json({ message: "Error registering user." });
    }
  });

  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json({ id: (req.user as User).id, username: (req.user as User).username });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) return res.json({ id: (req.user as User).id, username: (req.user as User).username });
    res.status(401).json({ message: "Not authenticated." });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed." });
      req.session.destroy(() => res.status(200).json({ message: "Logged out successfully." }));
    });
  });

  // --- Transaction & Sale Routes ---
  app.get("/api/transactions", isAuthenticated, async (req, res) => {
    const transactions = await storage.getTransactions();
    res.json(transactions);
  });

  app.post("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const saleEventSchema = z.object({
    name: z.string().min(1),
    price: z.number().positive(),
    link: z.string().url().optional().or(z.literal('')),
    state: z.string().optional(),
  });

  app.post("/api/sale-event", isAuthenticated, async (req, res) => {
    try {
      const validatedData = saleEventSchema.parse(req.body);
      await storage.createSaleEvent(validatedData);
      res.status(201).json({ message: "Sale event recorded successfully." });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      console.error("Error creating sale event:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // --- NEW: Sale Management Endpoints ---
  app.get("/api/sales", isAuthenticated, async (req, res) => {
    const sales = await storage.getSales();
    res.json(sales);
  });

  const updateSaleStateSchema = z.object({
    state: z.enum(["pending", "done"]),
  });

  app.patch("/api/sales/:id/state", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { state } = updateSaleStateSchema.parse(req.body);
      await storage.updateSaleState(id, state);
      res.status(200).json({ message: "Sale state updated" });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      console.error("Error updating sale state:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const updateSaleSchema = z.object({
    link: z.string().url().optional().or(z.literal('')),
    price: z.number().positive().optional(),
  });

  app.patch("/api/sales/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateSaleSchema.parse(req.body);
      await storage.updateSale(id, validatedData);
      res.status(200).json({ message: "Sale updated" });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      console.error("Error updating sale:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/sales/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSale(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting sale:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
