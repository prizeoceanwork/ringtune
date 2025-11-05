import React, { useRef, useEffect, useState } from "react";
import R_Prize from "../../../../attached_assets/R_prize.png";
import AstonMartin from "../../../../attached_assets/spin/AstonMartin.svg";
import Audi from "../../../../attached_assets/spin/Audi.svg";
import Bentley from "../../../../attached_assets/spin/Bentley.svg";
import BMW from "../../../../attached_assets/spin/BMW.svg";
import Ferrari from "../../../../attached_assets/spin/Ferrari.svg";
import Ford from "../../../../attached_assets/spin/Ford.svg";
import Honda from "../../../../attached_assets/spin/Honda.svg";
import Jaguar from "../../../../attached_assets/spin/Jaguar.svg";
import Lamborghini from "../../../../attached_assets/spin/Lamborghini.svg";
import LandRover from "../../../../attached_assets/spin/LandRover.svg";
import Lexus from "../../../../attached_assets/spin/Lexus.svg";
import Maserati from "../../../../attached_assets/spin/Maserati.svg";
import McLaren from "../../../../attached_assets/spin/McLaren.svg";
import MercedesBenz from "../../../../attached_assets/spin/MercedesBenz.svg";
import MiniCooper from "../../../../attached_assets/spin/MiniCooper.svg";
import Nissan from "../../../../attached_assets/spin/Nissan.svg";
import Porsche from "../../../../attached_assets/spin/Porsche.svg";
import RollsRoyce from "../../../../attached_assets/spin/RollsRoyce.svg";
import Toyota from "../../../../attached_assets/spin/Toyota.svg";
import Volkswagen from "../../../../attached_assets/spin/Volkswagen.svg";


interface SpinWheelProps {
  onSpinComplete: (winnerSegment: number, winnerLabel: string, winnerPrize: any) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  ticketCount?: number;
}

  // Add these functions for localStorage management
