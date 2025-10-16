import React, { useRef, useEffect, useState } from "react";
import wheelcirclevideo from "../../../../attached_assets/a.mp4";
import wheelcirclebackgroundvideo from "../../../../attached_assets/b.mp4";
import AustonMartin from "../../../../attached_assets/spin/Aston Martin.png";
import Audi from "../../../../attached_assets/spin/Audi.png";
import Bentley from "../../../../attached_assets/spin/Bentley.png";
import BMW from "../../../../attached_assets/spin/BMW.png";
import Ferrari from "../../../../attached_assets/spin/Ferrari.png";
import Ford from "../../../../attached_assets/spin/Ford.png";
import Honda from "../../../../attached_assets/spin/Honda.png";
import Jaguar from "../../../../attached_assets/spin/Jaguar.png";
import Lamborghini from "../../../../attached_assets/spin/Lamborghini.png";
import LandRover from "../../../../attached_assets/spin/Land Rover.png";
import Lexus from "../../../../attached_assets/spin/Lexus.png";
import Maserati from "../../../../attached_assets/spin/Maserati.png";
import McLaren from "../../../../attached_assets/spin/McLaren.png";
import MarcedesBenz from "../../../../attached_assets/spin/Mercedes-Benz.png";
import Nissan from "../../../../attached_assets/spin/Nissan.png";
import Porsche from "../../../../attached_assets/spin/Porsche.png";
import RollsRoyce from "../../../../attached_assets/spin/Rolls-Royce.png";
import Toyota from "../../../../attached_assets/spin/Toyota.png";
import VW from "../../../../attached_assets/spin/VW.png";
import wheelbg from "../../../../attached_assets/wheel.png"

