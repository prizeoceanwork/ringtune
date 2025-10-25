import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { useAuth } from "@/hooks/useAuth";
import { Competition } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";

const Instant = () => {
  const { isAuthenticated } = useAuth();
  const { data: competitions = [] } = useQuery({
    queryKey: ["/api/competitions"],
  });

  const [filteredCompetitions, setFilteredCompetitions] = useState<Competition[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setFilteredCompetitions(competitions.filter((c) => c.type !== "instant"));
    } else {
      setFilteredCompetitions(competitions);
    }
  }, [competitions, isAuthenticated]);

  const handleFilterChange = (filterType: string) => {
    setActiveFilter(filterType);

    if (filterType === "all") {
      setFilteredCompetitions(competitions);
      setLocation("/");
    } else if (filterType === "spin") {
      setLocation("/spin-wheel");
    } else if (filterType === "scratch") {
      setLocation("/scratch-card");
    } else if (filterType === "instant") {
      setLocation("/instant");
    } else {
      setFilteredCompetitions(competitions.filter((c) => c.type === filterType));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
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

      {/* Filter Buttons */}
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
                    : "bg-muted gradient hover:bg-primary hover:text-primary-foreground"
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

      {/* Message with height */}
      <section className="flex-grow flex items-center justify-center py-32">
        <p className="text-center text-xl text-muted-foreground">
          Instant Win games coming soon! Stay tuned.
        </p>
      </section>

      <Footer />
    </div>
  );
};

export default Instant;
