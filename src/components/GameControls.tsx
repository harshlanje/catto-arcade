
import DifficultySelector from "@/components/DifficultySelector";

type GameControlsProps = {
  score: number;
  snakeLength: number;
};

const GameControls = ({ score, snakeLength }: GameControlsProps) => {
  return (
    <div className="mb-6">
      <DifficultySelector />
      
      <div className="flex justify-center items-center gap-4 mb-4">
        <div className="flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
          <span className="text-sm font-medium mr-2">Score:</span>
          <span className="font-bold">{score}</span>
        </div>
        
        <div className="flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
          <span className="text-sm font-medium mr-2">Length:</span>
          <span className="font-bold">{snakeLength}</span>
        </div>
      </div>
    </div>
  );
};

export default GameControls;
