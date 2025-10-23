// import { useParams, useLocation } from "wouter";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useState, useEffect } from "react";
// import { useAuth } from "@/hooks/useAuth";
// import { useToast } from "@/hooks/use-toast";
// import Header from "@/components/layout/header";
// import Footer from "@/components/layout/footer";
// import { Competition, User, Ticket } from "@shared/schema";
// import { apiRequest } from "@/lib/queryClient";
// import { isUnauthorizedError } from "@/lib/authUtils";
// import SpinWheel from "@/components/games/spinwheeltest";
// import ScratchCardTest from "@/components/games/scratch-card-test"; // Import your scratch card component
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";

// export default function PlayGamePage() {
//   const { id } = useParams();
//   const [, setLocation] = useLocation();
//   const { toast } = useToast();
//   const { isAuthenticated, user } = useAuth() as { isAuthenticated: boolean; user: User | null };
//   const queryClient = useQueryClient();
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [gameResult, setGameResult] = useState<any>(null);
//   const [selectedTicketId, setSelectedTicketId] = useState<string>("");
// const [isResultModalOpen, setIsResultModalOpen] = useState(false);

//   const { data: competition } = useQuery<Competition>({
//     queryKey: ["/api/competitions", id],
//     enabled: !!id,
//   });

//   const { data: userTickets = [] } = useQuery<Ticket[]>({
//     queryKey: ["/api/user/tickets"],
//     enabled: isAuthenticated,
//   });

//   // Filter tickets for this competition and get count
//   const availableTickets = userTickets.filter(ticket => ticket.competitionId === id);
//   const ticketCount = availableTickets.length;

//   // Auto-select first ticket if available and none selected
//   useEffect(() => {
//     if (availableTickets.length > 0 && !selectedTicketId) {
//       setSelectedTicketId(availableTickets[0].id);
//     }
//   }, [availableTickets, selectedTicketId]);

//   // Spin wheel mutation
//   const playSpinWheelMutation = useMutation({
//     mutationFn: async (data: { ticketId: string; winnerPrize: any }) => {
//       const response = await apiRequest("POST", "/api/play-spin-wheel", data);
//       return response.json();
//     },
//     onSuccess: (result) => {
//       setGameResult(result);
//        setIsResultModalOpen(true); 
//       queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
//       queryClient.invalidateQueries({ queryKey: ["/api/user/tickets"] });
//     },
//     onError: (error) => {
//       if (isUnauthorizedError(error)) {
//         toast({
//           title: "Unauthorized",
//           description: "Please login again",
//           variant: "destructive",
//         });
//         setTimeout(() => {
//           window.location.href = "/api/login";
//         }, 1000);
//         return;
//       }
//       toast({
//         title: "Error",
//         description: error.message || "Failed to play game",
//         variant: "destructive",
//       });
//     },
//   });

//   // Scratch card mutation
// const playScratchCardMutation = useMutation({
//   mutationFn: async (data: { winnerPrize: any }) => {
//     const response = await apiRequest("POST", "/api/play-scratch-card", data);
//     return response.json();
//   },
//   onSuccess: (result) => {
//     setGameResult(result);
//      setIsResultModalOpen(true); 
//     queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
//     queryClient.invalidateQueries({ queryKey: ["/api/user/tickets"] });
//   },
//   onError: (error) => {
//     if (isUnauthorizedError(error)) {
//       toast({
//         title: "Unauthorized",
//         description: "Please login again",
//         variant: "destructive",
//       });
//       setTimeout(() => {
//         window.location.href = "/api/login";
//       }, 1000);
//       return;
//     }
//     toast({
//       title: "Error",
//       description: error.message || "Failed to play scratch card",
//       variant: "destructive",
//     });
//   },
// });


//   const handleSpinComplete = (winnerSegment: number, winnerLabel: string, winnerPrize: any) => {
//     const ticketToUse = availableTickets[0];

//     if (!ticketToUse) {
//       toast({
//         title: "No Tickets Left",
//         description: "You've used all your spins! Purchase more tickets to play again.",
//         variant: "destructive",
//       });
//       return;
//     }

