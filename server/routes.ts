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
  users,
} from "@shared/schema";
import { nanoid } from "nanoid";
import { db } from "./db";
import {stripe} from "./stripe";
import { cashflows } from "./cashflows";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
// Initialize Stripe only if keys are available
// let stripe: Stripe | null = null;
// if (process.env.STRIPE_SECRET_KEY) {
//   stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//     apiVersion: "2025-08-27.basil",
//   });
// }

// Admin middleware
export const isAdmin = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  next();
};

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
// app.post("/api/payment-success/competition", isAuthenticated, async (req: any, res) => {
//   try {
//     const { sessionId } = req.body;
//     if (!sessionId) {
//       return res.status(400).json({ message: "Missing sessionId" });
//     }

//     // Verify payment with Cashflows
//     const payment = await cashflows.getPaymentStatus(sessionId);

//     if (payment.status !== "COMPLETED") {
//       return res.status(400).json({ message: "Payment not completed" });
//     }

//     const { userId, competitionId, orderId, quantity } = payment.metadata || {};
//     const amount = (payment.amount?.value || 0) / 100;
//     const ticketQuantity = parseInt(quantity) || 1;

//     if (!userId || !orderId) {
//       return res.status(400).json({ message: "Invalid payment metadata" });
//     }

//     console.log(`🎫 Creating ${ticketQuantity} tickets for order ${orderId}`);

//     // Update order status
//     await storage.updateOrderStatus(orderId, "completed");

//     // Record transaction
//     await storage.createTransaction({
//       userId,
//       type: "purchase",
//       amount: amount.toString(),
//       description: `Cashflows ticket purchase for ${competitionId} - ${ticketQuantity} tickets`,
//     });

//     // Create tickets
//     const ticketPromises = [];
//     for (let i = 0; i < ticketQuantity; i++) {
//       ticketPromises.push(
//         storage.createTicket({
//           userId,
//           competitionId,
//           ticketNumber: nanoid(8).toUpperCase(),
//         })
//       );
//     }

//     await Promise.all(ticketPromises);

//     res.json({ 
//       success: true, 
//       competitionId, 
//       orderId,
//       ticketsCreated: ticketQuantity 
//     });
//   } catch (error) {
//     console.error("Error confirming ticket payment:", error);
//     res.status(500).json({ message: "Failed to confirm payment" });
//   }
// });

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


// NEW: Create spin wheel order (shows billing page)
app.post("/api/create-spin-order", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { competitionId, quantity = 1 } = req.body; // Now we need competitionId

    // Get the competition to get the actual ticket price
    const competition = await storage.getCompetition(competitionId);
    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    const spinCostPerTicket = parseFloat(competition.ticketPrice);
    const totalAmount = spinCostPerTicket * quantity;

    // Get user's current balances
    const user = await storage.getUser(userId);
    const userBalance = parseFloat(user?.balance || "0");
    const userPoints = user?.ringtonePoints || 0;
    const pointsValue = userPoints * 0.01; // 1 point = £0.01

    // Create pending order for spins
    const order = await storage.createOrder({
      userId,
      competitionId: competitionId, // Use actual competition ID
      quantity,
      totalAmount: totalAmount.toString(),
      paymentMethod: "pending",
      status: "pending",
    });

    res.json({
      success: true,
      orderId: order.id,
      totalAmount,
      quantity,
      userBalance: {
        wallet: userBalance,
        ringtonePoints: userPoints,
        pointsValue: pointsValue
      },
      spinCost: spinCostPerTicket,
      competition: {
        title: competition.title,
        type: competition.type
      }
    });
  } catch (error) {
    console.error("Error creating spin order:", error);
    res.status(500).json({ message: "Failed to create spin order" });
  }
});