const loadSpinHistory = (): { status: string; prize: { brand: string; amount: any } }[] => {
  try {
    const saved = localStorage.getItem('spinWheelHistory');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveSpinHistory = (history: { status: string; prize: { brand: string; amount: any } }[]) => {
  try {
    localStorage.setItem('spinWheelHistory', JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save spin history:', error);
  }
};

const SpinWheel: React.FC<SpinWheelProps> = ({ onSpinComplete, isSpinning, setIsSpinning, ticketCount }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const centerVideoRef = useRef<HTMLVideoElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<{
    [key: string]: HTMLImageElement;
  }>({});

  // Inside your SpinWheel component, add the state:
const [spinHistory, setSpinHistory] = useState<
  { status: string; prize: { brand: string; amount: any } }[]
>([]);

  // Define prizes with amounts for each segment
  const segments = [
    { label: "Aston Martin", color: "#c3cac8ff", icon: AstonMartin, amount: 0.15 },
    
    { label: "Audi", color: "#0CBDF8", icon: Audi, amount: "3000 Ringtones" },
    { label: "Bentley", color: "#66C72D", icon: Bentley, amount: 0.25 },
    { label: "BMW", color: "#D69E1C", icon: BMW, amount: 0.50 },
    
    { label: "Mini Cooper", color: "#57D61C", icon: MiniCooper, amount: 0.55 },
    { label: "Ferrari", color: "#C2586D", icon: Ferrari, amount: 0.50 },
    { label: "Ford", color: "#190B89", icon: Ford, amount: "100 Ringtones" },
    { label: "Honda", color: "#821A93", icon: Honda, amount: "150 Ringtones" },
    { label: "Nice Try", color: "#4B5563", icon: "❌", amount: 0 },
    { label: "Jaguar", color: "#1CC2A6", icon: Jaguar, amount: "1000 Ringtones" },
    { label: "Lamborghini", color: "#F472B6", icon: Lamborghini, amount: 0.90 },
    { label: "Land Rover", color: "#9CA3AF", icon: LandRover, amount: "2000 Ringtones" },
    { label: "Lexus", color: "#D97706", icon: Lexus, amount: "850 Ringtones" },
    
    { label: "Maserati", color: "#7C3AED", icon: Maserati, amount: 5 },
    { label: "McLaren", color: "#DB2777", icon: McLaren, amount: 0.70 },
    { label: "Mercedes Benz", color: "#16A34A", icon: MercedesBenz, amount: 0.60 },
    { label: "Nissan", color: "#DC2626", icon: Nissan, amount: "50 Ringtones" },
    { label: "Nice Try", color: "#4B5563", icon: "❌", amount: 0 },
    { label: "Porsche", color: "#2563EB", icon: Porsche, amount: 0.80 },
    { label: "R", color: "#221f11ff", icon: R_Prize, amount: 100 },
    { label: "Rolls Royce", color: "#9333EA", icon: RollsRoyce, amount: 0.10 },
    { label: "Toyota", color: "#EAB308", icon: Toyota, amount: "250 Ringtones" },
    { label: "Volkswagen", color: "#0891B2", icon: Volkswagen, amount: "450 Ringtones" },
    
  ];

  const [rotation, setRotation] = useState((2 * Math.PI) / segments.length / 1.3);

// Initialize spin history when ticketCount changes
useEffect(() => {
  if (!ticketCount) return;

  const savedHistory = loadSpinHistory();
  
  if (savedHistory.length === ticketCount) {
    setSpinHistory(savedHistory);
  } else if (savedHistory.length > 0) {
    const adjustedHistory = adjustSpinHistoryToCount(savedHistory, ticketCount);
    setSpinHistory(adjustedHistory);
  } else {
    setSpinHistory(
      Array.from({ length: ticketCount }, () => ({
        status: "NOT SPUN",
        prize: { brand: "-", amount: "-" },
      }))
    );
  }
}, [ticketCount]);

// Helper function to adjust spin history
const adjustSpinHistoryToCount = (history: any[], targetCount: number) => {
  if (history.length === targetCount) return history;
  
  if (history.length < targetCount) {
    const newEntries = Array.from({ length: targetCount - history.length }, () => ({
      status: "NOT SPUN",
      prize: { brand: "-", amount: "-" },
    }));
    return [...history, ...newEntries];
  } else {
    return history;
  }
};

// Save to localStorage whenever spinHistory changes
useEffect(() => {
  if (spinHistory.length > 0) {
    saveSpinHistory(spinHistory);
  }
}, [spinHistory]);

  // Load all images
useEffect(() => {
  const loadImages = async () => {
    const images: { [key: string]: HTMLImageElement } = {};

    for (const segment of segments) {
      if (segment.icon === "❌") continue;

      if (typeof segment.icon === "string") {
        const img = new Image();

        // Important: Allow cross-origin for SVG and PNG
        img.crossOrigin = "anonymous";
        img.src = segment.icon;

        // Wait for image load
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
}, [segments]);


  // iOS FIX: Prevent video fullscreen on click
  useEffect(() => {
    const preventVideoFullscreen = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const centerVideo = centerVideoRef.current;
    const backgroundVideo = backgroundVideoRef.current;

    if (centerVideo) {
      centerVideo.addEventListener('click', preventVideoFullscreen);
      centerVideo.addEventListener('touchstart', preventVideoFullscreen);
    }

    if (backgroundVideo) {
      backgroundVideo.addEventListener('click', preventVideoFullscreen);
      backgroundVideo.addEventListener('touchstart', preventVideoFullscreen);
    }

    return () => {
      if (centerVideo) {
        centerVideo.removeEventListener('click', preventVideoFullscreen);
        centerVideo.removeEventListener('touchstart', preventVideoFullscreen);
      }
      if (backgroundVideo) {
        backgroundVideo.removeEventListener('click', preventVideoFullscreen);
        backgroundVideo.removeEventListener('touchstart', preventVideoFullscreen);
      }
    };
  }, []);

  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.imageSmoothingEnabled = false;
    ctx.imageSmoothingQuality = 'high';
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx, cy) * 0.9;
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
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw icon and text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + segAngle / 2);
      
      const icon = s.icon;
      let imgSize = radius * 0.12;
      let iconWidth = imgSize * 1;
      let iconHeight = imgSize * 1;

      if (["Aston Martin", "Audi", "Bentley", "Mini Cooper"].includes(s.label)) {
        imgSize = radius * 0.12;
        iconWidth = imgSize * 1.5;
      }
      if ("Bentley".includes(s.label)) {
        imgSize = radius * 0.10;
        iconWidth = imgSize * 2;
      }
      if ("Mini Cooper".includes(s.label)) {
        imgSize = radius * 0.10;
        iconWidth = imgSize * 2.2;
      }
      if (s.label === "R") {
        imgSize = radius * 0.22;
        iconWidth = imgSize * 1.1;
         iconHeight = imgSize * 1.1; 
      }
      
       if ("Ferrari".includes(s.label)) {
        imgSize = radius * 0.10;
      iconHeight = imgSize * 1.5;
      }
      // Handle emoji case
      if (icon === "❌") {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${radius * 0.10}px Arial`;
        ctx.fillText(icon, radius * 0.85, 0);
      } 
      // Handle loaded images
        else if (loadedImages[s.label]) {
  const img = loadedImages[s.label];

  ctx.save();
  ctx.translate(radius * 0.85, 0);
  ctx.rotate(Math.PI / 2);

  // Detect if it's SVG or PNG
  const isSvg = (img.src || "").toLowerCase().endsWith(".svg");

  // Adjust smoothing depending on format
  ctx.imageSmoothingEnabled = !isSvg; // turn OFF for SVG to keep it sharp
  ctx.imageSmoothingQuality = isSvg ? "high" : "low";

  const drawX = Math.round(-iconWidth / 2);
  const drawY = Math.round(-iconHeight  / 2);
  const drawWidth = Math.round(iconWidth);
  const drawHeight = Math.round(iconHeight );

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}
      // Fallback for unloaded images
      else {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff";
        ctx.font = `${radius * 0.06}px Arial`;
        ctx.fillText("?", radius * 0.75, 0);
      }

      ctx.restore();
    });

    // Draw center text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${radius * 0.06}px Arial`;
    ctx.fillText("RingTone", cx, cy - 30);
    ctx.fillText("Riches", cx, cy - 10);
    ctx.font = `bold ${radius * 0.08}px Arial`;
    ctx.fillStyle = "#FFD700";
    ctx.fillText("SPIN", cx, cy + 15);

    // Winner text
    if (!isSpinning && winner) {
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
      
      onSpinComplete(winnerResult.index, winnerResult.label, winnerResult.prize);

      // ✅ Update spin history
      setSpinHistory((prev) => {
        const updated = [...prev];
        const firstUnspunIndex = updated.findIndex((s) => s.status === "NOT SPUN");
        
        if (firstUnspunIndex !== -1) {
          updated[firstUnspunIndex] = {
            status: "SPUN",
            prize: winnerResult.prize,
          };
        }
        
        return updated;
      });
    }
  };

  requestAnimationFrame(animate);
};

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.parentElement) return;
      const size = Math.min(canvas.parentElement.clientWidth, 601);
      canvas.width = size;
      canvas.height = size;
      drawWheel(rotation);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [rotation, isSpinning, winner, loadedImages]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden z-10">
      {/* Background video - FIXED FOR iOS */}
      <video
        ref={backgroundVideoRef}
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
      >
        <source src="https://res.cloudinary.com/dziy5sjas/video/upload/v1761231208/backgroundwheelvideo_cjhrwq.mp4" type="video/mp4" />
      </video>

      <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center z-10">

        {/* {ticketCount !== undefined && (
    <div className="absolute -top-14 right-65 bg-yellow-400 text-black px-3 py-2 rounded-sm text-sm font-bold shadow-md z-20">
       Available Spin{ticketCount !== 1 ? "s" : ""} :{ticketCount} 
    </div>
  )} */}
       <img
  src="https://res.cloudinary.com/dziy5sjas/image/upload/v1761047804/wheel_basnqc.png"
  alt="Wheel Ring"
  className="absolute -top-4 md:-top-0 inset-0  w-[108%] h-[108%] md:w-full md:h-full object-cover z-20 pointer-events-none"
/>
        
        <canvas
          ref={canvasRef}
          className="w-[100%] h-[100%] sm:w-[99%] sm:h-[99%] md:w-[89%] md:h-[89%] rounded-full"
        />

        {/* Center video - FIXED FOR iOS */}
        <video
          ref={centerVideoRef}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          className="absolute w-36 h-36 sm:w-60 sm:h-60 rounded-full object-cover pointer-events-none"
        >
          <source src="https://res.cloudinary.com/dziy5sjas/video/upload/v1761140835/Middlevideo_s9eiiy.mp4" type="video/mp4" />
        </video>

        {/* SPIN button */}
        {!isSpinning && (
          <button
            onClick={spinWheel}
            className="absolute bottom-[39%] sm:bottom-[40%] 
                       px-2 py-1 
                       bg-yellow-400 rounded-[4px] 
                       hover:bg-yellow-500 text-black font-bold 
                       text-xs sm:text-md 
                       shadow-xl transition-all"
          >
            {winner ? "SPIN" : "SPIN"}
          </button>
        )}
      </div>

      <style>{`
        .clip-triangle {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
        
        /* Additional iOS fixes */
        video {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>

     {/* Replace the current bottom div with this */}
<div className="w-full max-w-2xl mx-auto h-72 mb-5 z-10 bg-black/70 rounded-t-xl mt-10 py-6 overflow-y-scroll px-4 sm:px-6 text-white border-t border-yellow-400">
  <h3 className="text-center text-xl font-bold mb-4 text-yellow-300">
    Spin Wheel Progress
  </h3>
  <div className="z-10 overflow-x-auto">
    <table className="w-full text-sm border-separate border-spacing-y-2">
      <thead>
        <tr className="text-yellow-300 font-semibold text-left">
          <th className="px-3 py-2">#</th>
          <th className="px-3 py-2">Status</th>
          <th className="px-3 py-2">Prize</th>
        </tr>
      </thead>
      <tbody>
        {spinHistory.map((item, i) => (
          <tr key={i} className="bg-gray-800/60 hover:bg-gray-700/80 transition rounded-lg">
            <td className="px-3 py-2 text-yellow-300 font-semibold">Spin {i + 1}</td>
            <td className="px-3 py-2 text-gray-200">{item.status}</td>
            <td className="px-3 py-2 text-green-400 font-bold">
              {typeof item.prize.amount === 'number' 
                ? `$${item.prize.amount}`
                : item.prize.amount.includes('Ringtones')
                ? item.prize.amount
                : item.prize.amount === "-" 
                ? "-"
                : `$${item.prize.amount}`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
      
    </div>
    
  );
};

export default SpinWheel;