import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CompetitionCard from "@/components/competition-card";
import Testimonials from "@/components/testimonials";
import { Competition } from "@shared/schema";

export default function Home() {
  const { data: competitions = [], isLoading } = useQuery<Competition[]>({
    queryKey: ["/api/competitions"],
  });

  const [filteredCompetitions, setFilteredCompetitions] = useState<Competition[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");

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
      
      {/* Welcome Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold">
              <span className="gradient-text">Welcome Back!</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Ready to win big? Check out our latest competitions below.
            </p>
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
      <section className="py-16">
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
                <CompetitionCard key={competition.id} competition={competition} authenticated={true} />
              ))}
            </div>
          )}
          
          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="bg-muted text-muted-foreground px-8 py-4 rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors" data-testid="button-load-more">
              LOAD MORE COMPETITIONS
            </button>
          </div>
        </div>
      </section>

      <Testimonials />
      <Footer />
    </div>
  );
}
