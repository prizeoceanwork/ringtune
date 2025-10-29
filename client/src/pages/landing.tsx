import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CompetitionCard from "@/components/competition-card";
import Testimonials from "@/components/testimonials";
import { Competition, User } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import FeaturedCompetitions from "./featuredCompetitions";


export default function Landing() {
  const { data: competitions = [], isLoading } = useQuery<Competition[]>({
    queryKey: ["/api/competitions"],
  });

  const [filteredCompetitions, setFilteredCompetitions] = useState<Competition[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const { isAuthenticated, user } = useAuth() as { isAuthenticated: boolean; user: User | null };

  const featuredCompetition = competitions.find(comp => comp.title.includes("BMW M3"));

  useEffect(() => {
    setFilteredCompetitions(competitions);
  }, [competitions]);

  const handleFilterChange = (filterType: string) => {
    setActiveFilter(filterType);
    if (filterType === "all") {
      setFilteredCompetitions(competitions);
    } else {
      const filtered = competitions.filter(comp => comp.type === filterType);
      setFilteredCompetitions(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5"></div>
        <div className="container mx-auto px-4 py-16 relative">
       <div className="gap-12 items-center">
  <div className="relative">
    {competitions.length > 0 ? (
      <FeaturedCompetitions competitions={competitions} />
    ) : (
      <div className="text-center text-muted-foreground py-12">
        Loading featured competitions...
      </div>
    )}
  </div>
</div>

        </div>
      </section>

      {/* Tabs Section */}
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

      {/* Competitions Section */}
      <section id="competitions" className="py-16 min-h-[60vh] flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          {activeFilter === "instant" ? (
            <p className="text-xl text-muted-foreground">Instant Win games coming soon! Stay tuned.</p>
          ) : !isAuthenticated && (activeFilter === "spin" || activeFilter === "scratch") ? (
            <p className="text-xl text-muted-foreground">Please login to play {activeFilter === "spin" ? "Spin Wheel" : "Scratch Card"}.</p>
          ) : isLoading ? (
            <p className="text-muted-foreground">Loading competitions...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  gap-6" id="competitionsGrid">
              {filteredCompetitions
                .filter((comp) => activeFilter === "all" || comp.type === activeFilter)
                .map((competition) => (
                  <CompetitionCard key={competition.id} competition={competition} />
                ))}
            </div>
          )}
        </div>
      </section>

      {/* How to Play */}
      <section id="how-to-play" className="bg-card py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="gradient-text">How to Play</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
                <i className="fas fa-user-plus text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold">Set up your account</h3>
              <p className="text-muted-foreground">It's super easy & we only need a few details</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
                <i className="fas fa-trophy text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold">Choose A Competition</h3>
              <p className="text-muted-foreground">Choose any of our amazing competitions with life changing prizes!</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
                <i className="fas fa-ticket-alt text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold">Select your tickets</h3>
              <p className="text-muted-foreground">Cars, Cash, Gadgets, Holidays - tickets from just 10p</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
                <i className="fas fa-crown text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold">Are You A Winner?</h3>
              <p className="text-muted-foreground">Winners drawn live on YouTube & Facebook</p>
            </div>
          </div>
        </div>
      </section>

      {/* <Testimonials /> */}

      {/* Newsletter Signup */}
      <section className="bg-card py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">BE THE FIRST TO KNOW!</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Sign up to our newsletter for the latest competitions and winners.
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email..."
                className="flex-1 bg-input border border-border text-foreground px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
              >
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
