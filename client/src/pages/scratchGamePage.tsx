import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearch } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ScratchCardTest from "@/components/games/scratch-card-test";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";

export default function ScratchGamePage() {
  const { competitionId, orderId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [gameResult, setGameResult] = useState<any>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [remainingScratches, setRemainingScratches] = useState<number>(0);

  // Fetch competition data
  const { data: competition } = useQuery({
    queryKey: ["/api/competitions", competitionId],
  });

  // Fetch order data with real-time updates
  const { data: orderData, isLoading } = useQuery({
    queryKey: ["/api/scratch-order", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/scratch-order/${orderId}`);
      const data = await res.json();
      console.log("✅ Scratch order data:", data);
      return data;
    },
  });

  // Update remaining scratches when order data changes
  useEffect(() => {
    if (orderData?.order) {
      const remaining = orderData.order.remainingPlays ?? orderData.order.quantity;
      setRemainingScratches(remaining);
    }
  }, [orderData]);

  // Play scratch card mutation
  const playScratchCardMutation = useMutation({
    mutationFn: async (data: { winnerPrize: any }) => {
      const response = await apiRequest("POST", "/api/play-scratch-carddd", {
        ...data,
        competitionId,
        orderId,
      });
      return response.json();
    },
    onSuccess: (result) => {
      setGameResult(result);
      setIsResultModalOpen(true);
      
      // Update remaining scratches immediately
      setRemainingScratches(result.remainingCards);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scratch-order", orderId] });
      
      // Show success message
      if (result.prize && result.prize.type !== "none") {
        toast({
          title: "🎉 Congratulations!",
          description: `You won ${result.prize.type === 'cash' ? '£' : ''}${result.prize.value}${result.prize.type === 'points' ? ' points' : ''}!`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process scratch card. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleScratchComplete = (winnerPrize: any) => {
    if (playScratchCardMutation.isPending) return;

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to play scratch card.",
        variant: "destructive",
      });
      return;
    }

    // Check if user has remaining scratches
    if (remainingScratches <= 0) {
      toast({
        title: "No Scratches Left",
        description: "You have used all your scratch cards for this purchase.",
        variant: "destructive",
      });
      return;
    }

    playScratchCardMutation.mutate({ winnerPrize });
  };

  const handleCloseResultModal = () => {
    setIsResultModalOpen(false);
    
    // If no scratches left, redirect to purchases page
    if (remainingScratches <= 0) {
      toast({
        title: "All Scratch Cards Used",
        description: "You've used all your scratch cards from this purchase.",
      });
      setTimeout(() => {
        window.location.href = "/"; // Or your purchases page
         localStorage.removeItem('scratchCardHistory');
      }, 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Loading your scratch cards...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!orderData?.order) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-8">Scratch Card Not Found</h1>
          <p className="text-lg mb-4">The scratch card purchase could not be found or has expired.</p>
          <Button onClick={() => window.location.href = "/competitions"}>
            Browse Competitions
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="container mx-auto px-4 py-8 text-center">
        {/* <h1 className="text-4xl font-bold mb-4">
          🎟️ {competition?.title || "Scratch & Win!"}
        </h1> */}
        
        {/* Remaining Scratches Counter */}
        {/* <div className="mb-8 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg inline-block">
          <div className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
            <span className="text-2xl">{remainingScratches}</span> Scratch{remainingScratches !== 1 ? "es" : ""} Remaining
          </div>
          <div className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
            Order: #{orderId?.slice(-8)}
          </div>
        </div> */}

        {/* Scratch Card Component */}
        <ScratchCardTest
          onScratchComplete={handleScratchComplete}
          scratchTicketCount={remainingScratches}
          mode="loose" // or "tight" based on your preference
        />

      
      </section>
    
      {/* Result Modal */}
      <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen} >
      <DialogContent
  className="w-[90vw] max-w-sm sm:max-w-md mx-auto flex flex-col justify-center items-center text-center rounded-2xl"
>

          <DialogHeader>
            <DialogTitle className="text-3xl font-bold mb-4">
              {gameResult?.prize?.type !== "none" && gameResult?.prize?.value !== "Lose"
                ? "🎉 You Won!"
                : "😔 Better Luck Next Time"}
            </DialogTitle>
          </DialogHeader>
          
          {gameResult?.prize?.type !== "none" && gameResult?.prize?.value !== "Lose" ? (
            <div className="my-4">
              <p className="text-2xl font-bold text-green-600">
                {gameResult?.prize?.type === 'cash' ? '£' : ''}
                {gameResult?.prize?.value}
                {gameResult?.prize?.type === 'points' ? ' Points' : ''}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Prize has been added to your {gameResult?.prize?.type === 'cash' ? 'wallet' : 'points balance'}!
              </p>
            </div>
          ) : (
            <p className="text-lg text-gray-600 my-4">Keep trying! You still have {remainingScratches} scratch{remainingScratches !== 1 ? 'es' : ''} left.</p>
          )}

          <div className="text-sm text-gray-500 mt-4">
            Remaining: {remainingScratches} scratch{remainingScratches !== 1 ? 'es' : ''}
          </div>

          <DialogFooter className="mt-6">
            <Button onClick={handleCloseResultModal}>
              {remainingScratches > 0 ? "Continue Scratching" : "Go Home"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}