// NEW: Process spin wheel payment with multiple options
app.post("/api/process-spin-payment", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { 
      orderId, 
      useWalletBalance = false, 
      useRingtonePoints = false 
    } = req.body;

    const order = await storage.getOrder(orderId);
    if (!order || order.userId !== userId) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Order already processed" });
    }

    // Get competition to verify it's a spin type
    const competition = await storage.getCompetition(order.competitionId);
    if (!competition || competition.type !== "spin") {
      return res.status(400).json({ message: "Invalid competition type" });
    }

    const user = await storage.getUser(userId);
    const totalAmount = parseFloat(order.totalAmount);
    let remainingAmount = totalAmount;
    let walletUsed = 0;
    let pointsUsed = 0;
    let cashflowsUsed = 0;

    const paymentBreakdown = [];

    // Process wallet balance if selected
    if (useWalletBalance) {
      const walletBalance = parseFloat(user?.balance || "0");
      const walletAmount = Math.min(walletBalance, remainingAmount);
      
      if (walletAmount > 0) {
        const newBalance = walletBalance - walletAmount;
        await storage.updateUserBalance(userId, newBalance.toString());
        
        await storage.createTransaction({
          userId,
          type: "purchase",
          amount: `-${walletAmount}`,
          description: `Wallet payment for ${order.quantity} spin(s) - ${competition.title}`,
          orderId,
        });

        walletUsed = walletAmount;
        remainingAmount -= walletAmount;
        paymentBreakdown.push({
          method: "wallet",
          amount: walletAmount,
          description: `Site Credit: £${walletAmount.toFixed(2)}`
        });
      }
    }

    // Process ringtone points if selected
    if (useRingtonePoints && remainingAmount > 0) {
      const availablePoints = user?.ringtonePoints || 0;
      // Convert points to currency (1 point = £0.01)
      const pointsValue = availablePoints * 0.01;
      const pointsAmount = Math.min(pointsValue, remainingAmount);
      
      if (pointsAmount > 0) {
        const pointsToUse = Math.floor(pointsAmount * 100); // Multiply by 100 (1/0.01)
        const newPoints = availablePoints - pointsToUse;
        await storage.updateUserRingtonePoints(userId, newPoints);
        
        await storage.createTransaction({
          userId,
          type: "purchase",
          amount: `-${pointsToUse}`,
          description: `Ringtone points payment for ${order.quantity} spin(s) - ${competition.title}`,
          orderId,
        });

        pointsUsed = pointsToUse;
        remainingAmount -= pointsAmount;
        paymentBreakdown.push({
          method: "ringtone_points",
          amount: pointsAmount,
          pointsUsed: pointsToUse,
          description: `Wolf Points: £${pointsAmount.toFixed(2)} (${pointsToUse} points)`
        });
      }
    }

    // Process remaining amount through Cashflows
    if (remainingAmount > 0) {
      cashflowsUsed = remainingAmount;
      
      const session = await cashflows.createCompetitionPaymentSession(remainingAmount, {
        orderId,
        competitionId: order.competitionId,
        userId,
        quantity: order.quantity.toString(),
        paymentBreakdown: JSON.stringify(paymentBreakdown)
      });

      if (!session.hostedPageUrl) {
        // Refund wallet and points if Cashflows fails
        if (walletUsed > 0) {
          const currentBalance = parseFloat(user?.balance || "0");
          await storage.updateUserBalance(userId, (currentBalance + walletUsed).toString());
        }
        if (pointsUsed > 0) {
          const currentPoints = user?.ringtonePoints || 0;
          await storage.updateUserRingtonePoints(userId, currentPoints + pointsUsed);
        }
        
        return res.status(500).json({ message: "Failed to create Cashflows session" });
      }

      // Update order with partial payment info
      await storage.updateOrderPaymentInfo(orderId, {
        paymentMethod: "mixed",
        walletAmount: walletUsed.toString(),
        pointsAmount: pointsUsed.toString(),
        cashflowsAmount: cashflowsUsed.toString(),
        paymentBreakdown: JSON.stringify(paymentBreakdown)
      });

      return res.json({
        success: true,
        redirectUrl: session.hostedPageUrl,
        sessionId: session.paymentJobReference,
        paymentBreakdown: {
          walletUsed,
          pointsUsed,
          cashflowsUsed,
          remainingAmount
        }
      });
    } else {
      // Full payment completed with wallet/points only
      await storage.updateOrderStatus(orderId, "completed");
      
      // Create spin tickets (not competition tickets)
      const spins = [];
      for (let i = 0; i < order.quantity; i++) {
        const spinId = nanoid(8).toUpperCase();
        spins.push({
          id: spinId,
          spinNumber: i + 1
        });
      }

      await storage.updateOrderPaymentInfo(orderId, {
        paymentMethod: "wallet_points_only",
        walletAmount: walletUsed.toString(),
        pointsAmount: pointsUsed.toString(),
        cashflowsAmount: "0",
        paymentBreakdown: JSON.stringify(paymentBreakdown)
      });

      return res.json({
        success: true,
        competitionId: order.competitionId, 
        message: "Payment completed successfully",
        orderId: order.id,
        spins: spins,
        spinsPurchased: order.quantity,
        paymentMethod: "wallet_points_only",
        paymentBreakdown
      });
    }
  } catch (error) {
    console.error("Error processing spin payment:", error);
    res.status(500).json({ message: "Failed to process payment" });
  }
});

