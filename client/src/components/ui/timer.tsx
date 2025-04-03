import { useEffect, useState } from "react";

interface TimerProps {
  duration: number; // in seconds
  elapsed: number; // in seconds
  isRunning: boolean;
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Timer({ 
  duration, 
  elapsed: initialElapsed, 
  isRunning, 
  className = "", 
  showText = true, 
  size = 'md' 
}: TimerProps) {
  const [progress, setProgress] = useState(0);
  const [displayTime, setDisplayTime] = useState("");
  const [elapsed, setElapsed] = useState(initialElapsed);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning) {
      intervalId = setInterval(() => {
        setElapsed(prev => {
          const newElapsed = prev + 1;
          // Calculate progress as a percentage
          const progressPercentage = Math.min(100, (newElapsed / duration) * 100);
          setProgress(progressPercentage);
          
          // Format time for display (MM:SS)
          const remainingSeconds = Math.max(0, duration - newElapsed);
          const minutes = Math.floor(remainingSeconds / 60);
          const seconds = Math.floor(remainingSeconds % 60);
          setDisplayTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          
          return newElapsed;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, duration]);

  // Initial render
  useEffect(() => {
    const progressPercentage = Math.min(100, (initialElapsed / duration) * 100);
    setProgress(progressPercentage);
    
    const remainingSeconds = Math.max(0, duration - initialElapsed);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = Math.floor(remainingSeconds % 60);
    setDisplayTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  }, [initialElapsed, duration]);

  // Calculate the dimensions based on size
  const getSize = () => {
    switch (size) {
      case 'sm': return { svgSize: 36, textSize: 'text-xs', strokeWidth: 2 };
      case 'md': return { svgSize: 48, textSize: 'text-sm', strokeWidth: 3 };
      case 'lg': return { svgSize: 64, textSize: 'text-base', strokeWidth: 4 };
      default: return { svgSize: 48, textSize: 'text-sm', strokeWidth: 3 };
    }
  };

  const { svgSize, textSize, strokeWidth } = getSize();
  const radius = (svgSize / 2) - (strokeWidth * 2);
  const circumference = 2 * Math.PI * radius;
  const dash = (circumference * (100 - progress)) / 100;

  return (
    <div className={`relative ${className}`}>
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        <circle 
          className="text-muted stroke-current"
          fill="none" 
          strokeWidth={strokeWidth}
          cx={svgSize / 2} 
          cy={svgSize / 2} 
          r={radius}
        />
        <circle 
          className="text-primary stroke-current transition-all duration-500 ease-in-out"
          fill="none" 
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dash}
          style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
          cx={svgSize / 2} 
          cy={svgSize / 2} 
          r={radius}
        />
      </svg>
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${textSize} font-medium`}>{displayTime}</span>
        </div>
      )}
    </div>
  );
}
