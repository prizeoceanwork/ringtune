import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CompetitionCard from "@/components/competition-card";
import Testimonials from "@/components/testimonials";
import { Competition } from "@shared/schema";
import SpinWheel from "@/components/games/spin-wheel";

export default function Landing() {
  const { data: competitions = [], isLoading } = useQuery<Competition[]>({
    queryKey: ["/api/competitions"],
  });

  const [filteredCompetitions, setFilteredCompetitions] = useState<Competition[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");

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
      {/* <SpinWheel/> */}
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5"></div>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="gradient-text">WIN AMAZING PRIZES</span><br />
                <span className="text-foreground">FOR JUST PENNIES</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Join thousands of players competing for cars, cash, gadgets, and more. 
                Entry tickets start from just 10p!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => window.scrollTo({ top: document.getElementById('competitions')?.offsetTop, behavior: 'smooth' })}
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
                  data-testid="button-view-competitions"
                >
                  VIEW ALL COMPETITIONS
                </button>
                <button 
                  onClick={() => window.scrollTo({ top: document.getElementById('how-to-play')?.offsetTop, behavior: 'smooth' })}
                  className="border border-border text-foreground px-8 py-4 rounded-lg font-medium hover:bg-muted transition-colors"
                  data-testid="button-how-to-play"
                >
                  HOW TO PLAY
                </button>
              </div>
            </div>
            <div className="relative">
              {featuredCompetition && (
                <div className="bg-card rounded-xl p-8 border border-border">
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
                      <i className="fas fa-car text-primary text-4xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-primary" data-testid="text-featured-title">
                      FEATURED: BMW M3
                    </h3>
                    <p className="text-muted-foreground" data-testid="text-progress">
                      {featuredCompetition.soldTickets} / {featuredCompetition.maxTickets} sold
                    </p>
                    <div className="bg-muted h-2 rounded-full">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(featuredCompetition.soldTickets! / featuredCompetition.maxTickets!) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-lg font-semibold" data-testid="text-price">
                      £{featuredCompetition.ticketPrice} per entry
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Competition Categories */}
      <section className="bg-card border-y border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => handleFilterChange("all")}
              className={`competition-filter px-6 py-3 rounded-lg font-medium transition-colors ${
                activeFilter === "all" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground"
              }`}
              data-filter="all" 
              data-testid="filter-all"
            >
              ALL COMPETITIONS
            </button>
            <button 
              onClick={() => handleFilterChange("spin")}
              className={`competition-filter px-6 py-3 rounded-lg font-medium transition-colors ${
                activeFilter === "spin" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground"
              }`}
              data-filter="spin" 
              data-testid="filter-spin"
            >
              SPIN WHEEL
            </button>
            <button 
              onClick={() => handleFilterChange("scratch")}
              className={`competition-filter px-6 py-3 rounded-lg font-medium transition-colors ${
                activeFilter === "scratch" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground"
              }`}
              data-filter="scratch" 
              data-testid="filter-scratch"
            >
              SCRATCH CARDS
            </button>
            <button 
              onClick={() => handleFilterChange("instant")}
              className={`competition-filter px-6 py-3 rounded-lg font-medium transition-colors ${
                activeFilter === "instant" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground"
              }`}
              data-filter="instant" 
              data-testid="filter-instant"
            >
              INSTANT WIN
            </button>
          </div>
        </div>
      </section>

      {/* Competitions Grid */}
      <section id="competitions" className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
                  <div className="w-full h-48 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="competitionsGrid">
              {filteredCompetitions.map((competition) => (
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

      <Testimonials />

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
                data-testid="input-newsletter-email"
              />
              <button 
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
                data-testid="button-subscribe"
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