// UPDATED: Spin wheel play route (now uses pre-paid spins)
app.post("/api/play-spin-wheelll", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { orderId, winnerPrize, prize } = req.body; // Accept both winnerPrize and prize

    // Use either winnerPrize or prize
    const actualPrize = winnerPrize || prize;

    if (!actualPrize) {
      return res.status(400).json({
        success: false,
        message: "Invalid prize data — missing prize information",
      });
    }

    // Verify valid completed order
    const order = await storage.getOrder(orderId);
    if (!order || order.userId !== userId || order.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "No valid spin purchase found",
      });
    }

    // Check spins remaining
    const spinsUsed = await storage.getSpinsUsed(orderId);
    const spinsRemaining = order.quantity - spinsUsed;

    if (spinsRemaining <= 0) {
      return res.status(400).json({
        success: false,
        message: "No spins remaining in this purchase",
      });
    }

    // Record usage
    await storage.recordSpinUsage(orderId, userId);

    // Get user
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // --- PRIZE HANDLING ---
    // Handle different prize structures
    const prizeValue = actualPrize.value || actualPrize.amount;
    const prizeType = actualPrize.type || (typeof prizeValue === 'number' ? 'cash' : 'points');

    if (prizeType === "cash" && prizeValue) {
      const amount = parseFloat(prizeValue);
      const finalBalance = parseFloat(user.balance || "0") + amount;
      await storage.updateUserBalance(userId, finalBalance.toFixed(2));

      await storage.createTransaction({
        userId,
        type: "prize",
        amount: amount.toFixed(2),
        description: `Spin Wheel Prize - £${amount}`,
      });

      await storage.createWinner({
        userId,
        competitionId: null,
        prizeDescription: "Spin Wheel Prize",
        prizeValue: `£${amount}`,
        imageUrl: actualPrize.image || null,
      });

    } else if (prizeType === "points" && prizeValue) {
      const points = parseInt(prizeValue);
      const newPoints = (user.ringtonePoints || 0) + points;
      await storage.updateUserRingtonePoints(userId, newPoints);

      await storage.createTransaction({
        userId,
        type: "prize",
        amount: points.toString(),
        description: `Spin Wheel Prize - ${points} Ringtones`,
      });

      await storage.createWinner({
        userId,
        competitionId: null,
        prizeDescription: "Spin Wheel Prize",
        prizeValue: `${points} Ringtones`,
        imageUrl: actualPrize.image || null,
      });
    }

    res.json({
      success: true,
      prize: actualPrize,
      spinsRemaining: spinsRemaining - 1,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Error playing spin wheel:", error);
    res.status(500).json({ message: "Failed to play spin wheel" });
  }
});


// Get spin order details for billing page
app.get("/api/spin-order/:orderId", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await storage.getOrder(orderId);
    if (!order || order.userId !== userId) {
      return res.status(404).json({ message: "Order not found" });
    }

    const user = await storage.getUser(userId);
    const used = await storage.getSpinsUsed(orderId);
    const remaining = order.quantity - used;
    res.json({
      order: {
        id: order.id,
         competitionId: order.competitionId,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        status: order.status,
         remainingPlays: remaining,
        used : used
      },
      user: {
        balance: user?.balance || "0",
        ringtonePoints: user?.ringtonePoints || 0
      },
      spinCost: 2 // £2 per spin
    });
  } catch (error) {
    console.error("Error fetching spin order:", error);
    res.status(500).json({ message: "Failed to fetch spin order" });
  }
});

// Spin History

app.post("/api/create-scratch-order", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { competitionId, quantity = 1 } = req.body;

    const competition = await storage.getCompetition(competitionId);
    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    const scratchCostPerCard = parseFloat(competition.ticketPrice);
    const totalAmount = scratchCostPerCard * quantity;

    const user = await storage.getUser(userId);
    const userBalance = parseFloat(user?.balance || "0");
    const userPoints = user?.ringtonePoints || 0;
    const pointsValue = userPoints * 0.01;

    const order = await storage.createOrder({
      userId,
      competitionId,
      quantity,
      totalAmount: totalAmount.toString(),
      paymentMethod: "pending",
      status: "pending",
    });

    res.json({
      success: true,
      orderId: order.id,
      competitionId: competitionId,
      totalAmount,
      quantity,
      userBalance: {
        wallet: userBalance,
        ringtonePoints: userPoints,
        pointsValue,
      },
      scratchCost: scratchCostPerCard,
      competition: {
        title: competition.title,
        type: competition.type,
      },
    });
  } catch (error) {
    console.error("Error creating scratch order:", error);
    res.status(500).json({ message: "Failed to create scratch order" });
  }
});

