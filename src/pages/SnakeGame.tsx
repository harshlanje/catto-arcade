
import Navigation from "@/components/Navigation";
import SoundEffect from "@/components/SoundEffect";
import GameHeader from "@/components/GameHeader";
import GameControls from "@/components/GameControls";
import GameCanvas from "@/components/GameCanvas";
import MobileControls from "@/components/MobileControls";
import GameInstructions from "@/components/GameInstructions";
import { useSnakeGame } from "@/hooks/useSnakeGame";

const SnakeGame = () => {
  const {
    gameStatus,
    snake,
    food,
    score,
    direction,
    tileCount,
    tileSize,
    canvasRef,
    contextRef,
    playMoveSound,
    playSuccessSound,
    playGameOverSound,
    resetGame,
    togglePause,
    handleSwipe
  } = useSnakeGame();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Sound Effects */}
      <SoundEffect sound="move" play={playMoveSound} />
      <SoundEffect sound="success" play={playSuccessSound} />
      <SoundEffect sound="gameOver" play={playGameOverSound} />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Game Header */}
          <GameHeader 
            gameStatus={gameStatus}
            onReset={resetGame}
            onTogglePause={togglePause}
          />
          
          {/* Game Controls */}
          <GameControls 
            score={score}
            snakeLength={snake.length}
          />
          
          {/* Game Canvas */}
          <div className="flex justify-center mb-6">
            <canvas 
              ref={canvasRef} 
              className="rounded-xl shadow-lg border-4 border-white border-opacity-50"
            />
          </div>
          
          {/* Canvas Renderer Component */}
          <GameCanvas 
            canvasRef={canvasRef}
            contextRef={contextRef}
            snake={snake}
            food={food}
            direction={direction}
            tileCount={tileCount}
            tileSize={tileSize}
            gameStatus={gameStatus}
            score={score}
          />
          
          {/* Mobile Controls */}
          <MobileControls onSwipe={handleSwipe} />
          
          {/* Instructions */}
          <GameInstructions />
        </div>
      </main>
    </div>
  );
};

export default SnakeGame;
