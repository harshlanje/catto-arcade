
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, Play, Pause } from "lucide-react";
import { GameStatus } from "@/types/snakeGame";

type GameHeaderProps = {
  gameStatus: GameStatus;
  onReset: () => void;
  onTogglePause: () => void;
};

const GameHeader = ({ gameStatus, onReset, onTogglePause }: GameHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
      <Link to="/" className="flex items-center text-primary mb-4 md:mb-0">
        <ArrowLeft className="h-4 w-4 mr-1" />
        <span>Back to Games</span>
      </Link>
      
      <h1 className="text-3xl font-bold text-center mb-4 md:mb-0">Snake Game</h1>
      
      <div className="flex space-x-4">
        <button 
          onClick={onReset}
          className="flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm p-2 rounded-full shadow-sm hover:shadow transition-all"
          aria-label="Restart game"
        >
          <RotateCcw className="h-5 w-5 text-primary" />
        </button>
        
        {(gameStatus === "playing" || gameStatus === "paused") && (
          <button 
            onClick={onTogglePause}
            className="flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm p-2 rounded-full shadow-sm hover:shadow transition-all"
            aria-label={gameStatus === "paused" ? "Resume game" : "Pause game"}
          >
            {gameStatus === "paused" ? (
              <Play className="h-5 w-5 text-primary" />
            ) : (
              <Pause className="h-5 w-5 text-primary" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default GameHeader;
