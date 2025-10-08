import React, { useEffect, useRef, useState } from "react";
import { Competition } from "@shared/schema";
import scratchSoundFile from "../../../../attached_assets/assets_sounds_sound_scratch.mp3";

interface ScratchCardProps {
  competition: Competition;
  onClose: () => void;
  onPurchase: () => void;
  isPurchasing: boolean;
}

const CSS_WIDTH = 500;
const CSS_HEIGHT = 300;
const AUTO_CLEAR_THRESHOLD = 0.7;
const SAMPLE_GAP = 4;

export default function ScratchCard({
  competition,
  onClose,
  onPurchase,
  isPurchasing,
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [percentScratched, setPercentScratched] = useState(0);

  // 🎵 Add scratch sound
  const scratchSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    scratchSoundRef.current = new Audio(scratchSoundFile); // your scratch sound file
    scratchSoundRef.current.loop = true;
    scratchSoundRef.current.volume = 0.4; // softer volume
    initCanvas();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (scratchSoundRef.current) {
        scratchSoundRef.current.pause();
        scratchSoundRef.current.currentTime = 0;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const brush = 25;
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

  let total = 0,
    cleared = 0;
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

  // ✅ Always auto-clear once threshold reached (even if still scratching)
  if (percent >= AUTO_CLEAR_THRESHOLD && !revealed) {
    stopScratchSound(); // stop sound immediately
    setRevealed(true);
    // small delay for natural feel
    setTimeout(() => {
      clearOverlayInstant();
        
    }, 300);
  }
}


  // 🎵 Start sound when scratching
 function startScratchSound() {
  if (revealed) return; // 🧠 Don't start sound if card already revealed
  const sound = scratchSoundRef.current;
  if (sound && sound.paused) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}

  // 🎵 Stop sound when released
  function stopScratchSound() {
    const sound = scratchSoundRef.current;
    if (sound && !sound.paused) {
      sound.pause();
    }
  }

  // Mouse handlers
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

  function handleMouseUp() {
  drawingRef.current = false;
  stopScratchSound();
  // ✅ Force one last check when user releases
  checkPercentScratched(true);
}

  // Touch handlers
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

function handleTouchEnd() {
  drawingRef.current = false;
  stopScratchSound();
  // ✅ Force one last check when user releases
  checkPercentScratched(true);
}

  function resetCard() {
    initCanvas();
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl border border-border p-8 max-w-2xl w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold gradient-text">SCRATCH CARD</h2>
          <p className="text-muted-foreground">{competition.title}</p>

          <div className="relative mx-auto" style={{ width: CSS_WIDTH, height: CSS_HEIGHT }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-yellow-500 to-primary rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-foreground mb-2">
                  {!revealed ? "£500" : "YOU WIN £500!"}
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
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </div>

          <div className="flex gap-4 justify-center mt-6">
            <button
              onClick={resetCard}
              className="bg-muted text-muted-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              RESET DEMO
            </button>
            <button
              onClick={onPurchase}
              disabled={isPurchasing}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPurchasing ? "PURCHASING..." : "BUY REAL CARD"}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <i className="fas fa-times text-xl" />
        </button>
      </div>
    </div>
  );
}