interface SpinWheelProps {
  onSpinComplete: (winnerSegment: number, winnerLabel: string, winnerPrize: any) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ onSpinComplete, isSpinning, setIsSpinning }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<{
    [key: string]: HTMLImageElement;
  }>({});
  
  // Define prizes with amounts for each segment
  const segments = [
    { label: "Aston Martin", color: "#134A3C", icon: AustonMartin, amount: 150 },
    { label: "Audi", color: "#0CBDF8", icon: Audi, amount: "3000 Ringtones" },
    { label: "Bentley", color: "#66C72D", icon: Bentley, amount: 250 },
    { label: "BMW", color: "#D69E1C", icon: BMW, amount: 50 },
    { label: "Nice Try", color: "#4B5563", icon: "❌", amount: 0 },
    
    { label: "Ferrari", color: "#C2586D", icon: Ferrari, amount: 500 },
    { label: "Ford", color: "#190B89", icon: Ford, amount: "100 Ringtones" },
    { label: "Honda", color: "#821A93", icon: Honda, amount: "150 Ringtones" },
    { label: "Jaguar", color: "#1CC2A6", icon: Jaguar, amount: "1000 Ringtones" },
    { label: "Nice Try", color: "#4B5563", icon: "❌", amount: 0 },
    
    { label: "Lamborghini", color: "#F472B6", icon: Lamborghini, amount: 90 },
    { label: "Land Rover", color: "#9CA3AF", icon: LandRover, amount: "2000 Ringtones" },
    { label: "Lexus", color: "#D97706", icon: Lexus, amount: "850 Ringtones" },
    { label: "Maserati", color: "#7C3AED", icon: Maserati, amount: 75 },
    { label: "McLaren", color: "#DB2777", icon: McLaren, amount: 70 },
    { label: "Nice Try", color: "#4B5563", icon: "❌", amount: 0 },

    { label: "Mercedes-Benz", color: "#16A34A", icon: MarcedesBenz, amount: 60 },
    { label: "Nissan", color: "#DC2626", icon: Nissan, amount: "50 Ringtones" },
    { label: "Porsche", color: "#2563EB", icon: Porsche, amount: 80 },
    { label: "Rolls-Royce", color: "#9333EA", icon: RollsRoyce, amount: 1000 },
    { label: "Toyota", color: "#EAB308", icon: Toyota, amount: "250 Ringtones" },
    { label: "Volkswagen", color: "#0891B2", icon: VW, amount: "450 Ringtones" },
    { label: "Nice Try", color: "#4B5563", icon: "❌", amount: 0 },
  ];
  
  // Load all images
  const [rotation, setRotation] = useState((2 * Math.PI) / segments.length/ 1.5);
  useEffect(() => {
    const loadImages = async () => {
      const images: { [key: string]: HTMLImageElement } = {};
      
      for (const segment of segments) {
        if (typeof segment.icon === "string" && segment.icon.endsWith(".png")) {
          const img = new Image();
          img.src = segment.icon;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          images[segment.label] = img;
        }
      }

      setLoadedImages(images);
    };

    loadImages();
  }, []);

  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx, cy) - 20;
    const segAngle = (2 * Math.PI) / segments.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    segments.forEach((s, i) => {
      const start = i * segAngle + angle;
      const end = start + segAngle;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = s.color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw icon and text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + segAngle / 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";

      const icon = s.icon;
      if (typeof icon === "string" && loadedImages[s.label]) {
        const img = loadedImages[s.label];
        const imgSize = radius * 0.14;
        ctx.drawImage(
          img,
          radius * 0.75 - imgSize / 2,
          -imgSize / 2.5,
          imgSize,
          imgSize
        );
      } else if (typeof icon === "string" && !icon.endsWith(".png")) {
        ctx.font = `bold ${radius * 0.1}px Arial`;
        ctx.fillText(icon, radius * 0.75, radius * 0.04);
      } else {
        ctx.font = `${radius * 0.04}px Arial`;
        ctx.fillText("?", radius * 0.65, 0);
      }


      ctx.restore();
    });

    // Inner circle
    const cRadius = radius * 0.45;
    ctx.beginPath();
    ctx.arc(cx, cy, cRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(0, 0, 0, 0.97)";
    ctx.fill();
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 6;
    ctx.stroke();

    // Winner text
    if (!isSpinning && winner) {
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${radius * 0.07}px Arial`;
      ctx.fillText(winner, cx, cy - 20);
    }
  };

  const getWinner = (angle: number) => {
    const segAngle = (2 * Math.PI) / segments.length;
    const normalized = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const adjusted = (normalized + Math.PI / 2) % (2 * Math.PI);
    const index = Math.floor(
      (segments.length - adjusted / segAngle) % segments.length
    );
    return {
      index,
      label: segments[index].label,
      prize: {
        brand: segments[index].label,
        amount: segments[index].amount
      }
    };
  };

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWinner(null);

    const totalRotations = 5;
    const segAngle = (2 * Math.PI) / segments.length;
    const randomSegment = Math.floor(Math.random() * segments.length);
    const finalOffset = randomSegment * segAngle + Math.random() * segAngle * 0.5;
    const target = rotation + totalRotations * 2 * Math.PI + finalOffset;

    const duration = 5000;
    const start = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = rotation + eased * (target - rotation);
      drawWheel(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const finalRotation = target % (2 * Math.PI);
        setRotation(finalRotation);
        
        const winnerResult = getWinner(target);
        setWinner(winnerResult.label);
        setIsSpinning(false);
        
        // Call the callback with winner information including the full prize
        onSpinComplete(winnerResult.index, winnerResult.label, winnerResult.prize);
      }
    };

    requestAnimationFrame(animate);
  };

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.parentElement) return;
      const size = Math.min(canvas.parentElement.clientWidth, 600);
      canvas.width = size;
      canvas.height = size;
      drawWheel(rotation);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [rotation, isSpinning, winner, loadedImages]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden">
      <h2 className="text-3xl z-20 mb-10 font-bold gradient-text" data-testid="heading-spin-wheel">
        SPIN THE WHEEL
      </h2>

      {/* background video */}
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src={wheelcirclebackgroundvideo} type="video/mp4" />
      </video>

      <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center z-10">
        <img
          src={wheelbg}
          alt="Wheel Ring"
          className="absolute w-full h-full object-contain z-10 pointer-events-none"
        />
        <canvas
          ref={canvasRef}
          className="w-[88%] h-[88%] rounded-full"
        />

        {/* show video in center when spinning or idle (no winner) */}
        {(!winner || isSpinning) && (
          <video
            autoPlay
            loop
            muted
            className="absolute w-2/5 h-2/5 rounded-full object-cover"
          >
            <source src={wheelcirclevideo} type="video/mp4" />
          </video>
        )}

        {/* show SPIN button only when not spinning */}
        {!isSpinning && (
          <button
            onClick={spinWheel}
            className="absolute bottom-[40%] sm:bottom-[45%] 
                       px-2 py-1 sm:px-4 sm:py-2 
                       bg-yellow-400 rounded-[4px] 
                       hover:bg-yellow-500 text-black font-bold 
                       text-sm sm:text-md 
                       shadow-xl transition-all"
          >
            {winner ? "SPIN AGAIN" : "SPIN WHEEL"}
          </button>
        )}
      </div>

      <style>{`
        .clip-triangle {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
      `}</style>
    </div>
  );
};

export default SpinWheel;