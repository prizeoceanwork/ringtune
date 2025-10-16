import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function Checkout() {
  const { orderId } = useParams();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const queryParams = new URLSearchParams(window.location.search);
  const quantity = parseInt(queryParams.get("quantity") || "1");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Redirecting to login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 800);
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleCashflowsCheckout = async () => {
    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        orderId,
        quantity,
      });

      const data = await response.json();
      if (data.success && data.redirectUrl) {
        // ✅ Redirect to Cashflows Hosted Page
        window.location.href = data.redirectUrl;
      } else {
        toast({
          title: "Error",
          description: "Failed to initialize Cashflows checkout session.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err.message || "Unable to start checkout session.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
          <p className="text-muted-foreground">
            Secure payment powered by Cashflows
          </p>
        </div>

        <button
          onClick={handleCashflowsCheckout}
          className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-bold text-lg hover:opacity-90"
        >
          Proceed to Payment
        </button>

        <div className="mt-6 text-center">
          <button
            onClick={() => setLocation("/")}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Cancel and return to competitions
          </button>
        </div>
      </div>
    </div>
  );
}
