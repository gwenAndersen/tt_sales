import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "passport";
import { type User } from "@shared/schema";
import bcrypt from "bcryptjs"; // Changed import

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized." });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
    try {
      const existingUser = await storage.findUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists." });
      }
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
      const newUser = await storage.createUser({ username, hashedPassword });
      // Log in the user immediately after registration
      req.login(newUser, (err) => {
        if (err) {
          console.error("Login after registration failed:", err); // Log login error
          return res.status(500).json({ message: "Login after registration failed." });
        }
        res.status(201).json({ id: newUser.id, username: newUser.username });
      });
    } catch (error) {
      console.error("Error during user registration:", error); // Log the error
      res.status(500).json({ message: "Error registering user." });
    }
  });

  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    const remember = req.body.remember;
    if (remember) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      req.session.cookie.maxAge = undefined; // Session cookie, expires when browser closes
    }
    res.json({ id: (req.user as User).id, username: (req.user as User).username });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ id: (req.user as User).id, username: (req.user as User).username });
    } else {
      res.status(401).json({ message: "Not authenticated." });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout failed:", err); // Log logout error
        return res.status(500).json({ message: "Logout failed." });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction failed:", err); // Log session destruction error
          return res.status(500).json({ message: "Session destruction failed." });
        }
        res.status(200).json({ message: "Logged out successfully." });
      });
    });
  });

  // Existing API endpoints - now protected
  app.post("/api/users", isAuthenticated, async (req, res) => { // Protected
    const user = await storage.createUser(req.body);
    res.json(user);
  });

  app.get("/api/users/:username", isAuthenticated, async (req, res) => { // Protected
    const user = await storage.getUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  app.get("/api/metrics", isAuthenticated, async (req, res) => { // Protected
    const metrics = await storage.getBusinessMetrics();
    res.json(metrics);
  });

  app.post("/api/metrics", isAuthenticated, async (req, res) => { // Protected
    const metric = await storage.createBusinessMetric(req.body);
    res.json(metric);
  });

  app.get("/api/sales", isAuthenticated, async (req, res) => { // Protected
    const salesItems = await storage.getSalesItems();
    res.json(salesItems);
  });

  app.post("/api/sales", isAuthenticated, async (req, res) => { // Protected
    const salesItem = await storage.createSalesItem(req.body);
    res.json(salesItem);
  });

  app.patch("/api/sales/:id", isAuthenticated, async (req, res) => { // Protected
    const { id } = req.params;
    const updatedItem = await storage.updateSalesItem(id, req.body);
    if (!updatedItem) {
      return res.status(404).json({ message: "Sales item not found" });
    }
    res.json(updatedItem);
  });

  app.delete("/api/sales/:id", isAuthenticated, async (req, res) => { // Protected
    const { id } = req.params;
    const deleted = await storage.deleteSalesItem(id);
    if (!deleted) {
      return res.status(404).json({ message: "Sales item not found" });
    }
    res.status(204).send(); // No content for successful deletion
  });

  const httpServer = createServer(app);

  return httpServer;
}