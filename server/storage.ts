import { 
  type User, type InsertUser,
  type MenuItem, type InsertMenuItem,
  type Order, type InsertOrder 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Menu operations
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItemAvailability(id: number, available: boolean): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrders(): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private menuItems: Map<number, MenuItem>;
  private orders: Map<number, Order>;
  private currentIds: { users: number; menuItems: number; orders: number };

  constructor() {
    this.users = new Map();
    this.menuItems = new Map();
    this.orders = new Map();
    this.currentIds = { users: 1, menuItems: 1, orders: 1 };
    
    // Add some sample menu items
    const sampleItems: InsertMenuItem[] = [
      {
        name: "Классический круассан",
        description: "Слоеное масляное тесто, приготовленное по французскому рецепту",
        price: 250,
        category: "Выпечка",
        imageUrl: "https://images.unsplash.com/photo-1485963631004-f2f00b1d6606",
        available: true,
      },
      {
        name: "Тост с авокадо",
        description: "Хлеб на закваске с пюре из спелого авокадо",
        price: 290,
        category: "Завтраки",
        imageUrl: "https://images.unsplash.com/photo-1494390248081-4e521a5940db",
        available: true,
      },
      {
        name: "Капучино",
        description: "Эспрессо с нежной молочной пенкой",
        price: 220,
        category: "Напитки",
        imageUrl: "https://images.unsplash.com/photo-1447078806655-40579c2520d6",
        available: true,
      },
    ];

    sampleItems.forEach((item) => this.createMenuItem(item));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.phone === phone);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Menu operations
  async getMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values());
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItem> {
    const id = this.currentIds.menuItems++;
    const item = { ...insertItem, id };
    this.menuItems.set(id, item);
    return item;
  }

  async updateMenuItemAvailability(id: number, available: boolean): Promise<void> {
    const item = this.menuItems.get(id);
    if (item) {
      this.menuItems.set(id, { ...item, available });
    }
  }

  // Order operations
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentIds.orders++;
    const order = {
      ...insertOrder,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async updateOrderStatus(id: number, status: string): Promise<void> {
    const order = this.orders.get(id);
    if (order) {
      this.orders.set(id, { ...order, status });
    }
  }
}

export const storage = new MemStorage();