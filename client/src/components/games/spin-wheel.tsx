import { useState } from "react";
import { Competition } from "@shared/schema";

interface SpinWheelProps {
  competition: Competition;
  onClose: () => void;
  onPurchase: () => void;
  isPurchasing: boolean;
}

export default function SpinWheel({ competition, onClose, onPurchase, isPurchasing }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const prizes = competition.prizeData as any[] || [
    { amount: 10, probability: 0.3 },
    { amount: 25, probability: 0.25 },
    { amount: 100, probability: 0.2 },
    { amount: 500, probability: 0.15 },
    { amount: 1000, probability: 0.05 },
    { amount: 5000, probability: 0.03 },
    { amount: 25000, probability: 0.015 },
    { amount: 75000, probability: 0.005 },
  ];

  const handleSpin = () => {
    setIsSpinning(true);
    const spinRotation = Math.random() * 360 + 720; // At least 2 full rotations
    setRotation(prev => prev + spinRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      // In a real implementation, this would show the actual prize won
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-xl border border-border p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold gradient-text" data-testid="heading-spin-wheel">
            SPIN THE WHEEL
          </h2>
          <p className="text-muted-foreground">
            {competition.title}
          </p>
          
          {/* Wheel Container */}
          <div className="wheel-container relative w-80 h-80 mx-auto">
            <div 
              className="wheel w-full h-full rounded-full border-4 border-primary relative overflow-hidden transition-transform duration-3000 ease-out"
              style={{ transform: `rotate(${rotation}deg)` }}
              data-testid="wheel-spinner"
            >
              {/* Wheel segments */}
              {prizes.map((prize, index) => {
                const segmentAngle = 360 / prizes.length;
                const rotation = index * segmentAngle;
                const colors = [
                  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
                  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-primary'
                ];
                
                return (
                  <div
                    key={index}
                    className={`absolute w-1/2 h-1/2 ${colors[index % colors.length]} flex items-start justify-center pt-8`}
                    style={{
                      transformOrigin: '100% 100%',
                      transform: `rotate(${rotation}deg)`,
                      clipPath: `polygon(0 0, ${100 - (100 / prizes.length)}% 0, 100% 100%)`,
                    }}
                  >
                    <span className="text-white font-bold text-sm -rotate-45">
                      £{prize.amount}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Wheel pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary"></div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-lg">
              Cost per spin: <span className="text-primary font-bold">£{parseFloat(competition.ticketPrice).toFixed(2)}</span>
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={handleSpin}
                disabled={isSpinning}
                className="bg-muted text-muted-foreground px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
                data-testid="button-demo-spin"
              >
                {isSpinning ? "SPINNING..." : "DEMO SPIN"}
              </button>
              <button 
                onClick={onPurchase}
                disabled={isPurchasing}
                className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                data-testid="button-buy-spin"
              >
                {isPurchasing ? "PURCHASING..." : "BUY & SPIN"}
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Demo spin for preview only. Purchase to play for real prizes!
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          data-testid="button-close-spin-wheel"
        >
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>
    </div>
  );
}
