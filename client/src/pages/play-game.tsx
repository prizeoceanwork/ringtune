import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Competition, User, Ticket } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface WheelSegment {
  brand: string;
  amount: number | string;
  probability: number;
}

export default function PlayGamePage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth() as { isAuthenticated: boolean; user: User | null };
  const queryClient = useQueryClient();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<string>("");
  const [gameResult, setGameResult] = useState<any>(null);

  const { data: competition } = useQuery<Competition>({
    queryKey: ["/api/competitions", id],
    enabled: !!id,
  });

  const { data: userTickets = [] } = useQuery<Ticket[]>({
    queryKey: ["/api/user/tickets"],
    enabled: isAuthenticated,
  });

  // Filter tickets for this competition
  const availableTickets = userTickets.filter(ticket => ticket.competitionId === id);

  const playGameMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const endpoint = competition?.type === "spin" ? "/api/play-spin-wheel" : "/api/play-scratch-card";
      const response = await apiRequest("POST", endpoint, { ticketId });
      return response.json();
    },
    onSuccess: (result) => {
      setGameResult(result);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/tickets"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please login again",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to play game",
        variant: "destructive",
      });
    },
  });

  const handlePlay = () => {
    if (!selectedTicket) {
      toast({
        title: "No Ticket Selected",
        description: "Please select a ticket to play",
        variant: "destructive",
      });
      return;
    }

    if (competition?.type === "spin") {
      setIsSpinning(true);
      const spinRotation = Math.random() * 360 + 1440; // At least 4 full rotations
      setRotation(prev => prev + spinRotation);
      
      setTimeout(() => {
        playGameMutation.mutate(selectedTicket);
        setIsSpinning(false);
      }, 3000);
    } else {
      playGameMutation.mutate(selectedTicket);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-8">Please login to play games.</p>
          <button 
            onClick={() => window.location.href = "/api/login"}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Login
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Competition Not Found</h1>
          <button 
            onClick={() => setLocation("/")}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Competitions
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (availableTickets.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">No Tickets Available</h1>
          <p className="text-muted-foreground mb-8">You need to purchase tickets first to play this game.</p>
          <button 
            onClick={() => setLocation(`/competition/${id}`)}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Purchase Tickets
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const prizes = (competition.prizeData as WheelSegment[]) || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-4">
              {competition.type === "spin" ? "SPIN THE WHEEL" : "SCRATCH CARD"}
            </h1>
            <p className="text-xl text-muted-foreground">{competition.title}</p>
          </div>

          {!gameResult ? (
            <div className="space-y-8">
              {/* Ticket Selection */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-xl font-bold mb-4">Select Your Ticket</h3>
                <div className="space-y-2">
                  {availableTickets.map((ticket) => (
                    <label key={ticket.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="ticket"
                        value={ticket.id}
                        checked={selectedTicket === ticket.id}
                        onChange={(e) => setSelectedTicket(e.target.value)}
                        className="text-primary focus:ring-primary"
                      />
                      <span>Ticket #{ticket.ticketNumber}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Game Interface */}
              {competition.type === "spin" ? (
                <div className="text-center">
                  <div className="wheel-container mx-auto mb-8">
                    <div 
                      className="wheel transition-transform duration-3000 ease-out"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    >
                      {prizes.map((prize, index) => {
                        const segmentAngle = 360 / prizes.length;
                        const rotation = index * segmentAngle;
                        const colors = [
                          'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
                          'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
                          'bg-teal-500', 'bg-cyan-500', 'bg-lime-500', 'bg-amber-500',
                          'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-sky-500',
                          'bg-slate-500', 'bg-gray-500', 'bg-zinc-500', 'bg-stone-500'
                        ];
                        
                        return (
                          <div
                            key={index}
                            className={`wheel-segment ${colors[index % colors.length]}`}
                            style={{
                              transform: `rotate(${rotation}deg)`,
                              clipPath: `polygon(0 0, ${100 - (100 / prizes.length)}% 0, 100% 100%)`,
                            }}
                          >
                            <div className="segment-content">
                              <div className="text-white font-bold text-xs">
                                {prize.brand}
                              </div>
                              <div className="text-white font-bold text-xs">
                                {typeof prize.amount === 'number' ? `£${prize.amount}` : prize.amount}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="wheel-pointer"></div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="scratch-card mx-auto mb-8">
                    <div className="scratch-content">
                      <p className="text-lg text-muted-foreground">Scratch to reveal your prize!</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center">
                <button 
                  onClick={handlePlay}
                  disabled={!selectedTicket || playGameMutation.isPending || isSpinning}
                  className="bg-primary text-primary-foreground px-12 py-4 rounded-lg font-bold text-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {playGameMutation.isPending || isSpinning ? "Playing..." : 
                   competition.type === "spin" ? "SPIN NOW!" : "SCRATCH NOW!"}
                </button>
              </div>
            </div>
          ) : (
            /* Game Result */
            <div className="text-center">
              <div className="bg-card rounded-xl border border-border p-8 mb-8">
                <h2 className="text-3xl font-bold mb-4">
                  {gameResult.success ? "🎉 Congratulations!" : "😔 Try Again!"}
                </h2>
                {gameResult.prize && (
                  <div className="space-y-4">
                    {competition.type === "spin" && gameResult.prize.brand && (
                      <p className="text-xl">You landed on: <strong>{gameResult.prize.brand}</strong></p>
                    )}
                    <p className="text-2xl font-bold text-primary">
                      Prize: {typeof gameResult.prize.amount === 'number' ? 
                        `£${gameResult.prize.amount}` : 
                        gameResult.prize.amount || gameResult.prize}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-x-4">
                <button 
                  onClick={() => setLocation(`/competition/${id}`)}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Purchase More Tickets
                </button>
                <button 
                  onClick={() => setLocation("/")}
                  className="bg-muted text-muted-foreground px-6 py-3 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Back to Competitions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}