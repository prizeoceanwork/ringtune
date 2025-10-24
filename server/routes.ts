import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import {
  setupCustomAuth,
  isAuthenticated,
  hashPassword,
  verifyPassword,
} from "./customAuth";
import {
  insertOrderSchema,
  insertTransactionSchema,
  insertTicketSchema,
  registerUserSchema,
  loginUserSchema,
  competitions,
  tickets,
  orders,
  transactions,
} from "@shared/schema";
import { nanoid } from "nanoid";
import { db } from "./db";
import {stripe} from "./stripe";
import { cashflows } from "./cashflows";
// Initialize Stripe only if keys are available
// let stripe: Stripe | null = null;
// if (process.env.STRIPE_SECRET_KEY) {
//   stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//     apiVersion: "2025-08-27.basil",
//   });
// }

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupCustomAuth(app);

  // Registration route
app.post("/api/auth/register", async (req, res) => {
  try {
    const result = registerUserSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({
          message: "Invalid registration data",
          errors: result.error.issues,
        });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      receiveNewsletter,
      birthMonth,
      birthYear,
    } = req.body;

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password || "");

    // Create date of birth string if provided
    const dobString =
      birthMonth && birthYear
        ? `${birthYear}-${String(birthMonth).padStart(2, "0")}-01`
        : undefined;

    // Create user
    const user = await storage.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      dateOfBirth: dobString,
      receiveNewsletter: receiveNewsletter || false,
    });

    res
      .status(201)
      .json({ message: "User registered successfully", userId: user.id });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
});

  // Login route
app.post("/api/auth/login", async (req, res) => {
  try {
    const result = loginUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid login data" });
    }

    const { email, password } = result.data;

    // Get user by email
    const user = await storage.getUserByEmail(email);
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Store user ID in session
    (req as any).session.userId = user.id;

    res.json({
      message: "Login successful",
      user: { id: user.id, email: user.email, firstName: user.firstName },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to log in" });
  }
});

// Logout route
app.post("/api/auth/logout", (req: any, res) => {
  req.session.destroy((err: any) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Failed to log out" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

  // Get current user route
app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
});

app.put("/api/auth/user", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      birthMonth,
      birthYear,
    } = req.body;


    let dobString: string | undefined = dateOfBirth;
if (birthMonth && birthYear) {
  dobString = `${birthYear}-${String(birthMonth).padStart(2, "0")}-01`;
}

    const updateData: any = {
      email,
      firstName,
      lastName,
      dateOfBirth:dobString,
      birthMonth,
      birthYear,
    };

    if (password) {
  updateData.password = await hashPassword(password);
}

if (email) {
  const existing = await storage.getUserByEmail(email);
  if (existing && existing.id !== userId) {
    return res.status(400).json({ message: "Email already in use" });
  }
}


    const updatedUser = await storage.updateUser(userId, updateData);

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      dateOfBirth: updatedUser.dateOfBirth,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

  // Competition routes
app.get("/api/competitions", async (req, res) => {
  try {
    const competitions = await storage.getCompetitions();
    res.json(competitions);
  } catch (error) {
    console.error("Error fetching competitions:", error);
    res.status(500).json({ message: "Failed to fetch competitions" });
  }
});

app.get("/api/competitions/:id", async (req, res) => {
  try {
    const competition = await storage.getCompetition(req.params.id);
    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }
    res.json(competition);
  } catch (error) {
    console.error("Error fetching competition:", error);
    res.status(500).json({ message: "Failed to fetch competition" });
  }
 });

app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
  try {
    const { orderId, quantity } = req.body;
    const userId = req.user.id;

    if (!orderId || typeof orderId !== "string") {
      return res.status(400).json({ message: "Invalid or missing order ID" });
    }

    const order = await storage.getOrder(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const competition = await storage.getCompetition(order.competitionId);
    if (!competition) return res.status(404).json({ message: "Competition not found" });

    const totalAmount = parseFloat(competition.ticketPrice) * (quantity || 1);

    const session = await cashflows.createCompetitionPaymentSession(totalAmount, {
      orderId,
      competitionId: competition.id,
      userId,
      quantity: quantity.toString(),
    });

    if (!session.hostedPageUrl) {
      return res.status(500).json({ message: "Failed to get Cashflows checkout URL" });
    }

    res.json({
      success: true,
      redirectUrl: session.hostedPageUrl,
      sessionId: session.paymentJobReference,
    });
  } catch (error: any) {
    console.error("❌ Error creating Cashflows session:", error);
    res.status(500).json({
      message: "Failed to create payment session",
      error: error.message,
    });
  }
});

