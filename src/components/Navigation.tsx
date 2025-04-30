
import { Link, useLocation } from "react-router-dom";
import { Volume2, VolumeX, User, Trophy } from "lucide-react";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import SoundEffect from "./SoundEffect";
import { useState } from "react";

const Navigation = () => {
  const location = useLocation();
  const { soundEnabled, toggleSound } = useGame();
  const [playSound, setPlaySound] = useState(false);
  const { user: authUser } = useAuth();
  const { user } = useGame();
  
  const handleToggleSound = () => {
    toggleSound();
    setPlaySound(true);
    setTimeout(() => setPlaySound(false), 100);
  };
  
  return (
    <header className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-md shadow-sm">
      <SoundEffect sound="click" play={playSound} />
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Home link */}
          <Link to="/" className="text-lg md:text-xl font-bold text-primary flex items-center">
            Catto's Arcade
          </Link>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-6">
            <Link 
              to="/" 
              className={`text-sm font-medium ${
                location.pathname === "/" 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Home
            </Link>
            <Link 
              to="/memory-game" 
              className={`text-sm font-medium ${
                location.pathname === "/memory-game" 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Memory Flip
            </Link>
            <Link 
              to="/tic-tac-toe" 
              className={`text-sm font-medium ${
                location.pathname === "/tic-tac-toe" 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Tic Tac Toe
            </Link>
            <Link 
              to="/snake-game" 
              className={`text-sm font-medium ${
                location.pathname === "/snake-game" 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Snake Game
            </Link>
          </nav>
          
          {/* Control Icons */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleToggleSound}
              className="text-muted-foreground hover:text-primary focus:outline-none transition"
              aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
            
            <Link 
              to="/leaderboard" 
              className="text-muted-foreground hover:text-primary focus:outline-none transition"
              aria-label="Leaderboard"
            >
              <Trophy className="h-5 w-5" />
            </Link>
            
            {authUser ? (
              <Link 
                to="/profile" 
                className="flex items-center space-x-1 text-muted-foreground hover:text-primary focus:outline-none transition"
              >
                <span className="text-xl">{user?.avatar || "👤"}</span>
              </Link>
            ) : (
              <Link 
                to="/auth" 
                className="text-muted-foreground hover:text-primary focus:outline-none transition"
                aria-label="Profile"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex justify-around">
          <Link 
            to="/" 
            className={`flex-1 py-3 text-center text-xs ${
              location.pathname === "/" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          <Link 
            to="/memory-game" 
            className={`flex-1 py-3 text-center text-xs ${
              location.pathname === "/memory-game" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground"
            }`}
          >
            Memory
          </Link>
          <Link 
            to="/tic-tac-toe" 
            className={`flex-1 py-3 text-center text-xs ${
              location.pathname === "/tic-tac-toe" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground"
            }`}
          >
            Tic Tac Toe
          </Link>
          <Link 
            to="/snake-game" 
            className={`flex-1 py-3 text-center text-xs ${
              location.pathname === "/snake-game" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground"
            }`}
          >
            Snake
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