//     playSpinWheelMutation.mutate({
//       ticketId: ticketToUse.id,
//       winnerPrize: winnerPrize
//     });
//   };

//   const handleScratchComplete = (prize: { type: string; value: string }) => {
//     const ticketToUse = availableTickets[0];

//     if (!ticketToUse) {
//       toast({
//         title: "No Tickets Left",
//         description: "You've used all your scratch cards! Purchase more tickets to play again.",
//         variant: "destructive",
//       });
//       return;
//     }

//     // Format the prize to match your backend expectation
//     const winnerPrize = {
//       type: prize.type,
//       value: prize.value
//     };

//    playScratchCardMutation.mutate({ winnerPrize });
//   };

//   const handlePlayAgain = () => {
//     setGameResult(null);
//     // Remove the used ticket from selection
//     const remainingTickets = availableTickets.filter(ticket => ticket.id !== selectedTicketId);
//     if (remainingTickets.length > 0) {
//       setSelectedTicketId(remainingTickets[0].id);
//     } else {
//       setSelectedTicketId("");
//     }
//   };

//   if (!isAuthenticated) {
//     return (
//       <div className="min-h-screen bg-background">
//         <Header />
//         <div className="container mx-auto px-4 py-16 text-center">
//           <h1 className="text-4xl font-bold mb-4">Login Required</h1>
//           <p className="text-muted-foreground mb-8">Please login to play games.</p>
//           <button 
//             onClick={() => window.location.href = "/api/login"}
//             className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
//           >
//             Login
//           </button>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   if (!competition) {
//     return (
//       <div className="min-h-screen bg-background">
//         <Header />
//         <div className="container mx-auto px-4 py-16 text-center">
//           <h1 className="text-4xl font-bold mb-4">Competition Not Found</h1>
//           <button 
//             onClick={() => setLocation("/")}
//             className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
//           >
//             Back to Competitions
//           </button>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   if (availableTickets.length === 0) {
//     return (
//       <div className="min-h-screen bg-background">
//         <Header />
//         <div className="container mx-auto px-4 py-16 text-center">
//           <h1 className="text-4xl font-bold mb-4">No Tickets Available</h1>
//           <p className="text-muted-foreground mb-8">You need to purchase tickets first to play this game.</p>
//           <button 
//             onClick={() => setLocation(`/competition/${id}`)}
//             className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
//           >
//             Purchase Tickets
//           </button>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   const prizes = (competition.prizeData as any) || [];

//   return (
//     <div className="min-h-screen bg-background text-foreground">
//       <Header />
      
//       <div className="container mx-auto px-4 py-16">
//         <div className="max-w-4xl mx-auto">
//           <div className="text-center mb-8">
//             <h1 className="text-4xl font-bold gradient-text mb-4">
//               {competition.type === "spin" ? "SPIN THE WHEEL" : "SCRATCH CARD"}
//             </h1>
//             <p className="text-xl text-muted-foreground">{competition.title}</p>
            
//             {/* Ticket Count Display */}
//             <div className="bg-primary/20 rounded-lg px-6 py-3 inline-block mt-4">
//               <span className="text-lg font-semibold">
//                 Available {competition.type === "spin" ? "Spins" : "Scratch Cards"}: <span className="text-primary">{ticketCount}</span>
//               </span>
//             </div>
//           </div>

//         <div className="space-y-8 opacity-100">
//   {/* Game Interface */}
//   {competition.type === "spin" ? (
//     <div className="text-center">
//       <SpinWheel
//         onSpinComplete={handleSpinComplete}
//         isSpinning={isSpinning}
//         setIsSpinning={setIsSpinning}
//       />
//     </div>
//   ) : (
//     <div className="text-center">
//       <ScratchCardTest
//         competition={competition}
//         onScratchComplete={handleScratchComplete}
//       />
//     </div>
//   )}
// </div>

//         </div>
//       </div>
//        <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
//   <DialogContent className="max-w-md md:max-w-xl flex flex-col justify-center items-center text-center">
//     <DialogHeader className="text-center">
//       <DialogTitle className="text-3xl w-full text-center font-bold">
//         {gameResult?.success ? "🎉 Congratulations!" : "😔 Try Again!"}
//       </DialogTitle>
//     </DialogHeader>

