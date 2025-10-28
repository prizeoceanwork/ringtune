import React, { useRef, useEffect, useState } from "react";
import R_Prize from "../../../../attached_assets/R_prize.png"

interface SpinWheelProps {
  onSpinComplete: (winnerSegment: number, winnerLabel: string, winnerPrize: any) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  ticketCount?: number;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ onSpinComplete, isSpinning, setIsSpinning  ,ticketCount}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<{
    [key: string]: HTMLImageElement;
  }>({});

  
  // Define prizes with amounts for each segment
  const segments = [
    { label: "Aston Martin", color: "#134A3C", icon: "https://res.cloudinary.com/dziy5sjas/image/upload/v1761047801/Aston_Martin_v6gszj.png", amount: 0.15 },
    { label: "Audi", color: "#0CBDF8", icon: "https://res.cloudinary.com/dziy5sjas/image/upload/v1761047801/Audi_nw9i5h.png", amount: "3000 Ringtones" },
    { label: "Bentley", color: "#66C72D", icon: "https://res.cloudinary.com/dziy5sjas/image/upload/v1761047801/Bentley_nysafz.png", amount: 0.25 },
    { label: "BMW", color: "#D69E1C", icon: "https://res.cloudinary.com/dziy5sjas/image/upload/v1761047801/BMW_i0tqyy.png", amount: 0.50 },
    { label: "Mini", color: "#57d61cff", icon: "https://res.cloudinary.com/dziy5sjas/image/upload/v1761047805/Mini_xptdev.png", amount: 0.55 },
    { label: "Nice Try", color: "#4B5563", icon: "❌", amount: 0 },
    
    { label: "Ferrari", color: "#C2586D", icon: "https://res.cloudinary.com/dziy5sjas/image/upload/v1761047802/Ferrari_dah6eg.png", amount: 0.50 },
    { label: "Ford", color: "#190B89", icon: "https://res.cloudinary.com/dziy5sjas/image/upload/v1761047802/Ford_vmtbt3.png", amount: "100 Ringtones" },
    { label: "Honda", color: "#821A93", icon: "https://res.cloudinary.com/dziy5sjas/image/upload/v1761047803/Honda_i7cdnx.png", amount: "150 Ringtones" },
    { label: "Jaguar", color: "#1CC2A6", icon: "https://res.cloudinary.com/dziy5sjas/image/upload/v1761047803/Jaguar_zqxaro.png", amount: "1000 Ringtones" },
    { label: "Nice Try", color: "#4B5563", icon: "❌", amount: 0 },
    
    { label: "Lamborghini", color: "#F472B6", icon: "https://res.cloudinary.com/dziy5sjas/image/upload/v1761047803/Lamborghini_putnai.png", amount: 0.90 },
    { label: "Land Rover", color: "#9CA3AF", icon: "https://res.cloudinary.com/dziy5sjas/image/upload/v1761047803/Land_Rover_qw3sbi.png", amount: "2000 Ringtones" },
    { label: "Lexus", color: "#D97706", icon: "https://res.cloudinary.com/dziy5sjas/image/upload/v1761047804/Lexus_gmipqr.png", amount: "850 Ringtones" },
    { label: "Maserati", color: "#7C3AED", icon: "https://res.cloudinary.com/dziy5sjas/image/upload/v1761047804/Maserati_yw5d6h.png", amount: 5 },
    { label: "McLaren", color: "#DB2777", icon: "https://res.cloudinary.com/dziy5sjas/image/upload/v1761047805/McLaren_xs6gby.png", amount: 0.70 },
    { label: "Nice Try", color: "#4B5563", icon: "❌", amount: 0 },

    { label: "Mercedes-Benz", color: "#16A34A", icon: "https://res.cloudinary.com/dziy5sjas/image/upload/v1761047804/Mercedes-Benz_anjfrx.png", amount: 0.60 },
    { label: "Nissan", color: "#DC2626", icon: "https://res.cloudinary.com/dziy5sjas/image/upload/v1761047801/Nissan_vs45zn.png", amount: "50 Ringtones" },
    { label: "Porsche", color: "#2563EB", icon: "https://res.cloudinary.com/dziy5sjas/image/upload/v1761047801/Porsche_gqdfsm.png", amount: 0.80 },
    { label: "R", color: "#4B5563", icon: R_Prize, amount: 100 },
    { label: "Rolls-Royce", color: "#9333EA", icon: "https://res.cloudinary.com/dziy5sjas/image/upload/v1761047802/Rolls-Royce_qdjhyx.png", amount: 0.10 },
    { label: "Toyota", color: "#EAB308", icon: "https://res.cloudinary.com/dziy5sjas/image/upload/v1761047802/Toyota_aaugrp.png", amount: "250 Ringtones" },
    { label: "Volkswagen", color: "#0891B2", icon: "https://res.cloudinary.com/dziy5sjas/image/upload/v1761047803/VW_ct3imm.png", amount: "450 Ringtones" },
    { label: "Nice Try", color: "#4B5563", icon: "❌", amount: 0 },
  ];
  
  // Load all images
  const [rotation, setRotation] = useState((2 * Math.PI) / segments.length/4.5);
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
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden z-10">

      {/* background video */}
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="https://res.cloudinary.com/dziy5sjas/video/upload/v1761231208/backgroundwheelvideo_cjhrwq.mp4" type="video/mp4" />
      </video>

      <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center z-10">

         {/* {ticketCount !== undefined && (
    <div className="absolute -top-20 right-65 bg-yellow-400 text-black px-3 py-2 rounded-sm text-sm font-bold shadow-md z-20">
       Available Ticket{ticketCount !== 1 ? "s" : ""} :{ticketCount} 
    </div>
  )} */}
        <img
          src="https://res.cloudinary.com/dziy5sjas/image/upload/v1761047804/wheel_basnqc.png"
          alt="Wheel Ring"
          className="absolute w-full h-full object-contain z-10 pointer-events-none"
        />
        <canvas
          ref={canvasRef}
          className="w-[88%] h-[88%] rounded-full"
        />

       
        {/* show video in center when spinning or idle (no winner) */}
        {(winner || isSpinning) && (
          <video
            autoPlay
            loop
            muted
            className="absolute w-2/5 h-2/5 rounded-full object-cover"
          >
            <source src="https://res.cloudinary.com/dziy5sjas/video/upload/v1761140835/Middlevideo_s9eiiy.mp4" type="video/mp4" />
          </video>
        )}
       <video
            autoPlay
            loop
            muted
            className="absolute w-2/5 h-2/5 rounded-full object-cover"
          >
            <source src="https://res.cloudinary.com/dziy5sjas/video/upload/v1761140835/Middlevideo_s9eiiy.mp4" type="video/mp4" />
          </video>
        {/* show SPIN button only when not spinning */}
        {!isSpinning && (
          <button
            onClick={spinWheel}
            className="absolute bottom-[38%] sm:bottom-[38%] 
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
      `}</style>
      <div className="h-full sm:h-[300px] w-full sm:w-[400px] bg-black mb-0 sm:mb-6 z-20">

      <div className="flex flex-col items-center gap-3 mt-8 w-full max-w-xs z-20 relative">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-full text-center">
            <div className="flex justify-between text-yellow-300 font-semibold text-lg w-3/4 mx-auto">
              <span>Spin {i + 1}</span>
              <span className="text-gray-300  text-sm">NOT SPUN</span>
            </div>
            <div className="h-[2px] bg-yellow-400 mt-2 mb-1 w-3/4 mx-auto"></div>
          </div>
        ))}
      </div>


      {/* Buttons */}
      <div className="flex justify-center  gap-6 mt-6 relative z-20">
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
   {/* Spins list (vertical) */}


    </div>
  );
};

export default SpinWheel;