import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CompetitionCard from "@/components/competition-card";
import Testimonials from "@/components/testimonials";
import { Competition, User } from "@shared/schema";
import SpinWheel from "@/components/games/spinwheeltest";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ScratchCardTest from "@/components/games/scratch-card-test";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth() as { isAuthenticated: boolean; user: User | null };
  const queryClient = useQueryClient();

  const { data: competitions = [], isLoading } = useQuery<Competition[]>({
    queryKey: ["/api/competitions"],
  });

  const { data: userTickets = [] } = useQuery({
  queryKey: ["/api/user/tickets"],
  enabled: !!isAuthenticated, // only fetch if logged in
});

const spinCompetition = competitions.find((c) => c.type === "spin");
const scratchCompetition = competitions.find((c) => c.type === "scratch");


const spinTickets = userTickets.filter(
  (t: any) => t.competitionId === spinCompetition?.id
);
const scratchTickets = userTickets.filter(
  (t: any) => t.competitionId === scratchCompetition?.id
);

const spinTicketCount = spinTickets.length;
const scratchTicketCount = scratchTickets.length;
  const [filteredCompetitions, setFilteredCompetitions] = useState<Competition[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isSpinning, setIsSpinning] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  useEffect(() => {
  if (!isAuthenticated) {
    // Hide instant competitions for guests
    setFilteredCompetitions(
      competitions.filter((c) => c.type !== "instant")
    );
  } else {
    setFilteredCompetitions(competitions);
  }
}, [competitions, isAuthenticated]);


  const handleFilterChange = (filterType: string) => {
    setActiveFilter(filterType);
    if (filterType === "all")  setFilteredCompetitions(competitions);
    else setFilteredCompetitions(competitions.filter((c) => c.type === filterType));
  };

  // --- 🌀 Spin Wheel Mutation ---
  const playSpinWheelMutation = useMutation({
    mutationFn: async (data: { winnerPrize: any }) => {
      const response = await apiRequest("POST", "/api/play-spin-wheel", data);
      return response.json();
    },
    onSuccess: (result) => {
      setGameResult(result);
      setIsResultModalOpen(true);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to play game",
        variant: "destructive",
      });
    },
  });

  // --- 🧩 Scratch Card Mutation ---
