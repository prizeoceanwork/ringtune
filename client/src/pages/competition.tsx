import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Testimonials from "@/components/testimonials";
import { Competition, User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function CompetitionPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth() as {
    isAuthenticated: boolean;
    user: User | null;
  };
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);

  const { data: competition, isLoading } = useQuery<Competition>({
    queryKey: ["/api/competitions", id],
    enabled: !!id,
  });

  const { data: userTickets = [] } = useQuery<any[]>({
    queryKey: ["/api/user/tickets"],
    enabled: isAuthenticated,
  });

  // Filter tickets for this competition
  const availableTickets = userTickets.filter(
    (ticket: any) => ticket.competitionId === id
  );

  const purchaseTicketMutation = useMutation({
    mutationFn: async (data: { competitionId: string; quantity: number }) => {
      const response = await apiRequest("POST", "/api/purchase-ticket", data);
      console.log("Purchase response:", data);
      return response.json();
    },
    onSuccess: (data) => {
  if (data.paymentMethod === "wallet") {
   console.log("Wallet payment successful");
   console.log(data);
    toast({
      title: "Success",
      description: "Your ticket(s) have been purchased using your wallet!",
    });
    // ✅ Refresh user, tickets, and transactions data
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    queryClient.invalidateQueries({ queryKey: ["/api/user/tickets"] });
    queryClient.invalidateQueries({ queryKey: ["/api/user/transactions"] });
    queryClient.invalidateQueries({ queryKey: ["/api/competitions", id] });
    
  } else {
    // 💳 Stripe payment required
    setLocation(`/checkout/${data.orderId}?client_secret=${data.clientSecret}&quantity=${quantity}`);
  }
},

    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Login Required",
          description: "Please login to purchase tickets",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to purchase ticket",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }

    if (!competition) return;

    purchaseTicketMutation.mutate({
      competitionId: competition.id,
      quantity,
    });
  };

  const totalPrice = competition
    ? parseFloat(competition.ticketPrice) * quantity
    : 0;
  const progressPercentage = competition?.maxTickets
    ? (competition.soldTickets! / competition.maxTickets) * 100
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div
          className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Competition Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The competition you're looking for doesn't exist.
          </p>
          <button
            onClick={() => setLocation("/")}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Competitions
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Competition Details */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left: Competition Image and Details */}
              <div className="space-y-6">
                <img
                  src={
                    competition.imageUrl ||
                    "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                  }
                  alt={competition.title}
                  className="w-full h-96 object-cover rounded-xl"
                  data-testid={`img-competition-${competition.id}`}
                />

                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-xl font-bold mb-4">
                    Competition Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="capitalize font-medium">
                        {competition.type === "spin"
                          ? "Spin Wheel"
                          : competition.type === "scratch"
                          ? "Scratch Card"
                          : "Instant Win"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Price per Entry
                      </span>
                      <span className="font-bold text-primary">
                        £{parseFloat(competition.ticketPrice).toFixed(2)}
                      </span>
                    </div>
                    {competition.maxTickets && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span>
                            {competition.soldTickets} / {competition.maxTickets}{" "}
                            sold
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trustpilot Reviews */}
                <div className="bg-primary/10 rounded-xl p-6 border border-primary/20">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex text-primary">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="fas fa-star"></i>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Trustpilot
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Rated 4.7 • Based on 2,099 reviews
                  </p>
                </div>
              </div>

              {/* Right: Purchase Form */}
              <div className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-8">
                  <h1
                    className="text-3xl font-bold mb-4"
                    data-testid={`heading-${competition.id}`}
                  >
                    {competition.title}
                  </h1>

                  {competition.description && (
                    <p className="text-muted-foreground mb-6">
                      {competition.description}
                    </p>
                  )}

                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-2xl font-bold">
                      <span>
                        £{parseFloat(competition.ticketPrice).toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground font-normal">
                        per entry
                      </span>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-medium">
                        Choose how many tickets you would like to purchase:
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={quantity}
                            onChange={(e) =>
                              setQuantity(Number(e.target.value))
                            }
                            className="slider-thumb"
                            data-testid="slider-quantity"
                             style={{
                              background: `linear-gradient(to right, #facc15 ${
                                ((quantity - 1) * 100) / (20 - 1)
                              }%, #e5e7eb ${((quantity - 1) * 100) / (20 - 1)}%)`,
                            }}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>1</span>
                            <span>20</span>
                          </div>
                        </div>
                        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold min-w-[60px] text-center">
                          {quantity}
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total</span>
                        <span className="text-2xl font-bold text-primary">
                          £{totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        FREE DIGITAL ENTRY SLIPS
                      </p>
                      <p className="text-xs text-muted-foreground">
                        For every entry slot purchased, you will be allocated a
                        ticket number that will be entered into the live draw.
                      </p>
                    </div>

                    {availableTickets.length > 0 ? (
                      <div className="space-y-4">
                        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 text-center">
                          <p className="text-green-400 font-medium">
                            ✅ You have {availableTickets.length} ticket
                            {availableTickets.length > 1 ? "s" : ""} for this competition!
                          </p>
                        </div>

                        {competition.type === "instant" ? (
                          // 🟢 Instant prize: no play button, just buy more
                          <button
                            onClick={handlePurchase}
                            disabled={purchaseTicketMutation.isPending}
                            className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {purchaseTicketMutation.isPending ? "Processing..." : "BUY MORE"}
                          </button>
                        ) : (
                          // 🌀 Spin / Scratch competitions
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              onClick={() => setLocation(`/play/${competition.id}`)}
                              className="bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors"
                              data-testid="button-play-now"
                            >
                              PLAY NOW
                            </button>
                            <button
                              onClick={handlePurchase}
                              disabled={purchaseTicketMutation.isPending}
                              className="bg-primary text-primary-foreground py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                              data-testid="button-purchase-more"
                            >
                              {purchaseTicketMutation.isPending ? "Processing..." : "BUY MORE"}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={handlePurchase}
                        disabled={purchaseTicketMutation.isPending}
                        className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        data-testid="button-purchase"
                      >
                        {purchaseTicketMutation.isPending
                          ? "Processing..."
                          : "ADD COMPETITION ENTRY"}
                      </button>
                    )}
                  </div>
                </div>

                {/* User Balance (if authenticated) */}
                {isAuthenticated && user && (
                  <div className="bg-card rounded-xl border border-border p-6 text-center">
                    <h3 className="font-bold mb-2">Your Wallet Balance</h3>
                    <p className="text-2xl font-bold text-primary">
                      £{parseFloat(user.balance || "0").toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            View all competitions
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            This is your chance to win luxury items for a fraction of the cost
            here at RingToneRiches!
          </p>
          <button
            onClick={() => setLocation("/")}
            className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            VIEW ALL
          </button>
        </div>
      </section>

      <Testimonials />
      <Footer />
    </div>
  );
}
