import {
  users,
  competitions,
  tickets,
  orders,
  transactions,
  winners,
  type User,
  type UpsertUser,
  type Competition,
  type InsertCompetition,
  type Ticket,
  type InsertTicket,
  type Order,
  type InsertOrder,
  type Transaction,
  type InsertTransaction,
  type Winner,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sum, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (custom email/password auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserBalance(userId: string, amount: string): Promise<User>;
  updateStripeCustomerId(userId: string, customerId: string): Promise<User>;
  
  // Competition operations
  getCompetitions(): Promise<Competition[]>;
  getCompetition(id: string): Promise<Competition | undefined>;
  createCompetition(competition: InsertCompetition): Promise<Competition>;
  updateCompetitionSoldTickets(id: string, increment: number): Promise<void>;
  
  // Ticket operations
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  getUserTickets(userId: string): Promise<Ticket[]>;
  getCompetitionTickets(competitionId: string): Promise<Ticket[]>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  
  // Winner operations
  getRecentWinners(limit: number): Promise<Winner[]>;
  createWinner(winner: Omit<Winner, 'id' | 'createdAt'>): Promise<Winner>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserBalance(userId: string, amount: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ balance: amount, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateStripeCustomerId(userId: string, customerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Competition operations
  async getCompetitions(): Promise<Competition[]> {
    return await db.select().from(competitions).where(eq(competitions.isActive, true)).orderBy(desc(competitions.createdAt));
  }

  async getCompetition(id: string): Promise<Competition | undefined> {
    const [competition] = await db.select().from(competitions).where(eq(competitions.id, id));
    return competition;
  }

  async createCompetition(competition: InsertCompetition): Promise<Competition> {
    const [created] = await db.insert(competitions).values(competition).returning();
    return created;
  }

  async updateCompetitionSoldTickets(id: string, increment: number): Promise<void> {
    await db
      .update(competitions)
      .set({ 
        soldTickets: sql`${competitions.soldTickets} + ${increment}`,
        updatedAt: new Date()
      })
      .where(eq(competitions.id, id));
  }

  // Ticket operations
  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const [created] = await db.insert(tickets).values(ticket).returning();
    return created;
  }

  async getUserTickets(userId: string): Promise<Ticket[]> {
    return await db.select().from(tickets).where(eq(tickets.userId, userId)).orderBy(desc(tickets.createdAt));
  }

  async getCompetitionTickets(competitionId: string): Promise<Ticket[]> {
    return await db.select().from(tickets).where(eq(tickets.competitionId, competitionId));
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db.insert(orders).values(order).returning();
    return created;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getUserOrders(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(orders)
      .leftJoin(competitions, eq(orders.competitionId, competitions.id))
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: string, status: "pending" | "completed" | "failed" | "expired"): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [created] = await db.insert(transactions).values(transaction).returning();
    return created;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  // Winner operations
  async getRecentWinners(limit: number): Promise<any[]> {
    return await db
      .select()
      .from(winners)
      .leftJoin(users, eq(winners.userId, users.id))
      .leftJoin(competitions, eq(winners.competitionId, competitions.id))
      .orderBy(desc(winners.createdAt))
      .limit(limit);
  }

  async createWinner(winner: Omit<Winner, 'id' | 'createdAt'>): Promise<Winner> {
    const [created] = await db.insert(winners).values(winner).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
