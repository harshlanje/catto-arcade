
import { useGame } from "@/contexts/GameContext";

const DifficultySelector = () => {
  const { currentDifficulty, setDifficulty } = useGame();
  
  return (
    <div className="mb-6 flex flex-col sm:flex-row justify-center items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Difficulty:</span>
      <div className="flex space-x-2">
        <button
          onClick={() => setDifficulty("easy")}
          className={`px-4 py-1 rounded-full text-sm ${
            currentDifficulty === "easy"
              ? "bg-pastel-green text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Easy
        </button>
        <button
          onClick={() => setDifficulty("medium")}
          className={`px-4 py-1 rounded-full text-sm ${
            currentDifficulty === "medium"
              ? "bg-pastel-blue text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Medium
        </button>
        <button
          onClick={() => setDifficulty("hard")}
          className={`px-4 py-1 rounded-full text-sm ${
            currentDifficulty === "hard"
              ? "bg-pastel-purple text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Hard
        </button>
      </div>
    </div>
  );
};

export default DifficultySelector;