app.post("/api/process-scratch-payment", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { orderId, useWalletBalance = false, useRingtonePoints = false } = req.body;

    const order = await storage.getOrder(orderId);
    if (!order || order.userId !== userId) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Order already processed" });
    }

    const competition = await storage.getCompetition(order.competitionId);
    if (!competition || competition.type !== "scratch") {
      return res.status(400).json({ message: "Invalid competition type" });
    }

    const user = await storage.getUser(userId);
    const totalAmount = parseFloat(order.totalAmount);
    let remainingAmount = totalAmount;
    let walletUsed = 0;
    let pointsUsed = 0;
    let cashflowsUsed = 0;

    const paymentBreakdown = [];

    // Wallet
    if (useWalletBalance) {
      const walletBalance = parseFloat(user?.balance || "0");
      const walletAmount = Math.min(walletBalance, remainingAmount);

      if (walletAmount > 0) {
        const newBalance = walletBalance - walletAmount;
        await storage.updateUserBalance(userId, newBalance.toString());
        await storage.createTransaction({
          userId,
          type: "purchase",
          amount: `-${walletAmount}`,
          description: `Wallet payment for ${order.quantity} scratch card(s) - ${competition.title}`,
          orderId,
        });

        walletUsed = walletAmount;
        remainingAmount -= walletAmount;
        paymentBreakdown.push({
          method: "wallet",
          amount: walletAmount,
          description: `Wallet: £${walletAmount.toFixed(2)}`,
        });
      }
    }

    // Ringtone Points
    if (useRingtonePoints && remainingAmount > 0) {
      const availablePoints = user?.ringtonePoints || 0;
      const pointsValue = availablePoints * 0.01;
      const pointsAmount = Math.min(pointsValue, remainingAmount);

      if (pointsAmount > 0) {
        const pointsToUse = Math.floor(pointsAmount * 100);
        const newPoints = availablePoints - pointsToUse;
        await storage.updateUserRingtonePoints(userId, newPoints);
        await storage.createTransaction({
          userId,
          type: "purchase",
          amount: `-${pointsToUse}`,
          description: `Ringtone points payment for ${order.quantity} scratch card(s) - ${competition.title}`,
          orderId,
        });

        pointsUsed = pointsToUse;
        remainingAmount -= pointsAmount;
        paymentBreakdown.push({
          method: "ringtone_points",
          amount: pointsAmount,
          pointsUsed: pointsToUse,
          description: `Wolf Points: £${pointsAmount.toFixed(2)} (${pointsToUse} points)`,
        });
      }
    }

    // Cashflows (for remaining)
    if (remainingAmount > 0) {
      cashflowsUsed = remainingAmount;

      const session = await cashflows.createCompetitionPaymentSession(remainingAmount, {
        orderId,
        competitionId: order.competitionId,
        userId,
        quantity: order.quantity.toString(),
        paymentBreakdown: JSON.stringify(paymentBreakdown),
      });

      if (!session.hostedPageUrl) {
        // Refund wallet + points if Cashflows fails
        if (walletUsed > 0) {
          const currentBalance = parseFloat(user?.balance || "0");
          await storage.updateUserBalance(userId, (currentBalance + walletUsed).toString());
        }
        if (pointsUsed > 0) {
          const currentPoints = user?.ringtonePoints || 0;
          await storage.updateUserRingtonePoints(userId, currentPoints + pointsUsed);
        }

        return res.status(500).json({ message: "Failed to create Cashflows session" });
      }

      await storage.updateOrderPaymentInfo(orderId, {
        paymentMethod: "mixed",
        walletAmount: walletUsed.toString(),
        pointsAmount: pointsUsed.toString(),
        cashflowsAmount: cashflowsUsed.toString(),
        paymentBreakdown: JSON.stringify(paymentBreakdown),
      });

      return res.json({
        success: true,
        redirectUrl: session.hostedPageUrl,
        sessionId: session.paymentJobReference,
        paymentBreakdown,
      });
    } else {
      // Fully covered by wallet/points
      await storage.updateOrderStatus(orderId, "completed");
      await storage.updateOrderPaymentInfo(orderId, {
        paymentMethod: "wallet_points_only",
        walletAmount: walletUsed.toString(),
        pointsAmount: pointsUsed.toString(),
        cashflowsAmount: "0",
        paymentBreakdown: JSON.stringify(paymentBreakdown),
      });

      return res.json({
        success: true,
        competitionId: order.competitionId,
        message: "Scratch card purchase completed",
        orderId: order.id,
        cardsPurchased: order.quantity,
        paymentMethod: "wallet_points_only",
        paymentBreakdown,
      });
    }
  } catch (error) {
    console.error("Error processing scratch payment:", error);
    res.status(500).json({ message: "Failed to process scratch payment" });
  }
});

app.post("/api/play-scratch-carddd", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { orderId, winnerPrize } = req.body;

    const order = await storage.getOrder(orderId);
    if (!order || order.userId !== userId || order.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "No valid scratch card purchase found",
      });
    }

    // Check if scratch card remaining
    const used = await storage.getScratchCardsUsed(orderId);
    const remaining = order.quantity - used;

    if (remaining <= 0) {
      return res.status(400).json({
        success: false,
        message: "No scratch cards remaining in this purchase",
      });
    }

    await storage.recordScratchCardUsage(orderId, userId);

    // ----- Prize handling -----
    const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
    if (winnerPrize.type === "cash" && winnerPrize.value) {
      const amount = parseFloat(winnerPrize.value);
      const finalBalance = parseFloat(user.balance || "0") + amount;
      await storage.updateUserBalance(userId, finalBalance.toFixed(2));

      await storage.createTransaction({
        userId,
        type: "prize",
        amount: amount.toFixed(2),
        description: `Scratch Card Prize - £${amount}`,
      });

      await storage.createWinner({
        userId,
        competitionId: null,
        prizeDescription: "Scratch Card Prize",
        prizeValue: `£${amount}`,
        imageUrl: winnerPrize.image || null,
      });
    } else if (winnerPrize.type === "points" && winnerPrize.value) {
      const points = parseInt(winnerPrize.value);
      const newPoints = (user?.ringtonePoints || 0) + points;
      await storage.updateUserRingtonePoints(userId, newPoints);

      await storage.createTransaction({
        userId,
        type: "prize",
        amount: points.toString(),
        description: `Scratch Card Prize - ${points} Ringtones`,
      });

      await storage.createWinner({
        userId,
        competitionId: null,
        prizeDescription: "Scratch Card Prize",
        prizeValue: `${points} Ringtones`,
        imageUrl: winnerPrize.image || null,
      });
    }

    res.json({
      success: true,
      prize: winnerPrize,
      remainingCards: remaining - 1,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Error playing scratch card:", error);
    res.status(500).json({ message: "Failed to play scratch card" });
  }
});

