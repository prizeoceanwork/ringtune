import { useState, useRef, useEffect } from "react";
import { Competition } from "@shared/schema";

interface ScratchCardProps {
  competition: Competition;
  onClose: () => void;
  onPurchase: () => void;
  isPurchasing: boolean;
}

export default function ScratchCard({ competition, onClose, onPurchase, isPurchasing }: ScratchCardProps) {
  const [isScratching, setIsScratching] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 300;
    canvas.height = 200;

    // Draw scratch surface
    ctx.fillStyle = '#999';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add scratch text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDemo) return;
    setIsScratching(true);
    scratch(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isScratching && isDemo) {
      scratch(e);
    }
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  const scratch = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create scratch effect
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, 2 * Math.PI);
    ctx.fill();

    // Update scratch progress (simplified)
    setScratchProgress(prev => Math.min(prev + 2, 100));
  };

  const resetCard = () => {
    setScratchProgress(0);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#999';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-xl border border-border p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold gradient-text" data-testid="heading-scratch-card">
            SCRATCH CARD
          </h2>
          <p className="text-muted-foreground">
            {competition.title}
          </p>
          
          {/* Scratch Card */}
          <div className="relative mx-auto" style={{ width: 300, height: 200 }}>
            {/* Prize underneath */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-yellow-500 to-primary rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-foreground mb-2">
                  {isDemo ? "£500" : "?"}
                </div>
                <div className="text-lg text-primary-foreground">
                  {isDemo ? "DEMO WIN!" : "SCRATCH TO REVEAL"}
                </div>
              </div>
            </div>
            
            {/* Scratch surface */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 rounded-xl cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              data-testid="scratch-surface"
            />
          </div>

          <div className="space-y-4">
            <p className="text-lg">
              Cost per card: <span className="text-primary font-bold">£{parseFloat(competition.ticketPrice).toFixed(2)}</span>
            </p>
            
            {scratchProgress > 50 && isDemo && (
              <div className="bg-primary/20 border border-primary rounded-lg p-4">
                <p className="text-primary font-bold">Demo Complete!</p>
                <p className="text-sm text-muted-foreground">Purchase a real card to win actual prizes!</p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button 
                onClick={resetCard}
                className="bg-muted text-muted-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                data-testid="button-reset-demo"
              >
                RESET DEMO
              </button>
              <button 
                onClick={onPurchase}
                disabled={isPurchasing}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                data-testid="button-buy-card"
              >
                {isPurchasing ? "PURCHASING..." : "BUY REAL CARD"}
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              This is a demo card. Purchase to play for real prizes!
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          data-testid="button-close-scratch-card"
        >
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>
    </div>
  );
}
