import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertOrderSchema, orderItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const user = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByPhone(user.phone);
      
      if (existingUser) {
        res.json(existingUser);
      } else {
        const newUser = await storage.createUser(user);
        res.json(newUser);
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Menu routes
  app.get("/api/menu", async (_req, res) => {
    const items = await storage.getMenuItems();
    res.json(items);
  });

  app.patch("/api/menu/:id/availability", async (req, res) => {
    const id = parseInt(req.params.id);
    const available = z.boolean().parse(req.body.available);
    
    await storage.updateMenuItemAvailability(id, available);
    res.json({ success: true });
  });

  // Order routes
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const items = z.array(orderItemSchema).parse(orderData.items);
      
      // Validate all menu items exist and are available
      for (const item of items) {
        const menuItem = await storage.getMenuItem(item.menuItemId);
        if (!menuItem || !menuItem.available) {
          return res.status(400).json({ 
            error: `Menu item ${item.menuItemId} not available` 
          });
        }
      }
      
      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: "Invalid order data" });
    }
  });

  app.get("/api/orders", async (_req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.get("/api/orders/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const order = await storage.getOrder(id);
    
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const status = z.string().parse(req.body.status);
      
      await storage.updateOrderStatus(id, status);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
