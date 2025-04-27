
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
  
  // Map of sound effects to their paths
  const soundMap: Record<SoundEffect, string> = {
    click: "https://assets.mixkit.co/sfx/preview/mixkit-simple-click-tone-1112.mp3",
    success: "https://assets.mixkit.co/sfx/preview/mixkit-game-level-completed-2059.mp3",
    fail: "https://assets.mixkit.co/sfx/preview/mixkit-negative-tone-interface-tap-2584.mp3",
    gameOver: "https://assets.mixkit.co/sfx/preview/mixkit-player-losing-or-failing-2042.mp3",
    move: "https://assets.mixkit.co/sfx/preview/mixkit-quick-jump-arcade-game-239.mp3"
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