app.get("/api/scratch-order/:orderId", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await storage.getOrder(orderId);
    if (!order || order.userId !== userId) {
      return res.status(404).json({ message: "Order not found" });
    }

    const user = await storage.getUser(userId);
    const used = await storage.getScratchCardsUsed(orderId);
    const remaining =  order.quantity - used;
    res.json({
      order: {
        id: order.id,
        competitionId: order.competitionId,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        status: order.status,
        remainingPlays: remaining,
        used : used
      },
      user: {
        balance: user?.balance || "0",
        ringtonePoints: user?.ringtonePoints || 0,
      },
      scratchCost: 2, // £2 per scratch
    });
  } catch (error) {
    console.error("Error fetching scratch order:", error);
    res.status(500).json({ message: "Failed to fetch scratch order" });
  }
});

  // Payment confirmation webhook
app.post("/api/payment-success/competition", isAuthenticated, async (req: any, res) => {
  try {
    console.log("🟢 /api/payment-success/competition called");
    console.log("🟢 Request body:", req.body);

    const { sessionId, orderId } = req.body;
    const userId = req.user.id;

    if (!sessionId || !orderId) {
      console.warn("⚠️ Missing sessionId or orderId");
      return res.status(400).json({ message: "Missing sessionId or orderId" });
    }

    console.log("🔍 Checking payment status for sessionId:", sessionId);
    
    const payment = await cashflows.getPaymentStatus(sessionId);
    console.log("🔍 Raw Cashflows response:", JSON.stringify(payment, null, 2));

    // ✅ Safely resolve paymentStatus
    const status =
      payment?.data?.paymentStatus || 
      payment?.data?.data?.paymentStatus ||
      payment?.paymentStatus;

    console.log("🔍 Resolved paymentStatus:", status);

    if (status !== "Paid") {
      console.warn("❌ Payment not completed yet");
      return res.status(400).json({ 
        message: `Payment not completed yet. Status: ${status}`,
        paymentData: payment
      });
    }

    // ✅ Safely resolve metadata
    const metadata =
      payment?.data?.metadata ||
      payment?.data?.data?.metadata ||
      payment?.metadata;

    console.log("🔍 Resolved metadata:", metadata);

    const fetchedOrderId = metadata?.orderId || orderId;
    console.log("🔍 Using orderId:", fetchedOrderId);

    const order = await storage.getOrder(fetchedOrderId);
    console.log("🔍 Fetched order:", order);

    if (!order || order.userId !== userId) {
      console.warn("⚠️ Order not found or invalid user");
      return res.status(404).json({ message: "Order not found or invalid user" });
    }

    console.log("🔄 Updating order status to 'completed'");
    await storage.updateOrderStatus(fetchedOrderId, "completed");

    console.log("🎟 Creating tickets...");
    const tickets = [];
    for (let i = 0; i < order.quantity; i++) {
      const ticketNumber = nanoid(8).toUpperCase();
      const ticket = await storage.createTicket({
        userId,
        competitionId: order.competitionId,
        ticketNumber,
        isWinner: false,
      });
      tickets.push(ticket);
      console.log(`🎫 Ticket created: ${ticketNumber}`);
    }

    console.log("🔄 Updating competition sold tickets:", order.quantity);
    await storage.updateCompetitionSoldTickets(order.competitionId, order.quantity);

    // ✅ GET COMPETITION TYPE AND CREATE PROPER DESCRIPTION
    const competition = await storage.getCompetition(order.competitionId);
    const competitionType = competition?.type;
    
    let transactionDescription = `Purchased ${order.quantity} ticket(s)`;
    let transactionAmount = "";
    
    // ✅ CHECK IF PURCHASE WAS WITH RINGTONE POINTS OR CASH
    if (order.pointsAmount && parseFloat(order.pointsAmount) > 0) {
      // This is a Ringtone Points purchase
      const pointsUsed = parseFloat(order.pointsAmount);
      
      if (competitionType) {
        switch (competitionType) {
          case 'spin':
            transactionDescription = `Purchased ${order.quantity} Spin${order.quantity > 1 ? 's' : ''}`;
            break;
          case 'scratch':
            transactionDescription = `Purchased ${order.quantity} Scratch Card${order.quantity > 1 ? 's' : ''}`;
            break;
          case 'instant':
            transactionDescription = `Purchased ${order.quantity} Competition${order.quantity > 1 ? 's' : ''}`;
            break;
          default:
            transactionDescription = `Purchased ${order.quantity} ticket(s)`;
        }
      }
      // For Ringtone Points, store the amount as negative points
      transactionAmount = `-${pointsUsed}`;
    } else {
      // This is a cash purchase
      if (competitionType) {
        switch (competitionType) {
          case 'spin':
            transactionDescription = `Purchased ${order.quantity} Spin${order.quantity > 1 ? 's' : ''}`;
            break;
          case 'scratch':
            transactionDescription = `Purchased ${order.quantity} Scratch Card${order.quantity > 1 ? 's' : ''}`;
            break;
          case 'instant':
            transactionDescription = `Purchased ${order.quantity} Competition${order.quantity > 1 ? 's' : ''}`;
            break;
          default:
            transactionDescription = `Purchased ${order.quantity} ticket(s)`;
        }
      }
      // For cash, store the amount as negative monetary value
      transactionAmount = `-${order.totalAmount}`;
    }

    console.log("💰 Creating transaction record with description:", transactionDescription);
    await storage.createTransaction({
      userId,
      type: "purchase",
      amount: transactionAmount, // ✅ This will be either points or cash amount
      description: transactionDescription,
      orderId: fetchedOrderId,
    });

    console.log("✅ Payment confirmed and tickets issued successfully");
    res.json({ 
      success: true, 
      tickets, 
      competitionId: order.competitionId,
      competitionType, 
      orderId: order.id,
    });

  } catch (error: any) {
    console.error("❌ Error confirming competition payment:", error);
    res.status(500).json({ message: "Failed to confirm payment", error: error.message });
  }
});
  // Game routes
