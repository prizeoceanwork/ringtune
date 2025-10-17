import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Competition } from "@shared/schema";
import scratchSoundFile from "../../../../attached_assets/assets_sounds_sound_scratch.mp3";

interface ScratchCardProps {
  competition: Competition;
  onScratchComplete: (prize: { type: string; value: string }) => void; // ✅ add callback
}

const CSS_WIDTH = 500;
const CSS_HEIGHT = 300;
const AUTO_CLEAR_THRESHOLD = 0.7;
const SAMPLE_GAP = 4;

export default function ScratchCardTest({
  competition,
   onScratchComplete ,

}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [percentScratched, setPercentScratched] = useState(0);
  const queryClient = useQueryClient();
const { toast } = useToast();
const { user } = useAuth();


// const rewardMutation = useMutation({
//   mutationFn: async (data: { prizeType: string; prizeValue: string; competitionId: string }) => {
//     const res = await apiRequest("POST", "/api/scratch/reward", data);
//     return res.json();
//   },
//   onSuccess: (data) => {
//     toast({
//       title: "🎉 Reward Added!",
//       description:
//         data.message ||
//         (data.prizeType === "cash"
//           ? `You’ve received ${data.prizeValue} in your wallet!`
//           : `You’ve earned ${data.prizeValue} ringtone points!`),
//     });

//     // Refresh user wallet/points
//     queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
//   },
//   onError: (error: any) => {
//     toast({
//       title: "Error",
//       description: error.message || "Failed to process reward",
//       variant: "destructive",
//     });
//   },
// });

  // 🎵 Scratch sound
  const scratchSoundRef = useRef<HTMLAudioElement | null>(null);

  // 🎁 Random prize setup
  const cashPrizes = ["$50", "$75", "$100", "$200"];
  const ringtunePrizes = ["50", "100", "250", "500", "1000"];
  const allPrizes = [
    ...cashPrizes.map((c) => ({ type: "cash", value: c })),
    ...ringtunePrizes.map((p) => ({ type: "points", value: p })),
  ];

  const [selectedPrize, setSelectedPrize] = useState(() => {
    const randomIndex = Math.floor(Math.random() * allPrizes.length);
    return allPrizes[randomIndex];
  });

  // 🔹 Initialize Canvas
  useEffect(() => {
    scratchSoundRef.current = new Audio(scratchSoundFile);
    scratchSoundRef.current.loop = true;
    scratchSoundRef.current.volume = 0.4;
    initCanvas();

    const handleMouseUpGlobal = () => {
      drawingRef.current = false;
      stopScratchSound();
      checkPercentScratched(true);
    };

    // Handle when user releases outside canvas
    window.addEventListener("mouseup", handleMouseUpGlobal);
    window.addEventListener("touchend", handleMouseUpGlobal);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mouseup", handleMouseUpGlobal);
      window.removeEventListener("touchend", handleMouseUpGlobal);
    };
  }, []);

  function initCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(CSS_WIDTH * ratio);
    canvas.height = Math.round(CSS_HEIGHT * ratio);
    canvas.style.width = `${CSS_WIDTH}px`;
    canvas.style.height = `${CSS_HEIGHT}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#999";
    ctx.fillRect(0, 0, CSS_WIDTH, CSS_HEIGHT);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("SCRATCH HERE", CSS_WIDTH / 2, CSS_HEIGHT / 2);
    setRevealed(false);
    setPercentScratched(0);
  }

  function clearOverlayInstant() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stopScratchSound();
    setRevealed(true);
    setPercentScratched(100);
  }

  function scratchAt(cssX: number, cssY: number) {
    if (revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const brush = 30;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(cssX, cssY, brush, 0, Math.PI * 2);
    ctx.fill();

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => checkPercentScratched());
    }
  }

  function checkPercentScratched(forceCheck = false) {
  rafRef.current = null;
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h).data;

  let total = 0, cleared = 0;
  for (let y = 0; y < h; y += SAMPLE_GAP) {
    for (let x = 0; x < w; x += SAMPLE_GAP) {
      const alpha = imageData[(y * w + x) * 4 + 3];
      total++;
      if (alpha === 0) cleared++;
    }
  }

  const percent = total ? cleared / total : 0;
  const pct = Math.round(percent * 100);
  setPercentScratched(pct);

  if (percent >= AUTO_CLEAR_THRESHOLD && !revealed) {
    stopScratchSound();
    setRevealed(true);
    setTimeout(() => {
      clearOverlayInstant();

      // ✅ Trigger prize logic after reveal
      onScratchComplete(selectedPrize);
    }, 300);
  }
}


  function startScratchSound() {
    if (revealed) return;
    const sound = scratchSoundRef.current;
    if (sound && sound.paused) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
  }

  function stopScratchSound() {
    const sound = scratchSoundRef.current;
    if (sound && !sound.paused) {
      sound.pause();
    }
  }

  // 🖱 Mouse & Touch handlers
  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    drawingRef.current = true;
    startScratchSound();
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    scratchAt(e.clientX - rect.left, e.clientY - rect.top);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!drawingRef.current) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    scratchAt(e.clientX - rect.left, e.clientY - rect.top);
  }

  function handleTouchStart(e: React.TouchEvent) {
    e.preventDefault();
    drawingRef.current = true;
    startScratchSound();
    const t = e.touches[0];
    if (!t) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    scratchAt(t.clientX - rect.left, t.clientY - rect.top);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!drawingRef.current) return;
    const t = e.touches[0];
    if (!t) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    scratchAt(t.clientX - rect.left, t.clientY - rect.top);
  }
  useEffect(() => {
  if (percentScratched === 0 && revealed === false) {
    // Canvas should be fully covered when reset
    initCanvas();
  }
}, [percentScratched, revealed]);

function resetCard() {
  stopScratchSound();
  setRevealed(false);
  setPercentScratched(0);

  const canvas = canvasRef.current;
  if (canvas) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Clear the canvas completely
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Reset composite operation
      ctx.globalCompositeOperation = "source-over";
      
      // Force a new prize selection FIRST
      const randomIndex = Math.floor(Math.random() * allPrizes.length);
      setSelectedPrize(allPrizes[randomIndex]);
      
      // Then redraw the overlay
      setTimeout(() => {
        initCanvas();
      }, 50);
    }
  }
}


  // 🎉 Prize Display
  const displayPrize =
    selectedPrize.type === "cash"
      ? `YOU WIN ${selectedPrize.value}!`
      : `YOU WIN ${selectedPrize.value} RINGTUNE POINTS!`;

  const unrevealedText =
    selectedPrize.type === "cash"
      ? selectedPrize.value
      : `${selectedPrize.value} RINGTUNE POINTS`;

  return (
    <div
      className=" flex items-center justify-center  p-4"
    >
      <div
        className="p-8 max-w-2xl w-full relative  rounded-xl shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-6">

          <div className="relative mx-auto" style={{ width: CSS_WIDTH, height: CSS_HEIGHT }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-yellow-500 to-primary rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-foreground mb-2">
                  {!revealed ? unrevealedText : displayPrize}
                </div>
                <div className="text-lg text-primary-foreground">
                  {!revealed && "SCRATCH TO REVEAL"}
                </div>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              className="absolute inset-0 rounded-xl cursor-pointer"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            />
          </div>

          <div className="flex gap-4 justify-center mt-6">
            <button
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              onClick={resetCard}
            >
              Scratch Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


