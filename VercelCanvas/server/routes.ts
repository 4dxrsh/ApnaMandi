import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertOrderSchema, 
  insertOrderItemSchema, 
  insertProcurementPriceSchema, 
  insertDeliverySchema,
  loginSchema,
  registerSchema
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Order creation schema
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1)
  }))
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create new user - all users are approved by default now
      const user = await storage.createUser({
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        status: 'APPROVED',
        stallInfo: userData.stallInfo
      });

      res.json({ 
        success: true, 
        user: { ...user, password: undefined }, // Don't send password back
        token: `mock-token-${user.id}` // In real app, use JWT
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // All users are approved by default now

      res.json({ 
        success: true, 
        user: { ...user, password: undefined }, // Don't send password back
        token: `mock-token-${user.id}` // In real app, use JWT
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Order routes
  app.post("/api/orders", async (req, res) => {
    try {
      const { items } = createOrderSchema.parse(req.body);
      const userId = req.headers['user-id'] as string; // In real app, get from JWT

      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      // Calculate total with procurement prices
      const latestPrices = await storage.getLatestProcurementPrices();
      const priceMap = new Map(latestPrices.map(p => [p.productId, parseFloat(p.price)]));
      
      let total = 40; // Convenience fee
      
      // Create order
      const order = await storage.createOrder({
        userId,
        status: 'PLACED',
        total: "0" // Will update after items
      });

      // Create order items and calculate total
      for (const item of items) {
        const price = priceMap.get(item.productId) || 0;
        const itemTotal = price * item.quantity;
        total += itemTotal;

        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: price.toString()
        });
      }

      // Update order total
      await storage.updateOrderStatus(order.id, 'PLACED');
      const finalOrder = await storage.getOrder(order.id);
      
      res.json(finalOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders/user/:userId", async (req, res) => {
    try {
      const orders = await storage.getOrdersByUser(req.params.userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Partner routes
  app.get("/api/partner/procurement-list", async (req, res) => {
    try {
      const list = await storage.getAggregatedProcurementList();
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/partner/set-price", async (req, res) => {
    try {
      const priceData = insertProcurementPriceSchema.parse(req.body);
      const price = await storage.setProcurementPrice(priceData);
      res.json(price);
    } catch (error) {
      res.status(400).json({ message: "Invalid price data" });
    }
  });

  app.get("/api/partner/earnings", async (req, res) => {
    try {
      const earnings = await storage.getPartnerEarnings();
      res.json(earnings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/partner/mark-delivered", async (req, res) => {
    try {
      const deliveryData = insertDeliverySchema.parse(req.body);
      const delivery = await storage.createDelivery({
        ...deliveryData,
        deliveredAt: new Date()
      });

      // Update order status to delivered
      await storage.updateOrderStatus(deliveryData.orderId, 'DELIVERED');

      res.json(delivery);
    } catch (error) {
      res.status(400).json({ message: "Failed to mark as delivered" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