// Update the payment success route
app.post("/api/payment-success/competition", isAuthenticated, async (req: any, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: "Missing sessionId" });
    }

    // Verify payment with Cashflows
    const payment = await cashflows.getPaymentStatus(sessionId);

    if (payment.status !== "COMPLETED") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const { userId, competitionId, orderId, quantity } = payment.metadata || {};
    const amount = (payment.amount?.value || 0) / 100;
    const ticketQuantity = parseInt(quantity) || 1;

    if (!userId || !orderId) {
      return res.status(400).json({ message: "Invalid payment metadata" });
    }

    console.log(`🎫 Creating ${ticketQuantity} tickets for order ${orderId}`);

    // Update order status
    await storage.updateOrderStatus(orderId, "completed");

    // Record transaction
    await storage.createTransaction({
      userId,
      type: "purchase",
      amount: amount.toString(),
      description: `Cashflows ticket purchase for ${competitionId} - ${ticketQuantity} tickets`,
    });

    // Create tickets
    const ticketPromises = [];
    for (let i = 0; i < ticketQuantity; i++) {
      ticketPromises.push(
        storage.createTicket({
          userId,
          competitionId,
          ticketNumber: nanoid(8).toUpperCase(),
        })
      );
    }

    await Promise.all(ticketPromises);

    res.json({ 
      success: true, 
      competitionId, 
      orderId,
      ticketsCreated: ticketQuantity 
    });
  } catch (error) {
    console.error("Error confirming ticket payment:", error);
    res.status(500).json({ message: "Failed to confirm payment" });
  }
});

// Add webhook handler for Cashflows notifications
app.post("/api/cashflows/webhook", async (req, res) => {
  try {
    const event = req.body;
    
    // Verify webhook signature if available
    // Cashflows may provide signature verification
    
    switch (event.type) {
      case "PAYMENT_COMPLETED":
        // Handle completed payment
        const { orderId, userId, competitionId, quantity } = event.metadata;
        
        // Update order status
        await storage.updateOrderStatus(orderId, "completed");
        
        // Create tickets
        const ticketQuantity = parseInt(quantity) || 1;
        for (let i = 0; i < ticketQuantity; i++) {
          await storage.createTicket({
            userId,
            competitionId,
            ticketNumber: nanoid(8).toUpperCase(),
          });
        }
        
        break;
        
      case "PAYMENT_FAILED":
        // Handle failed payment
        await storage.updateOrderStatus(event.metadata.orderId, "failed");
        break;
        
      case "PAYMENT_CANCELLED":
        // Handle cancelled payment
        await storage.updateOrderStatus(event.metadata.orderId, "failed");
        break;
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

  // Ticket purchase route
app.post("/api/purchase-ticket", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { competitionId, quantity = 1 } = req.body;

    const competition = await storage.getCompetition(competitionId);
    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    const totalAmount = parseFloat(competition.ticketPrice) * quantity;
    const compType = competition.type;

    // ✅ Skip sold-out checks for SPIN and SCRATCH
    if (compType === "instant") {
      const soldTickets = Number(competition.soldTickets || 0);
      const maxTickets = Number(competition.maxTickets || 0);

      if (maxTickets > 0 && soldTickets >= maxTickets) {
        return res.status(400).json({ message: "Competition sold out" });
      }

      const remainingTickets = maxTickets - soldTickets;
      if (maxTickets > 0 && quantity > remainingTickets) {
        return res.status(400).json({
          message: `Only ${remainingTickets} ticket${
            remainingTickets > 1 ? "s" : ""
          } remaining`,
        });
      }
    } else {
      // 🌀 For spin or scratch, make sure soldTickets/maxTickets don’t cause errors
      competition.soldTickets = 0;
      competition.maxTickets = null;
    }

    // --- continue purchase logic below ---
    const user = await storage.getUser(userId);
    const userBalance = parseFloat(user?.balance || "0");

    const order = await storage.createOrder({
      userId,
      competitionId,
      quantity,
      totalAmount: totalAmount.toString(),
      paymentMethod: userBalance >= totalAmount ? "wallet" : "cashflows",
      status: "pending",
    });

    if (userBalance >= totalAmount) {
      const newBalance = (userBalance - totalAmount).toString();

      await storage.updateUserBalance(userId, newBalance);
      await storage.createTransaction({
        userId,
        type: "purchase",
        amount: `-${totalAmount}`,
        description: `Ticket purchase for ${competition.title}`,
        orderId: order.id,
      });

      const tickets = [];
      for (let i = 0; i < quantity; i++) {
        const ticketNumber = nanoid(8).toUpperCase();
        const ticket = await storage.createTicket({
          userId,
          competitionId,
          ticketNumber,
          isWinner: false,
        });
        tickets.push(ticket);
      }

      if (compType === "instant") {
        await storage.updateCompetitionSoldTickets(competitionId, quantity);
      }

      await storage.updateOrderStatus(order.id, "completed");

      return res.json({
        success: true,
        message: "Tickets purchased via wallet",
        orderId: order.id,
        tickets,
        paymentMethod: "wallet",
      });
    }

    return res.json({
      success: true,
      message: "Proceed to Cashflows payment",
      orderId: order.id,
      paymentMethod: "cashflows",
    });
  } catch (error) {
    console.error("Error purchasing ticket:", error);
    res.status(500).json({ message: "Failed to complete purchase" });
  }
});



  // Payment confirmation webhook
app.post("/api/payment-success/competition", isAuthenticated, async (req: any, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;
    const userId = req.user.id;

    const order = await storage.getOrder(orderId);
    if (!order || order.userId !== userId) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status
    await storage.updateOrderStatus(orderId, "completed");

    // Create tickets
    const tickets = [];
    for (let i = 0; i < order.quantity; i++) {
      const ticketNumber = nanoid(8).toUpperCase();
      const ticket = await storage.createTicket({
        userId,
        competitionId: order.competitionId,
        ticketNumber,
        isWinner: false, // This will be determined by game logic
      });
      tickets.push(ticket);
    }

    // Update competition sold tickets
    await storage.updateCompetitionSoldTickets(
      order.competitionId,
      order.quantity
    );

    // Create transaction record
    await storage.createTransaction({
      userId,
      type: "purchase",
      amount: `-${order.totalAmount}`,
      description: `Purchased ${order.quantity} ticket(s)`,
      orderId,
    });

    res.json({ success: true, tickets });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ message: "Failed to confirm payment" });
  }
});

  // Game routes
