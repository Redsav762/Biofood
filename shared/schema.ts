import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  available: boolean("available").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  status: text("status").notNull().default("pending"),
  items: jsonb("items").notNull(),
  total: integer("total").notNull(),
  pickupTime: text("pickup_time").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  specialInstructions: text("special_instructions"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  phone: true,
  email: true,
});

export const insertMenuItemSchema = createInsertSchema(menuItems);

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  items: true,
  total: true,
  pickupTime: true,
  specialInstructions: true,
});

export const orderItemSchema = z.object({
  menuItemId: z.number(),
  quantity: z.number().min(1),
  notes: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type User = typeof users.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Order = typeof orders.$inferSelect;