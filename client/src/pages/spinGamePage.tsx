import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearch } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import SpinWheel from "@/components/games/spinwheeltest";


export default function SpinGamePage() {
 const { competitionId, orderId } = useParams();

  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [gameResult, setGameResult] = useState<any>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [remainingSpins, setRemainingSpins] = useState<number>(0);

  // Fetch order data
  const { data: orderData, isLoading } = useQuery({
    queryKey: ["/api/spin-order", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/spin-order/${orderId}`);
      const data = await res.json();
      console.log("✅ Spin order data:", data);
      return data;
    },
  });

   const { data: competition } = useQuery({
      queryKey: ["/api/competitions", competitionId],
    });
  // Update remaining spins count
  useEffect(() => {
    if (orderData?.order) {
      const remaining = orderData.order.remainingPlays ?? orderData.order.quantity;
      setRemainingSpins(remaining);
    }
  }, [orderData]);

  // Mutation to play spin
  const playSpinMutation = useMutation({
    mutationFn: async (data: { prize: any }) => {
      const response = await apiRequest("POST", "/api/play-spin-wheelll", {
        ...data,
        competitionId,
        orderId,
      });
      console.log("Playing spin with data:", { ...data, competitionId, orderId });
      return response.json();
    },
    onSuccess: (result) => {
 const rawPrize = result.prize || {};

let detectedType = "none";
let detectedValue = 0;

// 🧠 Detect type based on prize content
if (typeof rawPrize.amount === "number" && rawPrize.amount > 0) {
  detectedType = "cash";
  detectedValue = rawPrize.amount;
} else if (typeof rawPrize.amount === "string" && rawPrize.amount.toLowerCase().includes("ringtone")) {
  detectedType = "points";
  detectedValue = rawPrize.amount;
}

const normalizedPrize = {
  type: rawPrize.type || detectedType,
  value: rawPrize.value ?? detectedValue,
  image: rawPrize.image || null,
  brand: rawPrize.brand || result.winnerLabel || "Mystery Prize",
};

  const normalizedResult = {
    ...result,
    prize: normalizedPrize,
  };

  console.log("🎯 Normalized Game Result:", normalizedResult);

  setGameResult(normalizedResult);
  setIsResultModalOpen(true);
  setRemainingSpins(result.spinsRemaining);

  queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  queryClient.invalidateQueries({ queryKey: ["/api/spin-order", orderId] });

  if (normalizedPrize.type !== "none") {
    toast({
      title: "🎉 Congratulations!",
      description: `You won ${normalizedPrize.type === "cash" ? "£" : ""}${normalizedPrize.value}${normalizedPrize.type === "points" ? " points" : ""}!`,
    });
  }
},

    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process spin. Please try again.",
        variant: "destructive",
      });
    },
  });

const handleSpinComplete = (
  winnerSegment: number,
  winnerLabel: string,
  winnerPrize: any
) => {
  console.log("🎯 Spin complete:", { winnerSegment, winnerLabel, winnerPrize });

  if (playSpinMutation.isPending) return;

  if (!isAuthenticated) {
    toast({
      title: "Login Required",
      description: "Please login to play the spin.",
      variant: "destructive",
    });
    return;
  }

  if (remainingSpins <= 0) {
    toast({
      title: "No Spins Left",
      description: "You've used all your spins for this purchase.",
      variant: "destructive",
    });
    return;
  }

  // ✅ Pass the real prize object to your mutation
  playSpinMutation.mutate({ prize: winnerPrize });
};


  const handleCloseResultModal = () => {
    setIsResultModalOpen(false);

    if (remainingSpins <= 0) {
      toast({
        title: "All Spins Used",
        description: "You’ve used all your spins from this purchase.",
      });
      setTimeout(() => {
        window.location.href = "/";
        localStorage.removeItem('spinWheelHistory');
      }, 2000);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[80vh] text-yellow-400">
        <p>Loading your spins...</p>
      </div>
    );

  if (!orderData?.order)
    return (
      <div className="flex justify-center items-center h-[80vh] text-yellow-400">
        <p>Invalid or expired spin order.</p>
      </div>
    );

  return (
    <div className="min-h-screen  bg-background text-foreground">
      <Header />
      <div className="flex flex-col justify-center items-center">

  
        
       
      </div>
      <main className="container mx-auto   text-center">
        <SpinWheel 
  onSpinComplete={handleSpinComplete}
  ticketCount={remainingSpins}  
  isSpinning={false}
  setIsSpinning={() => {}}      
/>

      </main>

      <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
        <DialogContent className="w-[90vw] max-w-sm text-center rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold mb-4">
              {gameResult?.prize?.type !== "none"
                ? "🎉 You Won!"
                : "😔 Better Luck Next Time"}
            </DialogTitle>
          </DialogHeader>

         {gameResult?.prize?.type !== "none" ? (
  <div>
    <p className="text-xl text-green-400 font-semibold">
      {gameResult?.prize?.type === "cash" ? "£" : ""}
      {gameResult?.prize?.value}
      {gameResult?.prize?.type === "points" ? " Points" : ""}
    </p>
  </div>
) : (
  <p className="text-gray-400 my-2">
    Keep trying! You still have {remainingSpins} spin{remainingSpins !== 1 ? "s" : ""} left.
  </p>
)}


          <DialogFooter className="mt-6">
            <Button onClick={handleCloseResultModal}>
              {remainingSpins > 0 ? "Continue Spinning" : "Go Home"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
