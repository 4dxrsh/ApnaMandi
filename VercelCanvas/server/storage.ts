import { 
  type User, 
  type InsertUser,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type ProcurementPrice,
  type InsertProcurementPrice,
  type Delivery,
  type InsertDelivery,
  type OrderWithItems,
  users,
  products,
  orders,
  orderItems,
  procurementPrices,
  deliveries
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<User | undefined>;

  // Products
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  
  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<OrderWithItems | undefined>;
  getOrdersByUser(userId: string): Promise<OrderWithItems[]>;
  getAllOrders(): Promise<OrderWithItems[]>;
  updateOrderStatus(id: string, status: 'PLACED' | 'PROCURING' | 'ON_THE_WAY' | 'DELIVERED'): Promise<Order | undefined>;
  
  // Order Items
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: string): Promise<(OrderItem & { product: Product })[]>;
  
  // Procurement Prices
  setProcurementPrice(price: InsertProcurementPrice): Promise<ProcurementPrice>;
  getLatestProcurementPrices(): Promise<ProcurementPrice[]>;
  
  // Deliveries
  createDelivery(delivery: InsertDelivery): Promise<Delivery>;
  getDelivery(orderId: string): Promise<Delivery | undefined>;
  
  // Analytics
  getAggregatedProcurementList(): Promise<{ productId: string; productName: string; totalQuantity: number; unit: string }[]>;
  getPartnerEarnings(partnerId?: string): Promise<{ totalDeliveries: number; totalEarnings: number }>;
}

export class DatabaseStorage implements IStorage {
  private initialized = false;

  private async initializeDefaultData() {
    if (this.initialized) return;
    
    try {
      // Check if products already exist
      const existingProducts = await db.select().from(products).limit(1);
      if (existingProducts.length > 0) {
        this.initialized = true;
        return;
      }

      // Default products
      const defaultProducts = [
        { name: "Onions", unit: "kg" },
        { name: "Potatoes", unit: "kg" },
        { name: "Cooking Oil", unit: "ltr" },
        { name: "Tomatoes", unit: "kg" },
      ];

      await db.insert(products).values(defaultProducts);
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllProducts(): Promise<Product[]> {
    await this.initializeDefaultData();
    return await db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await this.getOrderItems(id);
    const user = order.userId ? await this.getUser(order.userId) : undefined;

    return { ...order, items, user };
  }

  async getOrdersByUser(userId: string): Promise<OrderWithItems[]> {
    const userOrders = await db.select().from(orders).where(eq(orders.userId, userId));
    
    const ordersWithItems = await Promise.all(
      userOrders.map(async order => {
        const items = await this.getOrderItems(order.id);
        return { ...order, items };
      })
    );

    return ordersWithItems;
  }

  async getAllOrders(): Promise<OrderWithItems[]> {
    const allOrders = await db.select().from(orders);
    
    const ordersWithItems = await Promise.all(
      allOrders.map(async order => {
        const items = await this.getOrderItems(order.id);
        const user = order.userId ? await this.getUser(order.userId) : undefined;
        return { ...order, items, user };
      })
    );

    return ordersWithItems;
  }

  async updateOrderStatus(id: string, status: 'PLACED' | 'PROCURING' | 'ON_THE_WAY' | 'DELIVERED'): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async createOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const [item] = await db
      .insert(orderItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async getOrderItems(orderId: string): Promise<(OrderItem & { product: Product })[]> {
    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        product: products
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));
    
    return items;
  }

  async setProcurementPrice(insertPrice: InsertProcurementPrice): Promise<ProcurementPrice> {
    const [price] = await db
      .insert(procurementPrices)
      .values(insertPrice)
      .returning();
    return price;
  }

  async getLatestProcurementPrices(): Promise<ProcurementPrice[]> {
    // This would need a more complex query in a real implementation
    // For now, return all prices (assuming one per product for demo)
    return await db.select().from(procurementPrices);
  }

  async createDelivery(insertDelivery: InsertDelivery): Promise<Delivery> {
    const [delivery] = await db
      .insert(deliveries)
      .values(insertDelivery)
      .returning();
    return delivery;
  }

  async getDelivery(orderId: string): Promise<Delivery | undefined> {
    const [delivery] = await db.select().from(deliveries).where(eq(deliveries.orderId, orderId));
    return delivery;
  }

  async getAggregatedProcurementList(): Promise<{ productId: string; productName: string; totalQuantity: number; unit: string }[]> {
    // Get all orders that are not delivered and aggregate quantities
    const result = await db
      .select({
        productId: orderItems.productId,
        productName: products.name,
        totalQuantity: orderItems.quantity,
        unit: products.unit
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orders.status, 'PLACED'));
    
    // Aggregate by product
    const aggregation = new Map<string, { productName: string; totalQuantity: number; unit: string }>();
    
    result.forEach(item => {
      const existing = aggregation.get(item.productId);
      if (existing) {
        existing.totalQuantity += item.totalQuantity;
      } else {
        aggregation.set(item.productId, {
          productName: item.productName,
          totalQuantity: item.totalQuantity,
          unit: item.unit
        });
      }
    });

    return Array.from(aggregation.entries()).map(([productId, data]) => ({
      productId,
      ...data
    }));
  }

  async getPartnerEarnings(partnerId?: string): Promise<{ totalDeliveries: number; totalEarnings: number }> {
    const deliveredOrders = await db.select().from(orders).where(eq(orders.status, 'DELIVERED'));
    const convenienceFeePerOrder = 40;
    
    return {
      totalDeliveries: deliveredOrders.length,
      totalEarnings: deliveredOrders.length * convenienceFeePerOrder
    };
  }
}

export const storage = new DatabaseStorage();