//     {gameResult?.prize && (
//       <div className="space-y-4 mt-4">
//         {competition.type === "spin" && gameResult.prize.brand && (
//           <p className="text-xl">
//             You landed on: <strong>{gameResult.prize.brand}</strong>
//           </p>
//         )}

//         <p className="text-2xl font-bold text-primary">
//           {competition.type === "spin" ? (
//             typeof gameResult.prize.amount === "number"
//               ? `£${gameResult.prize.amount}`
//               : gameResult.prize.amount || gameResult.prize
//           ) : gameResult.prize.type === "cash" ? (
//             `£${gameResult.prize.value}`
//           ) : (
//             `${gameResult.prize.value} Ringtone Points`
//           )}
//         </p>

//         {(competition.type === "spin" &&
//           typeof gameResult.prize.amount === "number" &&
//           gameResult.prize.amount > 0) ||
//         (competition.type === "scratch" &&
//           gameResult.prize.type === "cash" &&
//           parseFloat(gameResult.prize.value.replace(/[^0-9.]/g, "")) > 0) ? (
//           <p className="text-green-600">
//             Prize has been added to your wallet!
//           </p>
//         ) : competition.type === "scratch" &&
//           gameResult.prize.type === "points" ? (
//           <p className="text-green-600">
//             Ringtone points have been added to your account!
//           </p>
//         ) : null}
//       </div>
//     )}

//     <DialogFooter className="mt-6 flex justify-center gap-4">
//       {ticketCount > 0 ? (
//         <button
//           onClick={() => {
//             handlePlayAgain();
//             setIsResultModalOpen(false);
//           }}
//           className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
//         >
//           Play Again ({ticketCount - 1}{" "}
//           {competition.type === "spin" ? "spins" : "scratch"} left)
//         </button>
//       ) : (
//         <button
//           onClick={() => setLocation(`/competition/${id}`)}
//           className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
//         >
//           Purchase More Tickets
//         </button>
//       )}
//       <button
//         onClick={() => {
//           setIsResultModalOpen(false);
//           setLocation("/");
//         }}
//         className="bg-muted text-muted-foreground px-6 py-3 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
//       >
//         Back to Competitions
//       </button>
//     </DialogFooter>
//   </DialogContent>
// </Dialog>
//       <Footer />
//     </div>
//   );
// }
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CompetitionCard from "@/components/competition-card";
import Testimonials from "@/components/testimonials";
import { Competition, User } from "@shared/schema";
import SpinWheel from "@/components/games/spinwheeltest";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ScratchCardTest from "@/components/games/scratch-card-test";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth() as { isAuthenticated: boolean; user: User | null };
  const queryClient = useQueryClient();

  const { data: competitions = [], isLoading } = useQuery<Competition[]>({
    queryKey: ["/api/competitions"],
  });

  const [filteredCompetitions, setFilteredCompetitions] = useState<Competition[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isSpinning, setIsSpinning] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  useEffect(() => {
    setFilteredCompetitions(competitions);
  }, [competitions]);

  const handleFilterChange = (filterType: string) => {
    setActiveFilter(filterType);
    if (filterType === "all") setFilteredCompetitions(competitions);
    else setFilteredCompetitions(competitions.filter((c) => c.type === filterType));
  };

  // --- 🌀 Spin Wheel Mutation ---
  const playSpinWheelMutation = useMutation({
    mutationFn: async (data: { winnerPrize: any }) => {
      const response = await apiRequest("POST", "/api/play-spin-wheel", data);
      return response.json();
    },
    onSuccess: (result) => {
      setGameResult(result);
      setIsResultModalOpen(true);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to play game",
        variant: "destructive",
      });
    },
  });

  // --- 🧩 Scratch Card Mutation ---
