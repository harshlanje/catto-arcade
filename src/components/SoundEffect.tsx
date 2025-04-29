
import { useEffect, useRef } from "react";
import { useGame } from "@/contexts/GameContext";

type SoundEffect = "click" | "success" | "fail" | "gameOver" | "move";

type SoundEffectProps = {
  sound: SoundEffect;
  play: boolean;
};

// A component that plays sound effects
const SoundEffect = ({ sound, play }: SoundEffectProps) => {
  const { soundEnabled } = useGame();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Map of sound effects to their paths (using local files)
  const soundMap: Record<SoundEffect, string> = {
    click: "/sounds/click.mp3",
    success: "/sounds/success.mp3",
    fail: "/sounds/fail.mp3",
    gameOver: "/sounds/game-over.mp3",
    move: "/sounds/move.mp3"
  };
  
  useEffect(() => {
    // Create audio element on mount
    audioRef.current = new Audio(soundMap[sound]);
    audioRef.current.volume = 0.3; // Set volume to 30%
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [sound]);
  
  useEffect(() => {
    if (play && soundEnabled && audioRef.current) {
      // Reset audio to beginning if it's already playing
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.error("Failed to play audio:", error);
      });
    }
  }, [play, soundEnabled]);
  
  // This component doesn't render anything
  return null;
};

export default SoundEffect;
