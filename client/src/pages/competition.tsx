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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import CountdownTimer from "./countdownTimer";
import { Minus, Plus } from "lucide-react";

export default function CompetitionPage() {
  const rangeRef = useRef<HTMLDivElement | null>(null);
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth() as {
    isAuthenticated: boolean;
    user: User | null;
  };
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [isPostalModalOpen, setIsPostalModalOpen] = useState(false);
  
  const quizQuestion = {
    question:
      "You wake up at 7:00am and take 30 minutes to get ready. What time are you ready?",
    options: ["7:15am", "7:25am", "7:30am", "7:45am"],
    correct: "7:30am",
  };

  const handleOpenQuiz = () => {
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setShowQuiz(true);
  };

  const { data: competition, isLoading } = useQuery<Competition>({
    queryKey: ["/api/competitions", id],
    enabled: !!id,
  });

  const { data: userTickets = [] } = useQuery<any[]>({
    queryKey: ["/api/user/tickets"],
    enabled: isAuthenticated,
  });

  const isSoldOut =
    competition?.maxTickets && competition.maxTickets > 0
      ? (competition.soldTickets ?? 0) >= competition.maxTickets
      : false;

  // Filter tickets for this competition
  const availableTickets = userTickets.filter(
    (ticket: any) => ticket.competitionId === id
  );


    const isFreeGiveaway = competition?.title === "💷 £500 FREE GIVEAWAY! 🎉";
    const userTicketCount = availableTickets.length;
    const maxTicketsForGiveaway = 2;
    const canBuyMore = isFreeGiveaway ? userTicketCount < maxTicketsForGiveaway : true;
    const remainingTickets = maxTicketsForGiveaway - userTicketCount;

const purchaseTicketMutation = useMutation({
  mutationFn: async (data: { competitionId: string; quantity: number }) => {
    const competitionType = competition?.type?.toLowerCase();

    if (competitionType === "spin") {
      // 🌀 Create Spin Wheel order
      const response = await apiRequest("POST", "/api/create-spin-order", data);
      return response.json();
    } 
    else if (competitionType === "scratch") {
      // 🎯 Create Scratch Card order
      const response = await apiRequest("POST", "/api/create-scratch-order", data);
      return response.json();
    } 
    else {
      // 🎟️ Regular competition
      const response = await apiRequest("POST", "/api/purchase-ticket", data);
      return response.json();
    }
  },

  onSuccess: (data) => {
    const competitionType = competition?.type?.toLowerCase();

    if (competitionType === "spin") {
      // ✅ Redirect to spin billing
      setLocation(`/spin-billing/${data.orderId}`);
      return;
    }

    if (competitionType === "scratch") {
      // ✅ Redirect to scratch billing
      setLocation(`/scratch-billing/${data.orderId}`);
      return;
    }

    // 🎟️ Regular purchase flow
    if (data.paymentMethod === "wallet") {
      toast({
        title: "Success",
        description: "Your ticket(s) have been purchased using your wallet!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/competitions", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/competitions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/orders"] });
    } else {
      setLocation(
        `/checkout/${data.orderId}?client_secret=${data.clientSecret}&quantity=${quantity}`
      );
    }
  },

  onError: (error) => {
    if (isUnauthorizedError(error)) {
      toast({
        title: "Login Required",
        description: "Please login to continue.",
        variant: "destructive",
      });
      setTimeout(() => (window.location.href = "/login"), 1000);
      return;
    }
    toast({
      title: "Error",
      description: error.message || "Failed to process purchase",
      variant: "destructive",
    });
  },
});



 const handlePurchase = () => {
  if (!isAuthenticated) {
    window.location.href = "/login";
    return;
  }

  if (!competition) return;

  // 🎯 Special validation for £500 FREE GIVEAWAY
  if (isFreeGiveaway) {
    if (userTicketCount >= maxTicketsForGiveaway) {
      toast({
        title: "Limit Reached",
        description: `You already have ${userTicketCount} tickets. Maximum ${maxTicketsForGiveaway} tickets allowed.`,
        variant: "destructive",
      });
      return;
    }
    
    if (quantity > remainingTickets) {
      toast({
        title: "Limit Exceeded",
        description: `You can only buy ${remainingTickets} more ticket${remainingTickets > 1 ? 's' : ''} (maximum ${maxTicketsForGiveaway} total)`,
        variant: "destructive",
      });
      return;
    }
  }

  // 🧠 Rest of your existing validation logic...
  const type = competition.type?.toLowerCase();

  // ✅ Only check ticket limits for INSTANT competitions
  if (type === "instant") {
    const competitionRemainingTickets =
      (competition.maxTickets ?? 0) - (competition.soldTickets ?? 0);

    if (competitionRemainingTickets <= 0) {
      toast({
        title: "Sold Out",
        description: "All tickets for this competition are sold out.",
        variant: "destructive",
      });
      return;
    }

    if (quantity > competitionRemainingTickets) {
      toast({
        title: "Too Many Tickets",
        description: `Only ${competitionRemainingTickets} ticket${
          competitionRemainingTickets > 1 ? "s" : ""
        } remaining. Please reduce your quantity.`,
        variant: "destructive",
      });
      return;
    }
  }

  // 🟢 Proceed with purchase
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

  const handleSubmitAnswer = () => {
    if (selectedAnswer === quizQuestion.correct) {
      setIsAnswerCorrect(true);
      setShowQuiz(false);
      handlePurchase(); // ✅ proceed with purchase if correct
    } else {
      setIsAnswerCorrect(false);
      toast({
        title: "Wrong Answer ❌",
        description: "That’s not correct! Try again next time.",
        variant: "destructive",
      });
      setShowQuiz(false);
    }
  };

  const scrollToRange = () => {
    rangeRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
                  className="w-full h-98 object-cover rounded-xl"
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
                          : "Competition"}
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
              </div>

              {/* Right: Purchase Form */}
              <div className="space-y-6">
                <div className="bg-card  rounded-xl border border-border p-8">
                 {competition.type === "instant" && (

                  <CountdownTimer
                     days={60}
        
                  />
                 )}
                  <h1
                    className="text-3xl mt-3 font-bold mb-4"
                    data-testid={`heading-${competition.id}`}
                  >
                    {competition.title}
                  </h1>

                  {competition.description?.trim() ? (
                    <div className="text-muted-foreground mb-6 overflow-y-scroll max-h-96 whitespace-pre-line leading-relaxed space-y-2">
                      {competition.description}
                    </div>
                  ) : null}

                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-2xl font-bold">
                      <span>
                        £{parseFloat(competition.ticketPrice).toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground font-normal">
                        per entry
                      </span>
                    </div>

                    {/* <div className="space-y-4">
                      <label className="text-sm font-medium">
                        Choose how many tickets you would like to purchase:
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <input
                            type="range"
                            min="1"
                            max="1000"
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
                            <span>1000</span>
                          </div>
                        </div>
                        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold min-w-[60px] text-center">
                          {quantity}
                        </div>
                      </div>
                    </div> */}

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

                    {availableTickets.length > 0 && competition.type == 'instant' ?  (
                  <div className="space-y-4">
                    <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 text-center">
                      <p className="text-green-400 font-medium">
                        ✅ You have {availableTickets.length} Tickets{" "}
            
                       
                      </p>
                    </div>

                    <button
                      onClick={scrollToRange}
                      disabled={isSoldOut || purchaseTicketMutation.isPending}
                      className={`w-full py-4 rounded-lg font-bold text-lg transition-opacity ${
                        isSoldOut
                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                          : "bg-primary text-primary-foreground hover:opacity-90"
                      }`}
                      data-testid="button-purchase"
                    >
                      {isSoldOut
                        ? "SOLD OUT"
                        : purchaseTicketMutation.isPending
                        ? "Processing..."
                        : competition.type === "instant"
                        ? "ADD COMPETITION ENTRY"
                        : "BUY MORE"}
                    </button>
                  </div>
                ) : (
                  <button
                    // only two possible behaviors
                   onClick={scrollToRange}
                    disabled={isSoldOut || purchaseTicketMutation.isPending}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-opacity ${
                      isSoldOut
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    }`}
                    data-testid="button-purchase"
                  >
                    {isSoldOut
                      ? "SOLD OUT"
                      : purchaseTicketMutation.isPending
                      ? "Processing..."
                      : competition.type === "instant"
                      ? "ADD COMPETITION ENTRY"
                      : "BUY NOW"}
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


      {/* 🎯 Range & Purchase Section */}
<section ref={rangeRef} className="py-16 bg-muted">
  <div className="container mx-auto px-4 text-center max-w-2xl">
    <h2 className="text-2xl font-bold mb-6">Select Your Entries</h2>

    {/* Quantity Range */}
    <div className="space-y-4 mb-8">
      <label className="text-sm font-medium mb-2 block">
        How many{" "}
        {competition.type === "spin"
          ? "Spins"
          : competition.type === "scratch"
          ? "Scratches"
          : "Tickets"}{" "}
        do you want to buy?
      </label>

      {/* Special case for £500 FREE GIVEAWAY */}
      {isFreeGiveaway ? (
        <div className="space-y-4">
          {userTicketCount >= maxTicketsForGiveaway ? (
            <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4">
              <p className="text-yellow-800 font-semibold">
                ✅ You already have {userTicketCount} tickets for this competition
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                Maximum {maxTicketsForGiveaway} tickets per user
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-center gap-4">
                {[1, 2].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuantity(Math.min(num, remainingTickets))}
                    disabled={num > remainingTickets}
                    className={`px-6 py-3 rounded-lg border-2 font-bold transition-all ${
                      quantity === num
                        ? "bg-primary text-primary-foreground border-primary"
                        : num > remainingTickets
                        ? "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
                        : "bg-background border-border hover:bg-muted"
                    }`}
                  >
                    {num} {competition.type === "spin" ? "Spin" : competition.type === "scratch" ? "Scratch" : "Ticket"}
                    {num > 1 ? "s" : ""}
                  </button>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                {remainingTickets === 1 
                  ? "You can buy 1 more ticket (maximum 2 total)"
                  : `You can buy up to ${remainingTickets} tickets (maximum 2 total)`
                }
              </div>
            </>
          )}
        </div>
      ) : (
        // Original range slider for other competitions
        <>
          <input
            type="range"
            min="1"
            max="1000"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="slider-thumb w-full appearance-none cursor-pointer"
            data-testid="slider-quantity"
            style={{
              height: "12px",
              borderRadius: "8px",
              background: `linear-gradient(to right, #facc15 ${
                ((quantity - 1) * 100) / (1000 - 1)
              }%, #e5e7eb ${((quantity - 1) * 100) / (1000 - 1)}%)`,
            }}
          />
          <div className="text-lg font-semibold">
            {quantity} {competition.type === "spin" ? "Spin" : competition.type === "scratch" ? "Scratch" : "Ticket"}
            {quantity > 1 ? "s" : ""}
          </div>
        </>
      )}
      
      <div className="text-sm text-muted-foreground">
        Total: £{(parseFloat(competition.ticketPrice) * quantity).toFixed(2)}
      </div>
    </div>
      <div className="flex justify-center mb-3 gap-5">
       <button
        onClick={() => setQuantity((prev) => Math.min(prev + 1, 1000))}
        disabled={quantity >= 1000}
        className={`px-4 py-2 rounded-md font-semibold transition ${
          quantity >= 1000
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-primary text-white hover:opacity-90"
        }`}
      >
         <Plus />
      </button>

      <button
        onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
        disabled={quantity <= 1}
        className={`px-4 py-2 rounded-md font-semibold transition ${
          quantity <= 1
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-red-500 text-white hover:opacity-90"
        }`}
      >
        <Minus />
      </button>

      </div>
    {/* Dynamic Buy Button */}
    <div className="w-full flex justify-center">
      <button
        onClick={handleOpenQuiz}
        disabled={isSoldOut || purchaseTicketMutation.isPending || (isFreeGiveaway && !canBuyMore)}
        className="bg-primary w-fit text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSoldOut
          ? "SOLD OUT"
          : purchaseTicketMutation.isPending
          ? "Processing..."
          : isFreeGiveaway && !canBuyMore
          ? "MAX TICKETS REACHED"
          : competition.type === "spin"
          ? "BUY SPIN"
          : competition.type === "scratch"
          ? "BUY SCRATCH"
          : "ENTER NOW"}
      </button>
    </div>
    
    <div className="mt-5 text-sm text-muted-foreground underline cursor-pointer hover:text-primary"
      onClick={() => setIsPostalModalOpen(true)}>
      Free postal entry route
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
      <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
        <DialogContent className="w-[90vw] max-w-sm sm:max-w-md mx-auto flex flex-col justify-center items-center text-center rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Answer to Proceed
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center font-medium">{quizQuestion.question}</p>
            <div className="grid grid-cols-1 gap-2">
              {quizQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => setSelectedAnswer(option)}
                  className={`w-full p-3 rounded-lg border ${
                    selectedAnswer === option
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter className="flex justify-center">
            <Button
              disabled={!selectedAnswer}
              onClick={handleSubmitAnswer}
              className="mt-4"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
              {/* 🔸 Modal */}
      <Dialog open={isPostalModalOpen} onOpenChange={setIsPostalModalOpen}>
        <DialogContent className="max-w-lg text-left">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Postal Entry Route
            </DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div className="space-y-4 text-sm leading-relaxed text-foreground">
              <p>
                Send an unclosed postcard (standard postcard size is approx 148mm x 105mm)
                first or second class to:
              </p>
              <p className="font-semibold">
                1 West Havelock Street, South Shields, Tyne and Wear, NE33 5AF.
              </p>
              <p>Include the following information:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>The competition you wish to enter</li>
                <li>Your full name and postal address</li>
                <li>Your phone number and email address on your RingTone Riches account</li>
                <li>Your date of birth</li>
                <li>Your answer to the competition question</li>
                <li>Incomplete or illegible entries will be disqualified</li>
                <li>Maximum one entry per household</li>
              </ul>

              <p>
                Your entry will be subject to our{" "}
                <span className="text-primary underline cursor-pointer">terms and conditions</span>.
              </p>

              <p className="mt-4 font-semibold">
               You wake up at 7:00am and take 30 minutes to get ready. What time are you ready?
              </p>
              <p>
               A: 7:15am B: 7:20am C: 7:30am D: 7:45am
              </p>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
      {/* <Testimonials /> */}
      <Footer />
    </div>
  );
}
