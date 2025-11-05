import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useToast } from "@/hooks/use-toast";

const SpinBilling = () => {
  const { orderId } = useParams();
  const [location, setLocation] = useLocation();
  const [selectedMethods, setSelectedMethods] = useState({
    walletBalance: false,
    ringtonePoints: false,
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    data: orderData,
    isLoading,
  } = useQuery({
    queryKey: ["/api/spin-order", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/spin-order/${orderId}`);
      const data = await res.json();
      return data;
    },
  });

  const order = orderData?.order;
  const user = orderData?.user;
  const scratchCost = orderData?.scratchCost || 2;

  const processPaymentMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/process-spin-payment", data);
      return res.json();
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      if (data.success) {
        toast({
          title: "Purchase Successful 🎉",
          description: data.message || `Your ${order?.quantity} spin(s) are ready!`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/spin-order", orderId] });
        const competitionId =
      data.competitionId || order?.competitionId; // ✅ fallback to either
    console.log("🏆 Redirecting to spin game with competitionId:", competitionId);

       if (competitionId) {
      setTimeout(() => {
       setLocation(`/spin/${data.competitionId  ||order?.competitionId || order?.order?.competitionId}/${orderId}`);


      }, 1500);
    } else {
      console.error("⚠️ Missing competitionId in success response or order");
    }
      } else {
        toast({
          title: "Payment Failed",
          description: data.message || "Something went wrong",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      setIsProcessing(false);
      toast({
        title: "Error",
        description: error.message || "Failed to process spin payment",
        variant: "destructive",
      });
    },
  });

  const handleMethodToggle = (method) => {
    setSelectedMethods((prev) => ({ ...prev, [method]: !prev[method] }));
  };

  const handleConfirmPayment = () => {
    if (!orderId) {
      toast({ title: "Error", description: "Invalid order ID.", variant: "destructive" });
      return;
    }

    if (!selectedMethods.walletBalance && !selectedMethods.ringtonePoints) {
  // This is fine — user wants to pay full via Cashflows
  toast({
    title: "Paying via Cashflows",
    description: "You’ll be redirected to complete full payment via Cashflows.",
  });
}

    if (!agreeToTerms) {
      toast({
        title: "Terms Not Accepted",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const payload = {
      orderId,
      useWalletBalance: selectedMethods.walletBalance,
      useRingtonePoints: selectedMethods.ringtonePoints,
      marketingConsent: marketingConsent && phoneNumber ? true : false,
      phoneNumber: marketingConsent ? phoneNumber : undefined,
    };
    processPaymentMutation.mutate(payload);
  };

  const totalAmount = Number(order?.totalAmount) || 0;
  const walletBalance = Number(user?.balance) || 0;
  const ringtonePoints = user?.ringtonePoints || 0;
  const ringtoneBalance = ringtonePoints * 0.01;

  const maxWalletUse = Math.min(walletBalance, totalAmount);
  const maxPointsUse = Math.min(ringtoneBalance, totalAmount);
  const walletUsed = selectedMethods.walletBalance ? maxWalletUse : 0;
  const pointsUsed = selectedMethods.ringtonePoints ? maxPointsUse : 0;
  const remainingAfterWallet = totalAmount - walletUsed;
  const actualPointsUsed = Math.min(maxPointsUse, remainingAfterWallet);
  const finalPointsUsed = selectedMethods.ringtonePoints ? actualPointsUsed : 0;
const finalAmount = totalAmount - walletUsed - finalPointsUsed;
  const pointsNeeded = Math.ceil(finalPointsUsed * 100);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[70vh] bg-black text-yellow-400">
        <p>Loading spin card order...</p>
      </div>
    );

  if (!order)
    return (
      <div className="flex justify-center items-center h-[70vh] bg-black text-yellow-400">
        <p>Invalid or expired order.</p>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-black text-yellow-400">
      <Header />

      <main className="flex flex-col items-center justify-center flex-1 p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-yellow-500/40 rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-6 text-black text-center">
            <h1 className="text-2xl font-extrabold tracking-wide">SPINS CARD PURCHASE</h1>
            <p className="text-sm opacity-90 mt-2 font-medium">
              Complete your spin card purchase
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Order Summary */}
            <div className="bg-black/40 p-4 rounded-lg border border-yellow-600/30">
              <div className="flex justify-between items-center">
                <span>Spin Cards:</span>
                <span className="font-semibold text-white">{order?.quantity}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span>Price per card:</span>
                <span className="font-semibold text-white">£{scratchCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-2 border-t border-yellow-500/30 pt-2">
                <span className="font-semibold">Total Amount:</span>
                <span className="font-bold text-yellow-400 text-lg">
                  £{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Wallet Option */}
            <div
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedMethods.walletBalance
                  ? "border-yellow-500 bg-yellow-500/10"
                  : "border-yellow-800 bg-black hover:bg-zinc-800"
              }`}
              onClick={() => handleMethodToggle("walletBalance")}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedMethods.walletBalance}
                  onChange={() => handleMethodToggle("walletBalance")}
                  className="h-5 w-5 text-yellow-400 border-yellow-600 focus:ring-yellow-500"
                />
                <div>
                  <h3 className="font-semibold">
                    Pay £{maxWalletUse.toFixed(2)} via Wallet Balance
                  </h3>
                  <p className="text-sm text-gray-400">
                    Available: £{walletBalance.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Ringtone Points */}
            <div
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedMethods.ringtonePoints
                  ? "border-amber-400 bg-amber-500/10"
                  : "border-yellow-800 bg-black hover:bg-zinc-800"
              }`}
              onClick={() => handleMethodToggle("ringtonePoints")}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedMethods.ringtonePoints}
                  onChange={() => handleMethodToggle("ringtonePoints")}
                  className="h-5 w-5 text-yellow-400 border-yellow-600 focus:ring-yellow-500"
                />
                <div>
                  <h3 className="font-semibold">
                    Pay £{maxPointsUse.toFixed(2)} via RingTone Points ({Math.ceil(maxPointsUse * 100)} pts)
                  </h3>
                  <p className="text-sm text-gray-400">
                    Available: {ringtonePoints.toLocaleString()} points (£
                    {ringtoneBalance.toFixed(2)})
                  </p>
                </div>
                
              </div>
              
            </div>
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
  Or continue without using balance to pay the full amount via Cashflows.
</p>
            {/* Payment Breakdown */}
            {(selectedMethods.walletBalance || selectedMethods.ringtonePoints) && (
              <div className="bg-black/40 border border-yellow-500/30 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Payment Breakdown</h3>
                <div className="space-y-1 text-sm">
                  {selectedMethods.walletBalance && (
                    <div className="flex justify-between">
                      <span>Wallet Balance:</span>
                      <span className="text-green-400">-£{walletUsed.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedMethods.ringtonePoints && (
                    <div className="flex justify-between">
                      <span>RingTone Points:</span>
                      <span className="text-yellow-400">
                        -£{finalPointsUsed.toFixed(2)} ({pointsNeeded} pts)
                      </span>
                    </div>
                  )}
                  {finalAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Remaining via Cashflows:</span>
                      <span className="text-amber-400">£{finalAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-yellow-500/30 pt-2 mt-2">
                    <span className="font-semibold">Final Amount:</span>
                    <span className="font-bold text-lg text-white">
                      {finalAmount > 0 ? `£${finalAmount.toFixed(2)}` : "FULLY COVERED"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Terms */}
            <div className="flex items-start space-x-3 border-t border-yellow-800 pt-4">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="h-5 w-5 text-yellow-400 border-yellow-600 focus:ring-yellow-500"
              />
              <label className="text-sm">
                I have read and agree to the website terms and conditions.
              </label>
            </div>

            {/* Button */}
 
            <Button
  disabled={isProcessing || !agreeToTerms}
  onClick={handleConfirmPayment}

              className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {isProcessing ? "PROCESSING..." : `PLACE ORDER - £${finalAmount.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SpinBilling;
