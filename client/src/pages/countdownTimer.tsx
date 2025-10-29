import React, { useEffect, useState } from "react";
import Countdown, { zeroPad } from "react-countdown";

interface CountdownTimerProps {
  days?: number; // default = 60
  storageKey?: string; // key to store in localStorage
  onComplete?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  days = 60,
  storageKey = "countdown_start_time",
  onComplete,
}) => {
  const [targetDate, setTargetDate] = useState<Date | null>(null);

  useEffect(() => {
    // Check if a start time already exists
    const storedStartTime = localStorage.getItem(storageKey);

    if (storedStartTime) {
      const start = new Date(storedStartTime);
      const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
      setTargetDate(end);
    } else {
      // Start countdown now and save start time
      const start = new Date();
      localStorage.setItem(storageKey, start.toISOString());
      const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
      setTargetDate(end);
    }
  }, [days, storageKey]);

  // Renderer
  const renderer = ({
    days,
    hours,
    minutes,
    seconds,
    completed,
  }: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    completed: boolean;
  }) => {
    if (completed) {
      return (
        <span className="text-green-500 font-semibold">
          🎉 Countdown complete!
        </span>
      );
    }
    return (
      <div className="flex items-center justify-center gap-3 text-center">
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-yellow-400">{zeroPad(days)}</span>
          <span className="text-sm text-gray-400">Days</span>
        </div>
        <span className="text-yellow-500 font-bold text-2xl">:</span>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-yellow-400">{zeroPad(hours)}</span>
          <span className="text-sm text-gray-400">Hours</span>
        </div>
        <span className="text-yellow-500 font-bold text-2xl">:</span>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-yellow-400">{zeroPad(minutes)}</span>
          <span className="text-sm text-gray-400">Mins</span>
        </div>
        <span className="text-yellow-500 font-bold text-2xl">:</span>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-yellow-400">{zeroPad(seconds)}</span>
          <span className="text-sm text-gray-400">Secs</span>
        </div>
      </div>
    );
  };

  if (!targetDate) return <div>Loading countdown...</div>;

  return (
    <div className="p-4 bg-black/30 rounded-2xl shadow-md w-full max-w-lg mx-auto">
      <Countdown date={targetDate} renderer={renderer} onComplete={onComplete} />
    </div>
  );
};

export default CountdownTimer;
