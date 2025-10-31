import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearch } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ScratchCardTest from "@/components/games/scratch-card-test";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function ScratchGamePage() {
const { competitionId, orderId } = useParams();

console.log("competitionId:", competitionId);
console.log("orderId:", orderId);
  
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: competition } = useQuery({
    queryKey: ["/api/competitions", competitionId],
  });



const {
  data: order,
  isLoading,
  error,
} = useQuery({
  queryKey: ["/api/scratch-order", orderId],
  enabled: !!orderId,
  queryFn: async () => {
    const res = await apiRequest("GET", `/api/scratch-order/${orderId}`);
    const data = await res.json();
    console.log("✅ Scratch order data:", data);
    return data;
  },
});



  const [gameResult, setGameResult] = useState<any>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

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
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scratch-order", orderId] });
    },
    
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-8">
          🎟️ {competition?.title || "Scratch & Win!"}
        </h1>
        
{order?.order && (
  <div className="mb-8 text-lg text-yellow-400 font-semibold">
    You have <span className="text-white">{order.order.remainingPlays ?? order.order.quantity}</span>{" "}
    scratch{(order.order.remainingPlays ?? order.order.quantity) !== 1 ? "es" : ""} left 🎯
  </div>
)}
        <ScratchCardTest
          onScratchComplete={(winnerPrize: any) => {
            if (playScratchCardMutation.isPending) return;

            if (!isAuthenticated) {
              toast({
                title: "Login Required",
                description: "Please login to play scratch card.",
                variant: "destructive",
              });
              return;
            }

            playScratchCardMutation.mutate({ winnerPrize });
          }}
          scratchTicketCount={order?.order?.remainingPlays || order?.order?.quantity || 0}
        />
      </section>

      <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
        <DialogContent className="max-w-md flex flex-col justify-center items-center text-center">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">
              {gameResult?.prize?.amount > 0
                ? "🎉 You Won!"
                : "😔 Better Luck Next Time"}
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
