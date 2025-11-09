import { useEffect } from "react";
import { useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

export default function WalletSuccess() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
  const confirmPayment = async () => {
    const params = new URLSearchParams(window.location.search);
    
    // ✅ Cashflows returns "paymentjobref" parameter
    const sessionId = params.get("paymentjobref");
    
    console.log("🔍 URL Parameters:", Object.fromEntries(params.entries()));
    console.log("🔍 Extracted sessionId:", sessionId);

    if (!sessionId) {
      toast({ 
        title: "Error", 
        description: "Missing session ID. Parameters: " + JSON.stringify(Object.fromEntries(params.entries())), 
        variant: "destructive" 
      });
      return;
    }

    try {
      const res = await apiRequest("POST", "/api/wallet/confirm-topup", { sessionId });
      if (res.ok) {
        toast({
          title: "Payment Confirmed",
          description: "Your wallet has been updated.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user/transactions"] });
        setTimeout(() => (window.location.href = "/wallet"), 1500);
      } else {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.message || "Could not confirm payment",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to confirm payment",
        variant: "destructive",
      });
    }
  };

  confirmPayment();
}, [queryClient, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Processing your payment...</h1>
        <p>Please wait a moment while we confirm your wallet top-up.</p>
      </div>
    </div>
  );
}