// app.post("/api/play-spin-wheel", isAuthenticated, async (req: any, res) => {
//   try {
//     const userId = req.user.id;
//     const { winnerPrize } = req.body;
//     const SPIN_COST = 2; // £2 per spin

//     // Fetch user and ensure balance is enough
//     const user = await storage.getUser(userId);
//     const currentBalance = parseFloat(user?.balance || "0");

//     if (currentBalance < SPIN_COST) {
//       return res.status(400).json({
//         success: false,
//         message: "Insufficient balance. Please top up your wallet.",
//       });
//     }

//     // Deduct the spin cost
//     const newBalance = currentBalance - SPIN_COST;
//     await storage.updateUserBalance(userId, newBalance.toFixed(2));

//     await storage.createTransaction({
//       userId,
//       type: "withdrawal",
//       amount: SPIN_COST.toFixed(2),
//       description: "Spin Wheel - Spin cost",
//     });

//     // ---- Handle prize logic ----
//     if (typeof winnerPrize.amount === "number" && winnerPrize.amount > 0) {
//       // 💰 Cash prize
//       const prizeAmount = winnerPrize.amount;
//       const finalBalance = newBalance + prizeAmount;

//       await storage.updateUserBalance(userId, finalBalance.toFixed(2));

//       await storage.createTransaction({
//         userId,
//         type: "prize",
//         amount: prizeAmount.toFixed(2),
//         description: `Spin wheel prize: ${winnerPrize.brand || "Prize"} - £${prizeAmount}`,
//       });

//       await storage.createWinner({
//         userId,
//         competitionId: null,
//         prizeDescription: winnerPrize.brand || "Spin Wheel Prize",
//         prizeValue: `£${prizeAmount}`,
//         imageUrl: winnerPrize.image || null,
//       });
//     } else if (
//       typeof winnerPrize.amount === "string" &&
//       winnerPrize.amount.includes("Ringtones")
//     ) {
//       // 🎵 Ringtone points prize
//       const match = winnerPrize.amount.match(/(\d+)\s*Ringtones/);
//       if (match) {
//         const points = parseInt(match[1]);
//         const newPoints = (user?.ringtonePoints || 0) + points;

//         await storage.updateUserRingtonePoints(userId, newPoints);

//         await storage.createTransaction({
//           userId,
//           type: "prize",
//           amount: points.toString(),
//           description: `Spin wheel prize: ${winnerPrize.brand || "Prize"} - ${points} Ringtones`,
//         });

//         await storage.createWinner({
//           userId,
//           competitionId: null,
//           prizeDescription: winnerPrize.brand || "Spin Wheel Prize",
//           prizeValue: `${points} Ringtones`,
//           imageUrl: winnerPrize.image || null,
//         });
//       }
//     }

//     res.json({
//       success: true,
//       prize: winnerPrize,
//       balance: newBalance.toFixed(2),
//     });
//   } catch (error) {
//     console.error("Error playing spin wheel:", error);
//     res.status(500).json({ message: "Failed to play spin wheel" });
//   }
// });

// app.post("/api/play-scratch-card", isAuthenticated, async (req: any, res) => {
//   try {
//     const userId = req.user.id;
//     const { winnerPrize } = req.body;
//     const SCRATCH_COST = 2; // £2 per scratch

//     const user = await storage.getUser(userId);
//     const currentBalance = parseFloat(user?.balance || "0");

//     if (currentBalance < SCRATCH_COST) {
//       return res.status(400).json({
//         success: false,
//         message: "Insufficient balance. Please top up your wallet.",
//       });
//     }

//     // 💳 Deduct scratch cost
//     const newBalance = currentBalance - SCRATCH_COST;
//     await storage.updateUserBalance(userId, newBalance.toFixed(2));
//     await storage.createTransaction({
//       userId,
//       type: "withdrawal",
//       amount: SCRATCH_COST.toFixed(2),
//       description: "Scratch Card - Play cost",
//     });

//     // 🎁 Handle prize logic
//     if (winnerPrize.type === "cash" && winnerPrize.value) {
//       const amount = parseFloat(winnerPrize.value);
//       if (amount > 0) {
//         const finalBalance = newBalance + amount;
//         await storage.updateUserBalance(userId, finalBalance.toFixed(2));

//         await storage.createTransaction({
//           userId,
//           type: "prize",
//           amount: amount.toFixed(2),
//           description: `Scratch card prize: £${amount}`,
//         });

//         await storage.createWinner({
//           userId,
//           competitionId : null,
//           prizeDescription: "Scratch Card Prize",
//           prizeValue: `£${amount}`,
//           imageUrl: winnerPrize.image || null,
//         });
//       }
//     } else if (winnerPrize.type === "points" && winnerPrize.value) {
//       const points = parseInt(winnerPrize.value);
//       const newPoints = (user?.ringtonePoints || 0) + points;