const playScratchCardMutation = useMutation({
  mutationFn: async (data: { winnerPrize: any }) => {
    const response = await apiRequest("POST", "/api/play-scratch-card", data);
    return response.json();
  },
  onSuccess: (result) => {
    setGameResult(result);
    setIsResultModalOpen(true);
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] }); // refresh balance
  },
  onError: (error: any) => {
    toast({
      title: "Error",
      description: error.message || "Failed to play scratch card",
      variant: "destructive",
    });
  },
});


  // --- 🧠 Handle Spin Complete ---
  const handleSpinComplete = (winnerSegment: number, winnerLabel: string, winnerPrize: any) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Login Required",
        description: "Please login to play the spin wheel.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(user.balance || "0") < 2) {
      toast({
        title: "Insufficient Balance",
        description: "You need at least €2 in your wallet to spin.",
        variant: "destructive",
      });
      return;
    }

    // Deduct €2 immediately (frontend optimistic update)
    queryClient.setQueryData(["/api/auth/user"], {
      ...user,
      balance: Number(user.balance ?? 0) - 2,
    });

    // Call backend mutation
    playSpinWheelMutation.mutate({ winnerPrize });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Welcome Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold">
              <span className="gradient-text">Welcome Back!</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Ready to win big? Spin the wheel and test your luck!
            </p>
          </div>
        </div>
      </section>

      {/* Competition Filters */}
      <section className="bg-card border-y border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center gap-4">
            {["all", "spin", "scratch", "instant"].map((type) => (
              <button
                key={type}
                onClick={() => handleFilterChange(type)}
                className={`competition-filter px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeFilter === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted gradient hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                {type === "all"
                  ? "ALL COMPETITIONS"
                  : type === "spin"
                  ? "SPIN WHEEL"
                  : type === "scratch"
                  ? "SCRATCH CARDS"
                  : "INSTANT WIN"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {activeFilter === "spin" ? (
            <div className="w-full">
              <SpinWheel
                onSpinComplete={handleSpinComplete}
                isSpinning={isSpinning}
                setIsSpinning={setIsSpinning}
                ticketCount={spinTicketCount} 
              />
            </div>
          ) 
          :activeFilter === "scratch" ? (
  <ScratchCardTest
    onScratchComplete={(winnerPrize: any) => {
       if (playScratchCardMutation.isPending) return;
      if (!isAuthenticated || !user) {
        toast({
          title: "Login Required",
          description: "Please login to play scratch card.",
          variant: "destructive",
        });
        return;
      }

      if (parseFloat(user.balance || "0") < 2) {
        toast({
          title: "Insufficient Balance",
          description: "You need at least €2 in your wallet to play.",
          variant: "destructive",
        });
        return;
      }

      // ✅ Optimistic balance deduction
      queryClient.setQueryData(["/api/auth/user"], {
        ...user,
        balance: Number(user.balance ?? 0) - 2,
      });

      // ✅ Call backend to handle actual prize + deduction
      playScratchCardMutation.mutate({ winnerPrize });
    }}
    scratchTicketCount={scratchTicketCount}
  />
) :
  activeFilter === "instant" ? (
    <div className="text-center text-xl text-muted-foreground">
      Instant Win games coming soon! Stay tuned.
    </div>
  ) :
isLoading ? (
            <p className="text-center text-muted-foreground">Loading competitions...</p>
          ) :  (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCompetitions.map((competition) => (
                  <CompetitionCard
                    key={competition.id}
                    competition={competition}
                    authenticated={true}
                  />
                ))}
              </div>

              <div className="text-center mt-12">
                <button className="bg-muted text-muted-foreground px-8 py-4 rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
                  LOAD MORE COMPETITIONS
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Result Modal */}
     <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
  <DialogContent className="max-w-md flex flex-col justify-center items-center text-center">
    <DialogHeader>
      <DialogTitle className="text-3xl font-bold">
        {(() => {
          const prize = gameResult?.prize || gameResult?.winnerPrize || gameResult;
          if (!prize) return "😔 Better Luck Next Time";

          // For Spin Wheel “Nice Try”
          if (
            prize.label === "Nice Try" ||
            prize.amount === 0 ||
            prize.type === "none"
          )
            return "😔 Better Luck Next Time";

          return "🎉 You Won!";
        })()}
      </DialogTitle>
    </DialogHeader>

    {(() => {
      const prize = gameResult?.prize || gameResult?.winnerPrize || gameResult;
      if (!prize) return null;

      // handle spin or scratch result content
      return (
        <div className="mt-4 space-y-2">
          <p className="text-xl">
            {prize.amount
              ? // 🎡 Spin wheel results
                typeof prize.amount === "number"
                ? `You won €${prize.amount.toFixed(2)}`
                : `You won ${prize.amount}`
              : // 🎯 Scratch card results
              prize.type === "cash"
              ? `You won €${prize.value}`
              : prize.type === "points"
              ? `You won ${prize.value} Ringtones`
              : "No prize this time!"}
          </p>

          {/* Extra note for wallet top-up */}
          {(prize.type === "cash" ||
            (typeof prize.amount === "number" && prize.amount > 0)) && (
            <p className="text-green-600">💸 Prize added to your wallet!</p>
          )}
        </div>
      );
    })()}

    <DialogFooter className="mt-6">
      <button
        onClick={() => setIsResultModalOpen(false)}
        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
      >
        Close
      </button>
    </DialogFooter>
  </DialogContent>
</Dialog>



      {/* <Testimonials /> */}
      <Footer />
    </div>
  );
}