const playScratchCardMutation = useMutation({
  mutationFn: async (data: { winnerPrize: any }) => {
    const response = await apiRequest("POST", "/api/play-scratch-card", data);
    return response.json();
  },
  onSuccess: (result) => {
    setGameResult(result);
    setIsResultModalOpen(true);
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] }); // refresh balance
  },
  onError: (error: any) => {
    toast({
      title: "Error",
      description: error.message || "Failed to play scratch card",
      variant: "destructive",
    });
  },
});


  // --- 🧠 Handle Spin Complete ---
  const handleSpinComplete = (winnerSegment: number, winnerLabel: string, winnerPrize: any) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Login Required",
        description: "Please login to play the spin wheel.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(user.balance || "0") < 2) {
      toast({
        title: "Insufficient Balance",
        description: "You need at least €2 in your wallet to spin.",
        variant: "destructive",
      });
      return;
    }

    // Deduct €2 immediately (frontend optimistic update)
    queryClient.setQueryData(["/api/auth/user"], {
      ...user,
      balance: Number(user.balance ?? 0) - 2,
    });

    // Call backend mutation
    playSpinWheelMutation.mutate({ winnerPrize });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Welcome Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold">
              <span className="gradient-text">Welcome Back!</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Ready to win big? Spin the wheel and test your luck!
            </p>
          </div>
        </div>
      </section>

      {/* Competition Filters */}
      <section className="bg-card border-y border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center gap-4">
            {["all", "spin", "scratch", "instant"].map((type) => (
              <button
                key={type}
                onClick={() => handleFilterChange(type)}
                className={`competition-filter px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeFilter === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                {type === "all"
                  ? "ALL COMPETITIONS"
                  : type === "spin"
                  ? "SPIN WHEEL"
                  : type === "scratch"
                  ? "SCRATCH CARDS"
                  : "INSTANT WIN"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {activeFilter === "spin" ? (
            <div className="w-full">
              <SpinWheel
                onSpinComplete={handleSpinComplete}
                isSpinning={isSpinning}
                setIsSpinning={setIsSpinning}
              />
            </div>
          ) 
          :activeFilter === "scratch" ? (
  <ScratchCardTest
    onScratchComplete={(winnerPrize: any) => {
       if (playScratchCardMutation.isPending) return;
      if (!isAuthenticated || !user) {
        toast({
          title: "Login Required",
          description: "Please login to play scratch card.",
          variant: "destructive",
        });
        return;
      }

      if (parseFloat(user.balance || "0") < 2) {
        toast({
          title: "Insufficient Balance",
          description: "You need at least €2 in your wallet to play.",
          variant: "destructive",
        });
        return;
      }

      // ✅ Optimistic balance deduction
      queryClient.setQueryData(["/api/auth/user"], {
        ...user,
        balance: Number(user.balance ?? 0) - 2,
      });

      // ✅ Call backend to handle actual prize + deduction
      playScratchCardMutation.mutate({ winnerPrize });
    }}
  />
) : isLoading ? (
            <p className="text-center text-muted-foreground">Loading competitions...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCompetitions.map((competition) => (
                  <CompetitionCard
                    key={competition.id}
                    competition={competition}
                    authenticated={true}
                  />
                ))}
              </div>

              <div className="text-center mt-12">
                <button className="bg-muted text-muted-foreground px-8 py-4 rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
                  LOAD MORE COMPETITIONS
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Result Modal */}
      <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
  <DialogContent className="max-w-md flex flex-col justify-center items-center text-center">
    <DialogHeader>
      <DialogTitle className="text-3xl font-bold">
       {gameResult?.prize && gameResult.prize.type !== "none"
  ? "🎉 You Won!"
  : "😔 Better Luck Next Time"}

      </DialogTitle>
    </DialogHeader>

    {gameResult?.prize && (
      <div className="mt-4 space-y-2">
    <p className="text-xl">
  {gameResult?.prize?.amount
    ? `You won ${gameResult.prize.amount}`
    : gameResult?.prize?.type !== "none"
    ? `You won ${gameResult.prize.value}${gameResult.prize.type === "cash" ? "€" : " Ringtones"}`
    : "No prize this time!"}
</p>


        {gameResult.prize.type === "cash" && (
          <p className="text-green-600">Prize added to your wallet!</p>
        )}
      </div>
    )}

    <DialogFooter className="mt-6">
      <button
        onClick={() => setIsResultModalOpen(false)}
        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
      >
        Close
      </button>
    </DialogFooter>
  </DialogContent>
</Dialog>


      <Testimonials />
      <Footer />
    </div>
  );
}


