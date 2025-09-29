import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const CheckoutForm = ({ orderId }: { orderId: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentSuccessMutation = useMutation({
    mutationFn: async (data: { orderId: string; paymentIntentId: string }) => {
      const response = await apiRequest("POST", "/api/payment-success", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful",
        description: "Your tickets have been purchased successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/orders"] });
      setLocation("/account");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to confirm payment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/account",
      },
      redirect: "if_required",
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      paymentSuccessMutation.mutate({
        orderId,
        paymentIntentId: paymentIntent.id,
      });
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button 
        disabled={!stripe || isProcessing || paymentSuccessMutation.isPending}
        className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        data-testid="button-submit-payment"
      >
        {isProcessing || paymentSuccessMutation.isPending ? "Processing..." : "Complete Purchase"}
      </button>
    </form>
  );
};

export default function Checkout() {
  const { orderId } = useParams();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Get order details and client secret from URL params or storage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const secret = urlParams.get('client_secret');
    if (secret) {
      setClientSecret(secret);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card rounded-xl border border-border p-8 max-w-md w-full mx-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Payment Session Expired</h2>
          <p className="text-muted-foreground mb-6">
            This payment session has expired. Please start a new purchase.
          </p>
          <button 
            onClick={() => setLocation("/")}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            data-testid="button-return-home"
          >
            Return to Competitions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2" data-testid="heading-checkout">
            Complete Your Purchase
          </h1>
          <p className="text-muted-foreground">
            Secure payment powered by Stripe
          </p>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm orderId={orderId!} />
        </Elements>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setLocation("/")}
            className="text-muted-foreground hover:text-primary transition-colors"
            data-testid="button-cancel-checkout"
          >
            Cancel and return to competitions
          </button>
        </div>
      </div>
    </div>
  );
}