//       await storage.updateUserRingtonePoints(userId, newPoints);
//       await storage.createTransaction({
//         userId,
//         type: "prize",
//         amount: points.toString(),
//         description: `Scratch card prize: ${points} Ringtones`,
//       });

//       await storage.createWinner({
//         userId,
//         competitionId : null, 
//         prizeDescription: "Scratch Card Prize",
//         prizeValue: `${points} Ringtones`,
//         imageUrl: winnerPrize.image || null,
//       });
//     }

//     res.json({
//       success: true,
//       prize: winnerPrize,
//       balance: newBalance.toFixed(2),
//     });
//   } catch (error) {
//     console.error("Error playing scratch card:", error);
//     res.status(500).json({ message: "Failed to play scratch card" });
//   }
// });

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

    if (points < 100) {
      return res.status(400).json({ message: "Minimum conversion is 100 points" });
    }

    // ✅ Correct conversion
    const euroAmount = points * 0.01;

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
      description: `Received £${euroAmount.toFixed(2)} from ringtone points conversion`,
    });

    res.json({
      success: true,
      convertedPoints: points,
      euroAmount,
      newRingtonePoints: newPoints,
      newBalance,
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

    console.log("🔍 Checking payment status for:", sessionId);

    const payment = await cashflows.getPaymentStatus(sessionId);
    console.log("🔍 Payment response received");

    // ✅ CORRECT: Cashflows uses "Paid" status, not "SUCCESS" or "COMPLETED"
    const status = payment?.data?.paymentStatus;
    console.log("🔍 Payment status:", status);

    if (status === "Paid") {
      console.log("✅ Payment is Paid, processing...");
      
      // ✅ Get amount from correct field
      const amount = parseFloat(payment?.data?.amountToCollect || "0");
      
      // ✅ Use current user ID since metadata might not be populated
      const userId = req.user.id;
      
      console.log("💰 Processing payment - Amount:", amount, "User:", userId);

      // Update user balance
      const user = await storage.getUser(userId);
      const newBalance = (parseFloat(user?.balance || "0") + amount).toString();
      await storage.updateUserBalance(userId, newBalance);

      // Create transaction record
      await storage.createTransaction({
        userId,
        type: "deposit",
        amount: amount.toString(),
        description: `Cashflows top-up of £${amount.toFixed(2)}`,
      });

      console.log("✅ Payment confirmed successfully");
      return res.json({ 
        success: true,
        message: "Payment confirmed successfully"
      });
    } else {
      console.log("❌ Payment not completed. Status:", status);
      res.status(400).json({ 
        message: `Payment not completed yet. Status: ${status}`,
        status: status 
      });
    }

  } catch (error : any) {
    console.error("❌ Error confirming Cashflows top-up:", error);
    res.status(500).json({ 
      message: "Failed to confirm top-up",
      error: error.message 
    });
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


// Admin routes would go here (protected by isAdmin middleware)
// Admin Routes

// Get admin dashboard stats
app.get("/api/admin/dashboard", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    // Get total users
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    
    // Get total competitions
    const totalCompetitions = await db.select({ count: sql<number>`count(*)` }).from(competitions);
    
    // Get total revenue
    const revenueResult = await db.select({ total: sql<number>`coalesce(sum(${orders.totalAmount}), 0)` })
      .from(orders)
      .where(eq(orders.status, "completed"));
    
    // Get recent orders
    const recentOrders = await db
      .select()
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(competitions, eq(orders.competitionId, competitions.id))
      .orderBy(desc(orders.createdAt))
      .limit(10);

    res.json({
      stats: {
        totalUsers: totalUsers[0]?.count || 0,
        totalCompetitions: totalCompetitions[0]?.count || 0,
        totalRevenue: revenueResult[0]?.total || 0,
      },
      recentOrders: recentOrders.map(order => ({
        id: order.orders.id,
        user: {
          firstName: order.users?.firstName,
          lastName: order.users?.lastName,
          email: order.users?.email,
        },
        competition: order.competitions?.title,
        amount: order.orders.totalAmount,
        status: order.orders.status,
        createdAt: order.orders.createdAt,
      }))
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});

// Manage competitions
app.get("/api/admin/competitions", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const allCompetitions = await db.select()
      .from(competitions)
      .orderBy(desc(competitions.createdAt));
    
    res.json(allCompetitions);
  } catch (error) {
    console.error("Error fetching competitions:", error);
    res.status(500).json({ message: "Failed to fetch competitions" });
  }
});

// Create competition
app.post("/api/admin/competitions", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const competitionData = req.body;
    
    const competition = await storage.createCompetition({
      ...competitionData,
      isActive: true,
    });
    
    res.status(201).json(competition);
  } catch (error) {
    console.error("Error creating competition:", error);
    res.status(500).json({ message: "Failed to create competition" });
  }
});

// Update competition
app.put("/api/admin/competitions/:id", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const [updatedCompetition] = await db
      .update(competitions)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(competitions.id, id))
      .returning();
    
    if (!updatedCompetition) {
      return res.status(404).json({ message: "Competition not found" });
    }
    
    res.json(updatedCompetition);
  } catch (error) {
    console.error("Error updating competition:", error);
    res.status(500).json({ message: "Failed to update competition" });
  }
});

