import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ScratchCardTest from "@/components/games/scratch-card-test";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function ScratchCardPage() {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  const { data: competitions = [] } = useQuery({
    queryKey: ["/api/competitions"],
  });

  const { data: userTickets = [] } = useQuery({
    queryKey: ["/api/user/tickets"],
    enabled: !!isAuthenticated,
  });

  const scratchCompetition = competitions.find((c: any) => c.type === "scratch");
  const scratchTickets = userTickets.filter(
    (t: any) => t.competitionId === scratchCompetition?.id
  );
  const scratchTicketCount = scratchTickets.length;

  const [gameResult, setGameResult] = useState<any>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

    const [filteredCompetitions, setFilteredCompetitions] = useState<Competition[]>([]);
      const [activeFilter, setActiveFilter] = useState("all");
    const [, setLocation] = useLocation();
    
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
  
    if (filterType === "all") {
      setFilteredCompetitions(competitions);
      setLocation("/"); // stay home instantly
    } else if (filterType === "spin") {
      setLocation("/spin-wheel");
    } else if (filterType === "scratch") {
      setLocation("/scratch-card");
    } else if (filterType === "instant") {
      setLocation("/instant");
    } else {
      setFilteredCompetitions(competitions.filter((c) => c.type === filterType));
    }
  };

  const playScratchCardMutation = useMutation({
    mutationFn: async (data: { winnerPrize: any }) => {
      const response = await apiRequest("POST", "/api/play-scratch-card", data);
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
        description: error.message || "Failed to play scratch card",
        variant: "destructive",
      });
    },
  });

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

      <section className="container mx-auto px-4 py-16 text-center">

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

            queryClient.setQueryData(["/api/auth/user"], {
              ...user,
              balance: Number(user.balance ?? 0) - 2,
            });

            playScratchCardMutation.mutate({ winnerPrize });
          }}
          scratchTicketCount={scratchTicketCount}
        />
      </section>

      <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
        <DialogContent className="max-w-md flex flex-col justify-center items-center text-center">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">
              {gameResult?.prize?.amount > 0 ? "🎉 You Won!" : "😔 Better Luck Next Time"}
            </DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setIsResultModalOpen(false)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
