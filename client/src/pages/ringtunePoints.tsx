import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { Link } from "wouter";

export default function RingtonePoints() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [conversionAmount, setConversionAmount] = useState("1000");




  const { data: userData } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!user,
  });

  const convertMutation = useMutation({
    mutationFn: async (points: number) => {
      const response = await apiRequest("POST", "/api/convert-ringtone-points", { points });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Conversion Successful",
        description: `Converted ${data.convertedPoints} points to €${data.euroAmount}`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      toast({
        title: "Conversion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConvert = () => {
  const points = parseInt(conversionAmount);
  
  if (isNaN(points)) {
    toast({
      title: "Invalid Input",
      description: "Please enter a valid number",
      variant: "destructive",
    });
    return;
  }

  if (points > ringtonePoints) {
    toast({
      title: "Insufficient Points",
      description: "You don't have enough ringtone points",
      variant: "destructive",
    });
    return;
  }

  if (points < 1000) {
    toast({
      title: "Minimum Conversion",
      description: "Minimum conversion is 1000 points",
      variant: "destructive",
    });
    return;
  }

  convertMutation.mutate(points);
};
  const ringtonePoints = userData?.ringtonePoints || 0;
  const maxConvertible = Math.floor(ringtonePoints / 1000) * 1000;


  return (
     <div className="min-h-screen bg-background text-foreground">
          <Header />
<div className="container mx-auto px-4 py-8">
          <div className="bg-muted text-center py-4 mb-8">
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                      <Link href="/orders" className="text-primary hover:underline">
                        Orders
                      </Link>
                      <span className="text-primary">Entries</span>
                      <Link to="/ringtune-points" className="text-primary hover:underline">
                      <span className="text-primary">RingTone Points</span>
                      </Link>
                      <span className="text-primary">Referral Scheme</span>
                      <Link href="/wallet" className="text-primary hover:underline">
                        Wallet
                      </Link>
                      <span className="text-primary">Address</span>
                      <span className="text-primary">Account details</span>
          
                     
                    </div>
                  </div>
    <div className="bg-card max-w-4xl mx-auto rounded-lg border border-border p-6">
      <h3 className="text-xl font-bold mb-4">Ringtone Points</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Current Points:</span>
          <span className="text-2xl font-bold text-primary">{ringtonePoints.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Equivalent Value:</span>
          <span className="text-lg font-semibold">
            €{(ringtonePoints / 1000).toFixed(2)}
          </span>
        </div>

        {ringtonePoints >= 1000 && (
          <div className="space-y-3 pt-4 border-t border-border">
            <label className="text-sm font-medium">Convert to Wallet</label>
            <div className="flex gap-2">
            <input
            type="number"
            min="1000"
            max={maxConvertible}
            step="1000"
            value={conversionAmount}
            onChange={(e) => setConversionAmount(e.target.value)}
            className="flex-1 px-3 py-2 text-black border border-border rounded-md"
            placeholder="Points to convert"
            />

              <button
                onClick={() => setConversionAmount(String(maxConvertible))}
                className="px-3 py-2 bg-muted text-muted-foreground rounded-md hover:bg-accent"
              >
                Max
              </button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {conversionAmount} points = €{(Number(conversionAmount) / 1000).toFixed(2)}
            </div>

            <button
              onClick={handleConvert}
              disabled={convertMutation.isPending || conversionAmount > ringtonePoints}
              className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {convertMutation.isPending ? "Converting..." : "Convert to Wallet"}
            </button>
          </div>
        )}

        {ringtonePoints < 1000 && (
          <div className="text-sm text-muted-foreground pt-4 border-t border-border">
            You need at least 1000 points to convert to wallet balance.
          </div>
        )}
      </div>
    </div>
    </div>
    </div>
  );
}