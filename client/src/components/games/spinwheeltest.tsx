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

const SpinWheel: React.FC<SpinWheelProps> = ({ onSpinComplete, isSpinning, setIsSpinning, ticketCount }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const centerVideoRef = useRef<HTMLVideoElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<{
    [key: string]: HTMLImageElement;
  }>({});

  // Define prizes with amounts for each segment
  const segments = [
    { label: "Aston Martin", color: "#c3cac8ff", icon: AstonMartin, amount: 0.15 },
    { label: "Audi", color: "#0CBDF8", icon: Audi, amount: "3000 Ringtones" },
    { label: "Bentley", color: "#66C72D", icon: Bentley, amount: 0.25 },
    { label: "BMW", color: "#D69E1C", icon: BMW, amount: 0.50 },
    { label: "Nice Try", color: "#4B5563", icon: "❌", amount: 0 },
    { label: "Mini Cooper", color: "#57D61C", icon: MiniCooper, amount: 0.55 },
    { label: "Ferrari", color: "#C2586D", icon: Ferrari, amount: 0.50 },
    { label: "Ford", color: "#190B89", icon: Ford, amount: "100 Ringtones" },
    { label: "Honda", color: "#821A93", icon: Honda, amount: "150 Ringtones" },
    { label: "Nice Try", color: "#4B5563", icon: "❌", amount: 0 },
    { label: "Jaguar", color: "#1CC2A6", icon: Jaguar, amount: "1000 Ringtones" },
    { label: "Lamborghini", color: "#F472B6", icon: Lamborghini, amount: 0.90 },
    { label: "Land Rover", color: "#9CA3AF", icon: LandRover, amount: "2000 Ringtones" },
    { label: "Lexus", color: "#D97706", icon: Lexus, amount: "850 Ringtones" },
    { label: "Nice Try", color: "#4B5563", icon: "❌", amount: 0 },
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
    { label: "Nice Try", color: "#4B5563", icon: "❌", amount: 0 },
  ];

  const [rotation, setRotation] = useState((2 * Math.PI) / segments.length / 4.5);

  // Load all images
  useEffect(() => {
    const loadImages = async () => {
      const images: { [key: string]: HTMLImageElement } = {};

      for (const segment of segments) {
        if (segment.icon === "❌") continue;

        if (typeof segment.icon === "string") {
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
      
      const icon = s.icon;
      let imgSize = radius * 0.12;
      let iconWidth = imgSize * 1;

      if (["Aston Martin", "Audi", "Bentley", "Mini Cooper"].includes(s.label)) {
        imgSize = radius * 0.12;
        iconWidth = imgSize * 1.5;
      }

      if (s.label === "R") {
        imgSize = radius * 0.22;
        iconWidth = imgSize * 1.1;
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
        ctx.imageSmoothingEnabled = false;
        
        ctx.drawImage(
          img,
          -iconWidth / 2,
          -imgSize / 2,
          iconWidth,
          imgSize
        );
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
        <img
          src="https://res.cloudinary.com/dziy5sjas/image/upload/v1761047804/wheel_basnqc.png"
          alt="Wheel Ring"
          className="absolute w-full h-full object-contain z-10 pointer-events-none"
        />
        
        <canvas
          ref={canvasRef}
          className="w-[88%] h-[88%] rounded-full"
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
            className="absolute bottom-[40%] sm:bottom-[40%] 
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

      <div className="h-full sm:h-[300px] w-full sm:w-[400px] bg-black pb-5 mb-0 sm:mb-6 z-20">
        <div className="flex flex-col ml-10 items-center gap-3 mt-8 w-full max-w-xs z-20 relative">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-full text-center">
              <div className="flex justify-between text-yellow-300 font-semibold text-lg w-3/4 mx-auto">
                <span>Spin {i + 1}</span>
                <span className="text-gray-300 text-sm">NOT SPUN</span>
              </div>
              <div className="h-[2px] bg-yellow-400 mt-2 mb-1 w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-6 mt-6 relative z-20">
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 text-sm rounded-sm shadow-sm disabled:opacity-50"
          >
            SPIN
          </button>
          <button
            onClick={() => alert('Reveal pressed')}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-3 text-xs rounded-sm shadow-sm"
          >
            REVEAL ALL
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpinWheel;