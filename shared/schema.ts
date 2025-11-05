import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (custom email/password auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password"), // Make nullable to support migration
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  dateOfBirth: varchar("date_of_birth"), // Store as YYYY-MM-DD format
  profileImageUrl: varchar("profile_image_url"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  emailVerified: boolean("email_verified").default(false),
  ringtonePoints: integer("ringtone_points").default(0),
  receiveNewsletter: boolean("receive_newsletter").default(false),
  isAdmin: boolean("is_admin").default(false),
  isActive: boolean("is_active").default(true), 
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Competition types
export const competitions = pgTable("competitions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  type: varchar("type", { enum: ["spin", "scratch", "instant"] }).notNull(),
  ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }).notNull(),
  maxTickets: integer("max_tickets"),
  soldTickets: integer("sold_tickets").default(0),
  prizeData: jsonb("prize_data"), // For storing wheel segments or scratch card prizes
  isActive: boolean("is_active").default(true),
  ringtonePoints: integer("ringtone_points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User tickets/entries
export const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  competitionId: uuid("competition_id").notNull().references(() => competitions.id),
  ticketNumber: varchar("ticket_number").notNull(),
  isWinner: boolean("is_winner").default(false),
  prizeAmount: decimal("prize_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders for tracking purchases
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  competitionId: uuid("competition_id").notNull().references(() => competitions.id),
  quantity: integer("quantity").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method").notNull(),
  status: varchar("status", { enum: ["pending", "completed", "failed", "expired"] }).default("pending"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
   walletAmount: decimal("wallet_amount", { precision: 10, scale: 2 }).default("0.00"),
  pointsAmount: decimal("points_amount", { precision: 10, scale: 2 }).default("0.00"),
  cashflowsAmount: decimal("cashflows_amount", { precision: 10, scale: 2 }).default("0.00"),
  paymentBreakdown: text("payment_breakdown"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wallet transactions
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { enum: ["deposit", "withdrawal", "purchase", "prize"] }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  orderId: uuid("order_id").references(() => orders.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Past winners for showcase
export const winners = pgTable("winners", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  competitionId: uuid("competition_id").references(() => competitions.id),
  prizeDescription: text("prize_description").notNull(),
  prizeValue: text("prize_value").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});


export const spinUsage = pgTable("spin_usage", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  usedAt: timestamp("used_at").defaultNow(),
});

export const scratchCardUsage = pgTable("scratch_card_usage", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  usedAt: timestamp("used_at").defaultNow(),
});

// Insert schemas
export const insertCompetitionSchema = createInsertSchema(competitions);
export const insertTicketSchema = createInsertSchema(tickets);
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Competition = typeof competitions.$inferSelect;
export type InsertCompetition = z.infer<typeof insertCompetitionSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Winner = typeof winners.$inferSelect;
export type SpinUsage = typeof spinUsage.$inferInsert;
export type ScratchCardUsage = typeof scratchCardUsage.$inferInsert;

// Registration and login schemas
export const registerUserSchema = createInsertSchema(users).pick({
  firstName: true,
  lastName: true,
  email: true,
  password: true,
  dateOfBirth: true,
  receiveNewsletter: true,
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