app.post("/api/play-spin-wheel", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { winnerPrize } = req.body;
    const SPIN_COST = 2; // €2 per spin

    // Fetch user and ensure balance is enough
    const user = await storage.getUser(userId);
    const currentBalance = parseFloat(user?.balance || "0");

    if (currentBalance < SPIN_COST) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance. Please top up your wallet.",
      });
    }

    // Deduct the spin cost
    const newBalance = currentBalance - SPIN_COST;
    await storage.updateUserBalance(userId, newBalance.toFixed(2));

    await storage.createTransaction({
      userId,
      type: "withdrawal",
      amount: SPIN_COST.toFixed(2),
      description: "Spin Wheel - Spin cost",
    });

    // ---- Handle prize logic ----
    if (typeof winnerPrize.amount === "number" && winnerPrize.amount > 0) {
      // 💰 Cash prize
      const prizeAmount = winnerPrize.amount;
      const finalBalance = newBalance + prizeAmount;

      await storage.updateUserBalance(userId, finalBalance.toFixed(2));

      await storage.createTransaction({
        userId,
        type: "prize",
        amount: prizeAmount.toFixed(2),
        description: `Spin wheel prize: ${winnerPrize.brand || "Prize"} - €${prizeAmount}`,
      });

      await storage.createWinner({
        userId,
        competitionId: null,
        prizeDescription: winnerPrize.brand || "Spin Wheel Prize",
        prizeValue: `€${prizeAmount}`,
        imageUrl: winnerPrize.image || null,
      });
    } else if (
      typeof winnerPrize.amount === "string" &&
      winnerPrize.amount.includes("Ringtones")
    ) {
      // 🎵 Ringtone points prize
      const match = winnerPrize.amount.match(/(\d+)\s*Ringtones/);
      if (match) {
        const points = parseInt(match[1]);
        const newPoints = (user?.ringtonePoints || 0) + points;

        await storage.updateUserRingtonePoints(userId, newPoints);

        await storage.createTransaction({
          userId,
          type: "prize",
          amount: points.toString(),
          description: `Spin wheel prize: ${winnerPrize.brand || "Prize"} - ${points} Ringtones`,
        });

        await storage.createWinner({
          userId,
          competitionId: null,
          prizeDescription: winnerPrize.brand || "Spin Wheel Prize",
          prizeValue: `${points} Ringtones`,
          imageUrl: winnerPrize.image || null,
        });
      }
    }

    res.json({
      success: true,
      prize: winnerPrize,
      balance: newBalance.toFixed(2),
    });
  } catch (error) {
    console.error("Error playing spin wheel:", error);
    res.status(500).json({ message: "Failed to play spin wheel" });
  }
});

