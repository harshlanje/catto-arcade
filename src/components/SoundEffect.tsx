
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
    const audio = new Audio(soundMap[sound]);
    audio.volume = 0.3; // Set volume to 30%
    
    // Preload the audio file
    audio.preload = "auto";
    
    // Load the audio file immediately to prevent delays
    audio.load();
    
    audioRef.current = audio;
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ""; // Clear source
        audioRef.current = null;
      }
    };
  }, [sound]);
  
  useEffect(() => {
    if (play && soundEnabled && audioRef.current) {
      // Reset audio to beginning if it's already playing
      audioRef.current.currentTime = 0;
      
      // Play with minimal delay - use a promise with minimal error handling
      const playPromise = audioRef.current.play();
      
      // Only handle the error if the promise exists
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Failed to play audio:", error);
        });
      }
    }
  }, [play, soundEnabled]);
  
  // This component doesn't render anything
  return null;
};

export default SoundEffect;
