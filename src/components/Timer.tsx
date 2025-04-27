
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

type TimerProps = {
  isRunning: boolean;
  onTimeUp?: () => void;
  timeLimit?: number; // in seconds, undefined means no limit
  onTimeUpdate?: (time: number) => void;
};

const Timer = ({ isRunning, onTimeUp, timeLimit, onTimeUpdate }: TimerProps) => {
  const [time, setTime] = useState(0);
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          
          if (onTimeUpdate) {
            onTimeUpdate(newTime);
          }
          
          if (timeLimit && newTime >= timeLimit) {
            if (onTimeUp) {
              onTimeUp();
            }
            if (interval) {
              clearInterval(interval);
            }
          }
          
          return newTime;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, onTimeUp, timeLimit, onTimeUpdate]);
  
  // Reset timer when game starts/restarts
  useEffect(() => {
    if (!isRunning) {
      setTime(0);
    }
  }, [isRunning]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };
  
  return (
    <div className="flex items-center justify-center space-x-2 bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
      <Clock className="h-4 w-4 text-primary" />
      <span className="font-mono font-medium">{formatTime(time)}</span>
    </div>
  );
};

export default Timer;
