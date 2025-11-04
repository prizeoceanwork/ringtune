import { useLocation } from "wouter";
import { Competition } from "@shared/schema";

interface CompetitionCardProps {
  competition: Competition;
  authenticated?: boolean;
}

export default function CompetitionCard({ competition, authenticated = false }: CompetitionCardProps) {
  const [, setLocation] = useLocation();

  const handleViewCompetition = () => {
    setLocation(`/competition/${competition.id}`);
  };

  const progressPercentage = competition.maxTickets 
    ? (competition.soldTickets! / competition.maxTickets) * 100 
    : 0;

  // 🟡 Short home page descriptions
  const shortDescription =
    competition.type === "spin"
      ? "Rev it. Spin it. Win it! 🏎️ Unlock massive cash & ringtone rewards – WIN UP TO £15,000 INSTANTLY! 💷"
      : competition.type === "scratch"
      ? "Scratch your way to legendary wins around the world! 🌍💰-WIN UP TO £5,000 INSTANTLY! 💷"
      : "";

  return (
    <>
      <div 
        className="competition-card bg-card h-fit rounded-sm border border-border  overflow-hidden" 
        data-type={competition.type}
        data-testid={`card-competition-${competition.id}`}
      >
        <img 
          src={
            competition.imageUrl ||
            "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
          } 
          alt={competition.title}
          className="w-full h-98 object-cover"
          data-testid={`img-competition-${competition.id}`}
        />

        <div className="p-2 sm:p-6 mb-5 sm:mb-0 space-y-4">
          <h3 
            className="text-sm sm:text-lg font-bold text-foreground " 
            data-testid={`text-title-${competition.id}`}
          >
            {competition.title}
          </h3>

          {/* 🟢 Show mini description only for spin/scratch */}
          {shortDescription && (
            <p className="text-xs sm:text-sm text-muted-foreground ">
              {shortDescription}
            </p>
          )}

          {competition.maxTickets && (
            <div className="bg-muted rounded-lg p-3 mb-4">
              <div className="flex justify-between text-[10px] sm:text-sm text-muted-foreground mb-1">
                <span>{competition.soldTickets} sold</span>
                <span>{competition.maxTickets} total</span>
              </div>
              <div className="bg-background h-2 rounded-full">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                  data-testid={`progress-${competition.id}`}
                ></div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span 
              className="text-md sm:text-2xl font-bold text-primary" 
              data-testid={`text-price-${competition.id}`}
            >
              £{parseFloat(competition.ticketPrice).toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">per entry</span>
          </div>

          <button 
            onClick={handleViewCompetition}
            className="w-full bg-primary text-primary-foreground text-xs md:text-lg py-2 sm:py-3 rounded-sm font-bold hover:opacity-90 transition-opacity"
            data-testid={`button-enter-${competition.id}`}
          >
            {competition.type === "scratch"
              ? "BUY NOW"
              : competition.type === "spin"
              ? "ENTER NOW"
              : "ENTER NOW"}
          </button>
        </div>
      </div>
    </>
  );
}