app.post("/api/play-scratch-card", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { winnerPrize } = req.body;
    const SCRATCH_COST = 2; // €2 per scratch

    const user = await storage.getUser(userId);
    const currentBalance = parseFloat(user?.balance || "0");

    if (currentBalance < SCRATCH_COST) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance. Please top up your wallet.",
      });
    }

    // 💳 Deduct scratch cost
    const newBalance = currentBalance - SCRATCH_COST;
    await storage.updateUserBalance(userId, newBalance.toFixed(2));
    await storage.createTransaction({
      userId,
      type: "withdrawal",
      amount: SCRATCH_COST.toFixed(2),
      description: "Scratch Card - Play cost",
    });

    // 🎁 Handle prize logic
    if (winnerPrize.type === "cash" && winnerPrize.value) {
      const amount = parseFloat(winnerPrize.value);
      if (amount > 0) {
        const finalBalance = newBalance + amount;
        await storage.updateUserBalance(userId, finalBalance.toFixed(2));

        await storage.createTransaction({
          userId,
          type: "prize",
          amount: amount.toFixed(2),
          description: `Scratch card prize: €${amount}`,
        });

        await storage.createWinner({
          userId,
          competitionId : null,
          prizeDescription: "Scratch Card Prize",
          prizeValue: `€${amount}`,
          imageUrl: winnerPrize.image || null,
        });
      }
    } else if (winnerPrize.type === "points" && winnerPrize.value) {
      const points = parseInt(winnerPrize.value);
      const newPoints = (user?.ringtonePoints || 0) + points;

      await storage.updateUserRingtonePoints(userId, newPoints);
      await storage.createTransaction({
        userId,
        type: "prize",
        amount: points.toString(),
        description: `Scratch card prize: ${points} Ringtones`,
      });

      await storage.createWinner({
        userId,
        competitionId : null, 
        prizeDescription: "Scratch Card Prize",
        prizeValue: `${points} Ringtones`,
        imageUrl: winnerPrize.image || null,
      });
    }

    res.json({
      success: true,
      prize: winnerPrize,
      balance: newBalance.toFixed(2),
    });
  } catch (error) {
    console.error("Error playing scratch card:", error);
    res.status(500).json({ message: "Failed to play scratch card" });
  }
});

  // Convert ringtone points to wallet balance
app.post("/api/convert-ringtone-points", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { points } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({ message: "Invalid points amount" });
    }

    const user = await storage.getUser(userId);
    const currentPoints = user?.ringtonePoints || 0;

    if (points > currentPoints) {
      return res.status(400).json({ message: "Not enough ringtone points" });
    }

    if (points < 1000) {
      return res.status(400).json({ message: "Minimum conversion is 1000 points" });
    }

    // Calculate euro amount (1000 points = 1 euro)
    const euroAmount = points / 1000;

    // Update ringtone points
    const newPoints = currentPoints - points;
    await storage.updateUserRingtonePoints(userId, newPoints);

    // Update wallet balance
    const currentBalance = parseFloat(user?.balance || "0");
    const newBalance = currentBalance + euroAmount;
    await storage.updateUserBalance(userId, newBalance.toString());

    // Create transaction records
    await storage.createTransaction({
      userId,
      type: "prize",
      amount: `-${points}`,
      description: `Converted ${points} ringtone points`,
    });

    await storage.createTransaction({
      userId,
      type: "prize",
      amount: euroAmount.toString(),
      description: `Received €${euroAmount} from ringtone points conversion`,
    });

    res.json({
      success: true,
      convertedPoints: points,
      euroAmount: euroAmount,
      newRingtonePoints: newPoints,
      newBalance: newBalance
    });

  } catch (error) {
    console.error("Error converting ringtone points:", error);
    res.status(500).json({ message: "Failed to convert ringtone points" });
  }
});

  // User account routes
