import { useState } from "react";
import { Competition } from "@shared/schema";
import wheelbg from "../../../../attached_assets/wheel.png"
import wheelcirclevideo from "../../../../attached_assets/a.mp4"
import wheelcirclebackgroundvideo from "../../../../attached_assets/b.mp4"

interface SpinWheelProps {
  competition: Competition;
  onClose: () => void;
  onPurchase: () => void;
  isPurchasing: boolean;
}

export default function SpinWheel({ competition, onPurchase, isPurchasing }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<any>(null);
  const [transitionEnabled, setTransitionEnabled] = useState(false);

  const prizes = competition.prizeData as any[] || [
    { amount: 10, probability: 0.3 },
    { amount: 25, probability: 0.25 },
    { amount: 10, probability: 0.2 },
    { amount: 50, probability: 0.15 },
    { amount: 100, probability: 0.05 },
    { amount: 5000, probability: 0.03 },
    { amount: 250, probability: 0.015 },
    { amount: 750, probability: 0.005 },
  ];


const handleSpin = () => {
  if (isSpinning) return;
  setIsSpinning(true);
  setWonPrize(null);

  const spinCount = 5; 
  const segmentAngle = 360 / prizes.length;
  const randomSegment = Math.floor(Math.random() * prizes.length);

  const finalRotation =
    spinCount * 360 + (360 - (randomSegment * segmentAngle)) - (segmentAngle / 2);

  setTransitionEnabled(false);
  setRotation(0);


  requestAnimationFrame(() => {
    setTransitionEnabled(true);
    setRotation(finalRotation);
  });

  setTimeout(() => {
    setIsSpinning(false);
    setWonPrize(prizes[randomSegment]);
    console.log("Won prize:", prizes[randomSegment]);
  }, 4200);
};

  return (
    <div className="fixed inset-0 bg-black/50 flex pt-20 justify-center z-50 p-4" >
         <video
    src={wheelcirclebackgroundvideo}
    autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 w-full   h-full object-cover "
  />
      <div className="z-20 " onClick={(e) => e.stopPropagation()}>
        <div className="text-center space-y-6 ">
          <h2 className="text-3xl font-bold  gradient-text " data-testid="heading-spin-wheel">
            SPIN THE WHEEL
          </h2>
          
          <p className="text-white pb-10">
            {competition.title}
          </p>
         
          {/* Wheel Container */}
             <img src={wheelbg} alt=""   className=" absolute top-[145px] z-20 left-[650px] w-[620px] h-[620px]"/>
            
         <div className="wheel-container relative w-[500px] h-[500px] mx-auto">
  {/* Spinning wheel */}
  <div
    className="wheel w-full h-full rounded-full border-4  border-primary relative overflow-hidden"
    style={{
      transform: `rotate(${rotation}deg)`,
      transition: transitionEnabled
        ? "transform 4s cubic-bezier(0.33,1,0.68,1)"
        : "none",
       
    }}
    data-testid="wheel-spinner"
  >
    {/* Wheel segments */}
    {prizes.map((prize, index) => {
      const segmentAngle = 360 / prizes.length;
      const rotation = index * segmentAngle;
      const colors = [
        "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
        "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-primary",
      ];
      return (
        <div
          key={index}
          className={`absolute w-1/2 h-1/2 ${colors[index % colors.length]} flex items-start justify-center pt-8`}
          style={{
            transformOrigin: "100% 100%",
            transform: `rotate(${rotation}deg)`,
            clipPath: `polygon(0 0, ${120 - 100 / prizes.length}% 0, 100% 100%)`,
          }}
        >
          <span className="text-white font-bold text-xs ml-14 -rotate-[20deg]">
            £{prize.amount}
          </span>
        </div>
      );
    })}
  </div>

{/* Center circle */}
<div className="absolute inset-0 flex items-center justify-center z-20">
  <div className="w-40 h-40 bg-white rounded-full border-4 border-primary flex flex-col items-center justify-center shadow-lg text-center overflow-hidden relative">
    {isSpinning ? (
      // While spinning → video only
      <video
        src={wheelcirclevideo}
        autoPlay
        loop
        muted
        className="w-full h-full object-cover rounded-full"
      />
    ) : wonPrize ? (
      // Winner result + spin button
      <>
        <span className="text-sm font-bold text-primary z-10">
          £{wonPrize.amount}
        </span>
        <button
          onClick={handleSpin}
          className="mt-1 bg-primary text-primary-foreground px-3 py-1  text-xs font-bold hover:opacity-90"
        >
          SPIN
        </button>
      </>
    ) : (
      // Default → video with spin button overlay
      <>
        <video
          src={wheelcirclevideo}
          autoPlay
          loop
          muted
          className="w-full h-full object-cover rounded-full"
        />
        <button
          onClick={handleSpin}
          className="mb-3 absolute bottom-2 bg-primary text-primary-foreground px-3 py-1  text-xs font-bold hover:opacity-90"
        >
          SPIN
        </button>
      </>
    )}
  </div>
</div>


  {/* Pointer */}
  {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-30">
    <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
      <path d="M20 0L40 40H0L20 0Z" fill="#EF4444"/>
    </svg>
  </div> */}
</div>


         

          {/* <div className="space-y-4">
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
                disabled={isPurchasing || isSpinning}
                className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                data-testid="button-buy-spin"
              >
                {isPurchasing ? "PURCHASING..." : "BUY & SPIN"}
              </button>
            </div>
           
          </div> */}
        </div>

      
      </div>
    </div>
  );
}