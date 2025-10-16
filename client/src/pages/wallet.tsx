import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Link } from "wouter";
import { Transaction, User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import RingtonePoints from "./ringtunePoints";

// const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
//   ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
//   : null;

// const TopUpForm = ({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) => {
//   const stripe = useStripe();
//   const elements = useElements();
//   const { toast } = useToast();
//   const [isProcessing, setIsProcessing] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!stripe || !elements) {
//       return;
//     }

//     setIsProcessing(true);

//     const { error } = await stripe.confirmPayment({
//       elements,
//       confirmParams: {
//         return_url: window.location.origin + "/wallet",
//       },
//     });

//     if (error) {
//       toast({
//         title: "Payment Failed",
//         description: error.message,
//         variant: "destructive",
//       });
//     } else {
//       toast({
//         title: "Payment Successful",
//         description: "Your wallet has been topped up!",
//       });
//       onSuccess();
//     }

//     setIsProcessing(false);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <PaymentElement />
//       <button 
//         disabled={!stripe || isProcessing}
//         className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
//         data-testid="button-confirm-payment"
//       >
//         {isProcessing ? "Processing..." : "Confirm Payment"}
//       </button>
//     </form>
//   );
// };

export default function Wallet() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth() as { isAuthenticated: boolean; isLoading: boolean; user: User | null };
  const queryClient = useQueryClient();
  const [topUpAmount, setTopUpAmount] = useState<string>("10");
  const [clientSecret, setClientSecret] = useState<string>("");

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/user/transactions"],
    enabled: isAuthenticated,
  });

  // const topUpMutation = useMutation({
  //   mutationFn: async (amount: number) => {
  //     const response = await apiRequest("POST", "/api/wallet/topup", { amount });
  //     return response.json();
  //   },
  //   onSuccess: (data) => {
  //     setClientSecret(data.clientSecret);
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: "Error",
  //       description: error.message || "Failed to initiate top-up",
  //       variant: "destructive",
  //     });
  //   },
  // });


 const topUpMutation = useMutation({
  mutationFn: async (amount: number) => {
    const response = await apiRequest("POST", "/api/wallet/topup-checkout", { amount });
    return response.json();
  },
  onSuccess: (data) => {
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl; // Redirect user to Cashflows checkout
    } else {
      toast({
        title: "Error",
        description: "Failed to get Cashflows checkout URL",
        variant: "destructive",
      });
    }
  },
  onError: (error: any) => {
    toast({
      title: "Error",
      description: error.message || "Failed to start checkout session",
      variant: "destructive",
    });
    console.error("Top-up error:", error);
  },
});



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

  const handleTopUp = () => {
    const amountNum = Number(topUpAmount);
    if (amountNum < 5) {
      toast({
        title: "Invalid Amount",
        description: "Minimum top-up amount is £5",
        variant: "destructive",
      });
      return;
    }
    topUpMutation.mutate(amountNum);
  };

  const handlePaymentSuccess = () => {
    setClientSecret("");
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    queryClient.invalidateQueries({ queryKey: ["/api/user/transactions"] });
  };

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-muted text-center py-4 mb-8">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/orders" className="text-primary hover:underline">Orders</Link>
            <span className="text-primary">Entries</span>
             <Link to="/ringtune-points" className="text-primary hover:underline">
                      <span className="text-primary">RingTone Points</span>
                      </Link>
            <span className="text-primary">Referral Scheme</span>
            <span className="text-primary font-bold">Wallet</span>
            <span className="text-primary">Address</span>
            <Link href="/account" className="text-primary hover:underline">Account details</Link>
            <a href="/api/logout" className="text-primary hover:underline">Log out</a>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center" data-testid="heading-wallet">MY ACCOUNT</h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Wallet Balance */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-2xl font-bold mb-6">WALLET</h2>
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Your wallet balance is</p>
                <p className="text-4xl font-bold text-primary" data-testid="text-balance">
                  £{parseFloat(user?.balance || '0').toFixed(2)}
                </p>
                
               <div className="space-y-4">
  <div className="space-y-2">
    <label className="text-sm text-muted-foreground">Top-up amount</label>
    <div className="flex gap-2">
      {[10, 25, 50, 100].map((amount) => (
        <button
          key={amount}
          onClick={() => setTopUpAmount(String(amount))}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            topUpAmount === String(amount)
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'
          }`}
        >
          £{amount}
        </button>
      ))}
    </div>
    <input
      type="number"
      min="5"
      max="1000"
      value={topUpAmount}
      onChange={(e) => setTopUpAmount(e.target.value)}
      className="w-full bg-input border border-border text-foreground px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
      placeholder="Enter custom amount"
    />
  </div>
  <button 
    onClick={handleTopUp}
    disabled={topUpMutation.isPending}
    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
  >
    {topUpMutation.isPending ? "Redirecting..." : "TOP UP"}
  </button>
</div>

              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8" data-testid="text-no-transactions">
                    No transactions yet
                  </p>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
                      <div>
                        <p className="font-medium" data-testid={`text-transaction-${transaction.id}`}>
                          {transaction.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`font-bold ${
                        transaction.type === 'deposit' || transaction.type === 'prize' 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {transaction.type === 'deposit' || transaction.type === 'prize' ? '+' : ''}
                        £{Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