app.get("/api/user/orders", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const orders = await storage.getUserOrders(userId);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

app.get("/api/user/transactions", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const transactions = await storage.getUserTransactions(userId);
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

app.get("/api/user/tickets", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const tickets = await storage.getUserTickets(userId);
    res.json(tickets);
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
});


app.post("/api/wallet/topup", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { amount, direct } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // 🎯 DIRECT TOP-UP (no Stripe, just update DB)
    if (direct) {
      // Update user balance
      // Update user balance using storage abstraction
      const user = await storage.getUser(userId);
      const newBalance = (parseFloat(user?.balance || "0") + parseFloat(amount)).toString();
      await storage.updateUserBalance(userId, newBalance);

      // Insert a transaction record using storage abstraction
      await storage.createTransaction({
        userId,
        type: "deposit",
        amount: amount.toString(),
        description: `Direct top-up of £${amount}`,
      });

      return res.json({ success: true });
    }

    // 🎯 STRIPE PAYMENT FLOW
    if (!stripe) {
      return res.status(500).json({
        message:
          "Payment processing not configured. Please contact admin.",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "gbp",
      metadata: {
        userId,
        type: "wallet_topup",
      },
    });

    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating wallet top-up:", error);
    res.status(500).json({ message: "Failed to create wallet top-up" });
  }
});

app.post("/api/wallet/topup-checkout", async (req, res) => {
  try {
    const { amount, userId } = req.body;
    if (!amount) return res.status(400).json({ message: "Missing amount" });

    console.log("➡️ Creating Cashflows payment session for amount:", amount);

    const session = await cashflows.createPaymentSession(amount, userId);

    if (!session.hostedPageUrl) {
      console.error("❌ No hosted page URL found in response");
      return res.status(500).json({
        message: "Payment session created but no redirect URL found",
        fullResponse: session.fullResponse,
      });
    }

    res.json({
      success: true,
      redirectUrl: session.hostedPageUrl,
      sessionId: session.paymentJobReference,
      message: "Payment session created successfully",
    });
  } catch (error: any) {
    console.error("❌ Error creating payment session:", error.message);
    res.status(500).json({
      message: "Failed to create payment session",
      error: error.response?.data || error.message,
    });
  }
});

app.post("/api/wallet/confirm-topup", isAuthenticated, async (req: any, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: "Missing sessionId" });

    const payment = await cashflows.getPaymentStatus(sessionId);
    const status =
      payment?.status || payment?.checkout?.status || payment?.data?.status;

    if (status === "SUCCESS" || status === "COMPLETED") {
      const userId = payment?.metadata?.userId;
      const amount = parseFloat(payment?.amountToCollect || "0");

      const user = await storage.getUser(userId);
      const newBalance = (
        parseFloat(user?.balance || "0") + amount
      ).toString();
      await storage.updateUserBalance(userId, newBalance);

      await storage.createTransaction({
        userId,
        type: "deposit",
        amount: amount.toString(),
        description: `Cashflows top-up of £${amount}`,
      });

      return res.json({ success: true });
    }

    res.status(400).json({ message: "Payment not completed yet" });
  } catch (error) {
    console.error("Error confirming Cashflows top-up:", error);
    res.status(500).json({ message: "Failed to confirm top-up" });
  }
});

app.get("/api/winners", async (req, res) => {
  try {
    const winners = await storage.getRecentWinners(50);
    console.log("🧩 Winners from storage:", winners);
    res.json(winners);
  } catch (error) {
    console.error("Error fetching winners:", error);
    res.status(500).json({ message: "Failed to fetch winners" });
  }
});


app.post("/api/seed-competitions", async (req, res) => {
    try {
      const competitions = req.body;
      for (const comp of competitions) {
        await storage.createCompetition(comp);
      }
      res.json({ message: "Sample competitions created successfully" });
    } catch (error) {
      console.error("Error seeding competitions:", error);
      res.status(500).json({ message: "Failed to seed competitions" });
    }
  });

app.delete("/api/delete" , async (req , res) => {
    try {
    console.log("🗑️ Deleting all competitions...");
        await db.delete(transactions).execute();
        // 1. Delete tickets linked to competitions
    await db.delete(tickets).execute();
    // 2. Delete orders linked to competitions
    await db.delete(orders).execute();
    const result = await db.delete(competitions).execute();
    console.log("✅ Delete result:", result);
      res.status(200).json({message : "all competitions deleted"})
    } catch (error) {
      console.error("❌ Delete failed:", error);
      res.status(500).json({ message: "Failed to delete competitions" });
    }  })

app.delete("/api/test-delete", (req, res) => {

  res.json({ message: "Delete route works!" });
});

const httpServer = createServer(app);
return httpServer;
}
