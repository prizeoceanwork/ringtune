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
    if (!stripe) {
      return res.status(500).json({
        message: "Payment processing not configured. Please contact admin.",
      });
    }

    const { orderId, quantity } = req.body;
    const userId = req.user.id;

    console.log("=== PAYMENT INTENT REQUEST ===");
    console.log("Full req.body:", JSON.stringify(req.body, null, 2));
    console.log("orderId:", orderId);
    console.log("quantity:", quantity);
    console.log("userId:", userId);

    if (!orderId || typeof orderId !== "string") {
      return res.status(400).json({ message: "Invalid or missing order ID" });
    }

    // ✅ Get the order first
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Extract competitionId from order
    const competitionId = order.competitionId;
    console.log("Resolved competitionId from order:", competitionId);

    // ✅ Fetch competition
    const competition = await storage.getCompetition(competitionId);
    if (!competition) {
      console.log("❌ Competition not found for ID:", competitionId);
      return res.status(404).json({ message: "Competition not found" });
    }

    console.log("✅ Competition found:", competition.title);

    // ✅ Calculate total price (Stripe uses smallest currency unit)
    const totalAmount = Math.round(parseFloat(competition.ticketPrice) * (quantity || 1) * 100);

    console.log("Creating Stripe Checkout Session...");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: competition.title,
              images: competition.imageUrl ? [competition.imageUrl] : [],
            },
            unit_amount: Math.round(parseFloat(competition.ticketPrice) * 100),
          },
          quantity: quantity || 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success/competition?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/${orderId}`,
      metadata: {
        orderId,
        competitionId,
        userId,
        quantity: quantity.toString(),
      },
    });

    console.log("✅ Checkout session created:", session.id);

    return res.json({
      url: session.url,
      orderId,
    });
  } catch (error) {
    console.error("❌ Error creating payment session:", error);
    res.status(500).json({
      message: "Failed to create payment session",
      error: (error as any).message,
    });
  }
});



app.post("/api/payment-success/competition", isAuthenticated, async (req: any, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: "Missing sessionId" });
    }

    if (!stripe) {
      return res.status(500).json({
        message: "Payment processing not configured. Please contact admin.",
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const { userId, competitionId, orderId, quantity } = session.metadata || {};
    const amount = (session.amount_total || 0) / 100;
    const ticketQuantity = parseInt(quantity) || 1; // ✅ Get the quantity

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
      description: `Stripe ticket purchase for ${competitionId} - ${ticketQuantity} tickets`,
    });

    // ✅ Create multiple tickets based on quantity
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

    // Wait for all tickets to be created
    await Promise.all(ticketPromises);

    console.log(`✅ Successfully created ${ticketQuantity} tickets for user ${userId}`);

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

  // Ticket purchase route
 // ✅ Unified purchase route (wallet or Stripe fallback)
app.post("/api/purchase-ticket", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { competitionId, quantity = 1 } = req.body;

    // 1️⃣ Fetch competition
    const competition = await storage.getCompetition(competitionId);
    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    const totalAmount = parseFloat(competition.ticketPrice) * quantity;

    // 2️⃣ Fetch user + wallet balance
    const user = await storage.getUser(userId);
    const userBalance = parseFloat(user?.balance || "0");

    // 3️⃣ Create base order (pending)
    const order = await storage.createOrder({
      userId,
      competitionId,
      quantity,
      totalAmount: totalAmount.toString(),
      paymentMethod: userBalance >= totalAmount ? "wallet" : "stripe",
      status: "pending",
    });

    // 4️⃣ If wallet balance covers it
    if (userBalance >= totalAmount) {
      const newBalance = (userBalance - totalAmount).toString();

      // Deduct from wallet
      await storage.updateUserBalance(userId, newBalance);

      // Record transaction
      await storage.createTransaction({
        userId,
        type: "purchase",
        amount: `-${totalAmount}`,
        description: `Ticket purchase for ${competition.title}`,
        orderId: order.id,
      });

      // Generate tickets
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

      // Update competition sold count
      await storage.updateCompetitionSoldTickets(competitionId, quantity);

      // Mark order completed
      await storage.updateOrderStatus(order.id, "completed");

      // Return success immediately
      return res.json({
        success: true,
        message: "Tickets purchased via wallet",
        orderId: order.id,
        tickets,
        paymentMethod: "wallet",
      });
    }

    // 5️⃣ Otherwise → Stripe payment flow
    if (!stripe) {
      return res.status(500).json({
        message: "Payment processing not configured. Please contact admin.",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "gbp",
      metadata: {
        orderId: order.id,
        userId,
        competitionId,
      },
    });

    // Keep order as pending until payment success webhook
    await storage.updateOrderStatus(order.id, "pending");

    return res.json({
      orderId: order.id,
      clientSecret: paymentIntent.client_secret,
      paymentMethod: "stripe",
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
      const userId = req.user.claims.sub;
      const { ticketId } = req.body;

      // Get ticket and verify ownership
      const userTickets = await storage.getUserTickets(userId);
      const ticket = userTickets.find((t) => t.id === ticketId);

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Get competition
      const competition = await storage.getCompetition(ticket.competitionId);
      if (!competition || competition.type !== "spin") {
        return res
          .status(400)
          .json({ message: "Invalid competition for spin wheel" });
      }

      // Use the new car brand prizes
      const prizes = (competition.prizeData as any[]) || [
        { brand: "Rolls-Royce", amount: 1000, probability: 0.01 },
        { brand: "Ferrari", amount: 500, probability: 0.02 },
        { brand: "Bentley", amount: 250, probability: 0.03 },
        { brand: "Aston Martin", amount: 150, probability: 0.04 },
        { brand: "Lamborghini", amount: 90, probability: 0.05 },
        { brand: "Porsche", amount: 80, probability: 0.05 },
        { brand: "Maserati", amount: 75, probability: 0.05 },
        { brand: "McLaren", amount: 70, probability: 0.05 },
        { brand: "Mercedes-Benz", amount: 60, probability: 0.05 },
        { brand: "BMW", amount: 50, probability: 0.05 },
        { brand: "Audi", amount: "3000 Ringtones", probability: 0.1 },
        { brand: "Land Rover", amount: "2000 Ringtones", probability: 0.1 },
        { brand: "Jaguar", amount: "1000 Ringtones", probability: 0.1 },
        { brand: "Lexus", amount: "850 Ringtones", probability: 0.1 },
        { brand: "Mini", amount: "650 Ringtones", probability: 0.1 },
        { brand: "VW", amount: "450 Ringtones", probability: 0.1 },
        { brand: "Toyota", amount: "250 Ringtones", probability: 0.05 },
        { brand: "Honda", amount: "150 Ringtones", probability: 0.04 },
        { brand: "Ford", amount: "100 Ringtones", probability: 0.03 },
        { brand: "Nissan", amount: "50 Ringtones", probability: 0.02 },
      ];

      const random = Math.random();
      let cumulativeProbability = 0;
      let wonPrize = prizes[0];

      for (const prize of prizes) {
        cumulativeProbability += prize.probability;
        if (random <= cumulativeProbability) {
          wonPrize = prize;
          break;
        }
      }

      // Update ticket with prize - only handle cash prizes for balance
      if (typeof wonPrize.amount === "number" && wonPrize.amount > 0) {
        // Mark as winner and add prize transaction
        await storage.createTransaction({
          userId,
          type: "prize",
          amount: wonPrize.amount.toString(),
          description: `Spin wheel prize: ${wonPrize.brand} - £${wonPrize.amount}`,
        });

        // Update user balance
        const user = await storage.getUser(userId);
        const newBalance = parseFloat(user?.balance || "0") + wonPrize.amount;
        await storage.updateUserBalance(userId, newBalance.toString());
      }

      res.json({
        success: true,
        prize: wonPrize,
        segment: prizes.indexOf(wonPrize),
      });
    } catch (error) {
      console.error("Error playing spin wheel:", error);
      res.status(500).json({ message: "Failed to play spin wheel" });
    }
  });

  app.post("/api/play-scratch-card", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { ticketId } = req.body;

      // Get ticket and verify ownership
      const userTickets = await storage.getUserTickets(userId);
      const ticket = userTickets.find((t) => t.id === ticketId);

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Get competition
      const competition = await storage.getCompetition(ticket.competitionId);
      if (!competition || competition.type !== "scratch") {
        return res
          .status(400)
          .json({ message: "Invalid competition for scratch card" });
      }

      // Simulate scratch result
      const prizes = [0, 10, 25, 50, 100, 500, 1000, 5000, 22000];
      const winProbability = 0.15; // 15% chance to win
      const isWinner = Math.random() < winProbability;

      let wonAmount = 0;
      if (isWinner) {
        // Weight smaller prizes more heavily
        const weights = [0, 0.4, 0.3, 0.15, 0.08, 0.04, 0.02, 0.009, 0.001];
        const random = Math.random();
        let cumulativeWeight = 0;

        for (let i = 1; i < prizes.length; i++) {
          cumulativeWeight += weights[i];
          if (random <= cumulativeWeight) {
            wonAmount = prizes[i];
            break;
          }
        }
      }

      // Update ticket and user balance if won
      if (wonAmount > 0) {
        await storage.createTransaction({
          userId,
          type: "prize",
          amount: wonAmount.toString(),
          description: `Scratch card prize: £${wonAmount}`,
        });

        const user = await storage.getUser(userId);
        const newBalance = parseFloat(user?.balance || "0") + wonAmount;
        await storage.updateUserBalance(userId, newBalance.toString());
      }

      res.json({
        success: true,
        prize: wonAmount,
        isWinner: wonAmount > 0,
      });
    } catch (error) {
      console.error("Error playing scratch card:", error);
      res.status(500).json({ message: "Failed to play scratch card" });
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

  // Wallet top-up
  // app.post("/api/wallet/topup", isAuthenticated, async (req: any, res) => {
  //   try {
  //     if (!stripe) {
  //       return res
  //         .status(500)
  //         .json({
  //           message: "Payment processing not configured. Please contact admin.",
  //         });
  //     }

  //     const userId = req.user.id;
  //     const { amount } = req.body;

  //     if (!amount || amount <= 0) {
  //       return res.status(400).json({ message: "Invalid amount" });
  //     }

  //     const paymentIntent = await stripe.paymentIntents.create({
  //       amount: Math.round(amount * 100), // Convert to cents
  //       currency: "gbp",
  //       metadata: {
  //         userId,
  //         type: "wallet_topup",
  //       },
  //     });

  //     res.json({ clientSecret: paymentIntent.client_secret });
  //   } catch (error) {
  //     console.error("Error creating wallet top-up:", error);
  //     res.status(500).json({ message: "Failed to create wallet top-up" });
  //   }
  // });


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


  // server/routes.ts (or similar)
app.post("/api/wallet/topup-checkout", isAuthenticated, async (req: any, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        message: "Payment processing not configured. Please contact admin.",
      });
    }

    const { amount } = req.body; // amount in full currency units, e.g. 25 => £25.00
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // amount in pence: Stripe expects integer in smallest currency unit
    const amountInPence = Math.round(amount * 100);

    // create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { name: `Wallet top-up £${amount}` },
            unit_amount: amountInPence,
          },
          quantity: 1,
        },
      ],
      // Set these to pages on your frontend
      success_url: `${process.env.CLIENT_URL || "http://localhost:6500"}/wallet/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || "http://localhost:6500"}/wallet/cancel`,
      metadata: {
        userId: req.user.id,       // attach user so you can reconcile later
        type: "wallet_topup",
      },
    });

    // Return the URL for the hosted Stripe Checkout page
    res.json({ url: session.url });
  } catch (err) {
    console.error("Error creating Checkout session:", err);
    res.status(500).json({ message: "Failed to create checkout session" });
  }
});

app.post("/api/wallet/confirm-topup", isAuthenticated, async (req: any, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ message: "Missing sessionId" });

  if (!stripe) {
    return res.status(500).json({ message: "Payment processing not configured. Please contact admin." });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status === "paid") {
    const userId = session.metadata?.userId;
    const amount = (session.amount_total || 0) / 100;

    if (!userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const user = await storage.getUser(userId);
    const newBalance = (parseFloat(user?.balance || "0") + amount).toString();
    await storage.updateUserBalance(userId, newBalance);

    await storage.createTransaction({
      userId,
      type: "deposit",
      amount: amount.toString(),
      description: `Stripe top-up of £${amount}`,
    });

    return res.json({ success: true });
  }

  res.status(400).json({ message: "Payment not completed" });
});


  // Past winners
  app.get("/api/winners", async (req, res) => {
    try {
      const winners = await storage.getRecentWinners(50);
      res.json(winners);
    } catch (error) {
      console.error("Error fetching winners:", error);
      res.status(500).json({ message: "Failed to fetch winners" });
    }
  });

  // Seed initial competitions
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