// Delete competition
app.delete("/api/admin/competitions/:id", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;

    // ✅ 1. Delete all transactions related to orders for this competition
    await db
      .delete(transactions)
      .where(inArray(transactions.orderId, db.select({ id: orders.id }).from(orders).where(eq(orders.competitionId, id))));

    // ✅ 2. Delete all tickets related to this competition
    await db.delete(tickets).where(eq(tickets.competitionId, id));

    // ✅ 3. Delete all orders related to this competition
    await db.delete(orders).where(eq(orders.competitionId, id));

    // ✅ 4. Finally, delete the competition itself
    const [deletedCompetition] = await db
      .delete(competitions)
      .where(eq(competitions.id, id))
      .returning();

    if (!deletedCompetition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    res.json({ message: "Competition deleted successfully" });
  } catch (error) {
    console.error("Error deleting competition:", error);
    res.status(500).json({ message: "Failed to delete competition" });
  }
});


//  Delete user
app.delete("/api/admin/users/:id", isAuthenticated , isAdmin , async (req: any , res) =>{
  try {
      const { id } = req.params;
      const userId = req.user.id;
      if(id === userId){
        return res.status(400).json({ message : "admin cannot delete own account"})
      }

      const user = await storage.getUser(id);
      if(!user){
        return res.status(404).json({ message : "user not found"})
      }

      const userOrders = await db.select().from(orders).where(eq(orders.userId , id)).limit(1);
      const userTickets =  await db.select().from(tickets).where(eq(tickets.userId , id)).limit(1);
      
      if(userOrders.length > 0 || userTickets.length > 0){
        return res.status(400).json({ message : "cannot delete user with existing orders or tickets"})
      }

      await db.delete(transactions).where(eq(transactions.userId, id));

      await db.delete(users).where(eq(users.id , id))
      res.status(200).json({ message : "user deleted successfully"})
  } catch (error) {
      console.error("Error deleting user:" , error);
      res.status(500).json({ message : "failed to delete user"})
  }
});

// Deactivate user
app.delete("/api/admin/users/deactivate/:id" ,isAuthenticated, isAdmin, async (req:any , res)=>{
  try {
    const { id} = req.params;
    const userId = req.user.id;

    if(id === userId){
      return res.status(400).json({ message : "admin cannnot deactivate own account"})
    }

    const user = await storage.getUser(id);

    if(!user){
      return res.status(404).json({ message : "user not found"})
    }

     await storage.updateUser(id, { 
      isActive: false, 
      email: `deleted_${Date.now()}_${user.email}` // Prevent email reuse
    });

    res.status(200).json({ message: "User deactivated successfully" });

  } catch (error) {
     console.error("Error deactivating user:", error);
    res.status(500).json({ message: "Failed to deactivate user" });
  }
})

// Manage users
app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const allUsers = await db.select()
      .from(users)
      .orderBy(desc(users.createdAt));
    
    res.json(allUsers.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      balance: user.balance,
      ringtonePoints: user.ringtonePoints,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    })));
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Update user
app.put("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      balance: updatedUser.balance,
      ringtonePoints: updatedUser.ringtonePoints,
      isAdmin: updatedUser.isAdmin,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// Get all orders
app.get("/api/admin/orders", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const allOrders = await db
      .select()
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(competitions, eq(orders.competitionId, competitions.id))
      .orderBy(desc(orders.createdAt));
    
    res.json(allOrders.map(order => ({
      id: order.orders.id,
      user: {
        id: order.users?.id,
        firstName: order.users?.firstName,
        lastName: order.users?.lastName,
        email: order.users?.email,
      },
      competition: order.competitions?.title,
      quantity: order.orders.quantity,
      totalAmount: order.orders.totalAmount,
      paymentMethod: order.orders.paymentMethod,
      status: order.orders.status,
      createdAt: order.orders.createdAt,
    })));
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Get system analytics
app.get("/api/admin/analytics", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    // Daily revenue for last 7 days
    const revenueByDay = await db
      .select({
        date: sql<string>`date(${orders.createdAt})`,
        revenue: sql<number>`coalesce(sum(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.status, "completed"),
          sql`${orders.createdAt} >= now() - interval '7 days'`
        )
      )
      .groupBy(sql`date(${orders.createdAt})`)
      .orderBy(sql`date(${orders.createdAt})`);

    // Competition performance
    const competitionPerformance = await db
      .select({
        competitionId: competitions.id,
        title: competitions.title,
        ticketPrice: competitions.ticketPrice,
        soldTickets: competitions.soldTickets,
        maxTickets: competitions.maxTickets,
        revenue: sql<number>`coalesce(sum(${orders.totalAmount}), 0)`,
      })
      .from(competitions)
      .leftJoin(orders, eq(competitions.id, orders.competitionId))
      .groupBy(competitions.id, competitions.title, competitions.ticketPrice, competitions.soldTickets, competitions.maxTickets)
      .orderBy(sql`coalesce(sum(${orders.totalAmount}), 0) DESC`);

    res.json({
      revenueByDay,
      competitionPerformance,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

const httpServer = createServer(app);
return httpServer;
}
