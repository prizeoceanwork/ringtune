import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

export default function CheckoutSuccess() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [itemType, setItemType] = useState<string | null>(null); // spin or scratch

  useEffect(() => {
    const confirmPayment = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("paymentjobref");
      const orderId = urlParams.get("orderId");

      if (!sessionId || !orderId) {
        toast({
          title: "Error",
          description: "Missing payment information in URL",
          variant: "destructive",
        });
        return;
      }

      try {
        const res = await apiRequest("POST", "/api/payment-success/competition", {
          sessionId,
          orderId,
        });

        let data;
        try {
          data = await res.json();
        } catch {
          toast({
            title: "Error",
            description: "Failed to parse response from server",
            variant: "destructive",
          });
          return;
        }

        if (res.ok && data.success) {
          // Determine item type
          const type = data.competitionType === "spin" ? "spins" : "scratch cards";
          setItemType(type);

          toast({
            title: "Payment Successful",
            description: `Your ${type} have been issued!`,
          });

          // Refresh queries
          queryClient.invalidateQueries({ queryKey: ["/api/user/tickets"] });
          queryClient.invalidateQueries({ queryKey: ["/api/user/transactions"] });
          queryClient.invalidateQueries({ queryKey: ["/api/competitions", data.competitionId] });

          const redirectUrl =
            data.competitionType === "spin"
              ? `/spin/${data.competitionId}/${data.orderId}`
              : `/scratch/${data.competitionId}/${data.orderId}`;

          setTimeout(() => setLocation(redirectUrl), 2000);
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to confirm payment",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Payment confirmation failed",
          variant: "destructive",
        });
      }
    };

    confirmPayment();
  }, [setLocation, toast, queryClient]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">
          Processing your {itemType ?? "purchase"}...
        </h1>
        <p>
          Please wait a moment while we confirm your {itemType ?? "purchase"}.
        </p>
      </div>
    </div>
  );
}
