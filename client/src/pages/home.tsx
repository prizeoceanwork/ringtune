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
import { Link } from "wouter";

import { useLocation } from "wouter";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth() as { isAuthenticated: boolean; user: User | null };
  const queryClient = useQueryClient();
const [, setLocation] = useLocation();

  const { data: competitions = [], isLoading } = useQuery<Competition[]>({
    queryKey: ["/api/competitions"],
  });




  const [filteredCompetitions, setFilteredCompetitions] = useState<Competition[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");


  useEffect(() => {
  if (!isAuthenticated) {
    // Hide instant competitions for guests
    setFilteredCompetitions(
      competitions.filter((c) => c.type !== "instant")
    );
  } else {
    setFilteredCompetitions(competitions);
  }
}, [competitions, isAuthenticated]);




const handleFilterChange = (filterType: string) => {
  setActiveFilter(filterType);

  if (filterType === "all") {
    setFilteredCompetitions(competitions);
    setLocation("/"); // stay home instantly
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

      {/* Main Section */}
      <section className="py-16">
      <div className="container mx-auto px-4">
        {isLoading ? (
          <p className="text-center text-muted-foreground">
            Loading competitions...
          </p>
        ) : filteredCompetitions.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        ) : (
          <div className="text-center text-xl text-muted-foreground">
            No competitions found.
          </div>
        )}
      </div>
      </section>

      {/* Result Modal */}
    
      {/* <Testimonials /> */}
      <Footer />
    </div>
  );
}
