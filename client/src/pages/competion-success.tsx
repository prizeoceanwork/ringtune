import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function CheckoutSuccess() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const confirmPayment = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("session_id");
      if (!sessionId) return;

      try {
        const res = await apiRequest("POST", "/api/payment-success/competition", { sessionId });
        const data = await res.json();
        if (data.success) {
          toast({
            title: "Payment Successful",
            description: "Your tickets have been issued!",
          });
           const redirectUrl = data.competitionId
            ? `/competition/${data.competitionId}`
            : "/account";
          setTimeout(() => setLocation(redirectUrl), 2000);
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to confirm payment.",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Payment confirmation failed.",
          variant: "destructive",
        });
      }
    };

    confirmPayment();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Processing your payment...</h1>
      </div>
    </div>
  );
}
