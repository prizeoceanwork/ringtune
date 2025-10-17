import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useState } from "react";


interface WinnerWithDetails {
  id: string;
  prizeDescription: string;
  prizeValue: string;
  imageUrl: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
  competition: {
    title: string;
  };
}

export default function PastWinners() {
 
  const dummyWinners: WinnerWithDetails[] = [
  {
    id: "w1",
    prizeDescription: "iPhone 15 Pro Max",
    prizeValue: "1199",
    imageUrl: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=800&auto=format&fit=crop",
    createdAt: new Date().toISOString(),
    user: { firstName: "Sarah", lastName: "Johnson" },
    competition: { title: "Luxury Tech Giveaway" },
  },
  {
    id: "w2",
    prizeDescription: "Tesla Model 3",
    prizeValue: "35000",
    imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=800&auto=format&fit=crop",
    createdAt: new Date().toISOString(),
    user: { firstName: "James", lastName: "Miller" },
    competition: { title: "Dream Car Competition" },
  },
  {
    id: "w3",
    prizeDescription: "MacBook Pro 16-inch",
    prizeValue: "2499",
    imageUrl: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=800&auto=format&fit=crop",
    createdAt: new Date().toISOString(),
    user: { firstName: "Emma", lastName: "Wilson" },
    competition: { title: "Work Smarter Giveaway" },
  },
];


  const [showScratchCard, setShowScratchCard] = useState(false);
    const [showSpinWheel, setShowSpinWheel] = useState(false);
  const { data: winners = [], isLoading } = useQuery<WinnerWithDetails[]>({
    queryKey: ["/api/winners"],
  });

  const displayWinners = winners.length > 0 ? winners : dummyWinners;



  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      {/* <SpinWheel/> */}


      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="gradient-text">PAST WINNERS</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See who's been winning amazing prizes! These could be you next.
            </p>
          </div>
        </div>
      </section>

      {/* Winners Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
                  <div className="w-full h-48 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : displayWinners.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg" data-testid="text-no-winners">
                No winners to display yet. Be the first!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayWinners.map((winner) => (
                <div key={winner.id} className="bg-card rounded-xl border border-border overflow-hidden hover:transform hover:scale-105 transition-transform">
                  {winner.imageUrl && (
                    <img 
                      src={winner.imageUrl} 
                      alt={winner.prizeDescription}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6 space-y-3">
                    <h3 className="font-bold text-lg line-clamp-2" data-testid={`text-prize-${winner.id}`}>
                      {winner.prizeDescription}
                    </h3>
                    <p className="text-muted-foreground" data-testid={`text-competition-${winner.id}`}>
                      {winner.competition?.title || 'Competition'}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-primary font-bold text-xl" data-testid={`text-value-${winner.id}`}>
                        £{parseFloat(winner.prizeValue).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`text-date-${winner.id}`}>
                        {new Date(winner.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground">Winner</p>
                      <p className="font-medium" data-testid={`text-winner-${winner.id}`}>
                        {winner.user?.firstName} {winner.user?.lastName?.charAt(0)}.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {winners.length > 0 && (
            <div className="text-center mt-12">
              <button className="bg-muted text-muted-foreground px-8 py-4 rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors" data-testid="button-load-more">
                LOAD MORE WINNERS
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
