import { useState, useEffect, useRef, useCallback } from "react";
import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, Play, Pause } from "lucide-react";
import DifficultySelector from "@/components/DifficultySelector";
import { useGame } from "@/contexts/GameContext";
import SoundEffect from "@/components/SoundEffect";

// Type definitions
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Point = { x: number; y: number };

const SnakeGame = () => {
  const { currentDifficulty, addScore, user } = useGame();
  
  // Canvas references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [nextDirection, setNextDirection] = useState<Direction>("RIGHT");
  const [speed, setSpeed] = useState(0);
  const [tileCount, setTileCount] = useState(20);
  const [tileSize, setTileSize] = useState(20);
  const [playMoveSound, setPlayMoveSound] = useState(false);
  const [playSuccessSound, setPlaySuccessSound] = useState(false);
  const [playGameOverSound, setPlayGameOverSound] = useState(false);
  
  // Setup canvas and game parameters
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    if (!context) return;
    
    contextRef.current = context;
    
    // Set canvas dimensions - fixed maximum size
    const updateCanvasSize = () => {
      const maxSize = Math.min(window.innerWidth - 40, 500);
      canvas.width = maxSize;
      canvas.height = maxSize;
      
      // Always maintain proper tile size based on fixed canvas dimensions
      setTileSize(maxSize / tileCount);
    };
    
    // Set difficulty-based parameters
    const setDifficultyParams = () => {
      switch (currentDifficulty) {
        case "easy":
          setSpeed(150);
          setTileCount(15);
          break;
        case "medium":
          setSpeed(100);
          setTileCount(20);
          break;
        case "hard":
          setSpeed(70);
          setTileCount(25);
          break;
        default:
          setSpeed(100);
          setTileCount(20);
      }
    };
    
    setDifficultyParams();
    updateCanvasSize();
    
    window.addEventListener("resize", updateCanvasSize);
    
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [currentDifficulty, tileCount]);
  
  // Reset game state
  const resetGame = () => {
    const initialPos = Math.floor(tileCount / 2);
    setSnake([{ x: initialPos, y: initialPos }]);
    setDirection("RIGHT");
    setNextDirection("RIGHT");
    setGameStarted(false);
    setGamePaused(false);
    setGameOver(false);
    setScore(0);
    placeFood();
  };
  
  // Place food at random location - improved to ensure it's always within bounds
  const placeFood = () => {
    // Ensure we place food well within bounds (subtract 1 to prevent edge placement)
    const newFood = {
      x: Math.floor(Math.random() * (tileCount - 2)) + 1,
      y: Math.floor(Math.random() * (tileCount - 2)) + 1
    };
    
    // Additional checks to guarantee food is within playable area
    const validFood = {
      x: Math.max(1, Math.min(newFood.x, tileCount - 2)),
      y: Math.max(1, Math.min(newFood.y, tileCount - 2))
    };
    
    // Ensure food doesn't spawn on snake
    if (snake.some(segment => segment.x === validFood.x && segment.y === validFood.y)) {
      placeFood(); // Recursively try again
    } else {
      setFood(validFood);
    }
  };
  
  // Handle arrow key presses - Fixed type comparison errors
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Start the game if it's not started yet
    if (!gameStarted && !gameOver) {
      setGameStarted(true);
    }
    
    // Toggle pause
    if (e.key === " " || e.key === "Spacebar") {
      if (gameStarted && !gameOver) {
        setGamePaused(!gamePaused);
      }
      return;
    }
    
    // Don't change direction if game is paused or over
    if (!gameStarted || gamePaused || gameOver) return;
    
    // Prevent reversing direction - fixed comparison types
    switch (e.key) {
      case "ArrowUp":
        if (direction !== "DOWN") setNextDirection("UP");
        break;
      case "ArrowDown":
        if (direction !== "UP") setNextDirection("DOWN");
        break;
      case "ArrowLeft":
        if (direction !== "RIGHT") setNextDirection("LEFT");
        break;
      case "ArrowRight":
        if (direction !== "LEFT") setNextDirection("RIGHT");
        break;
    }
  }, [gameStarted, gamePaused, gameOver, direction]);
  
  // Set up event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Touch controls for mobile - Fixed type comparison errors
  const handleSwipe = (swipeDirection: Direction) => {
    // Start the game if it's not started yet
    if (!gameStarted && !gameOver) {
      setGameStarted(true);
    }
    
    // Don't change direction if game is paused or over
    if (gamePaused || gameOver) return;
    
    // Prevent reversing direction
    if (swipeDirection === "UP" && direction !== "DOWN") {
      setNextDirection("UP");
    } else if (swipeDirection === "DOWN" && direction !== "UP") {
      setNextDirection("DOWN");
    } else if (swipeDirection === "LEFT" && direction !== "RIGHT") {
      setNextDirection("LEFT");
    } else if (swipeDirection === "RIGHT" && direction !== "LEFT") {
      setNextDirection("RIGHT");
    }
  };
  
  // Main game loop
  useEffect(() => {
    if (!gameStarted || gamePaused || gameOver) return;
    
    const moveSnake = () => {
      // Set direction from next direction
      setDirection(nextDirection);
      
      // Create a copy of the snake
      const newSnake = [...snake];
      
      // Get the head position
      const head = { ...newSnake[0] };
      
      // Move head based on direction
      switch (nextDirection) {
        case "UP":
          head.y -= 1;
          break;
        case "DOWN":
          head.y += 1;
          break;
        case "LEFT":
          head.x -= 1;
          break;
        case "RIGHT":
          head.x += 1;
          break;
      }
      
      // Check for collisions with wall
      if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= tileCount ||
        head.y >= tileCount
      ) {
        // Game over - hit wall
        setGameOver(true);
        setGameStarted(false);
        
        // Play game over sound
        setPlayGameOverSound(true);
        setTimeout(() => setPlayGameOverSound(false), 100);
        
        // Add score to leaderboard if user exists
        if (user) {
          addScore({
            game: "snakeGame",
            score,
            date: new Date().toISOString(),
            difficulty: currentDifficulty,
          });
        }
        
        return;
      }
      
      // Check for collisions with self
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        // Game over - hit self
        setGameOver(true);
        setGameStarted(false);
        
        // Play game over sound
        setPlayGameOverSound(true);
        setTimeout(() => setPlayGameOverSound(false), 100);
        
        // Add score to leaderboard if user exists
        if (user) {
          addScore({
            game: "snakeGame",
            score,
            date: new Date().toISOString(),
            difficulty: currentDifficulty,
          });
        }
        
        return;
      }
      
      // Add new head to the snake
      newSnake.unshift(head);
      
      // Check if snake eats food
      if (head.x === food.x && head.y === food.y) {
        // Increase score
        setScore(prev => prev + 10);
        
        // Play success sound
        setPlaySuccessSound(true);
        setTimeout(() => setPlaySuccessSound(false), 100);
        
        // Place new food
        placeFood();
      } else {
        // Remove tail if no food eaten
        newSnake.pop();
        
        // Play move sound occasionally to avoid too many sounds
        if (Math.random() < 0.1) {
          setPlayMoveSound(true);
          setTimeout(() => setPlayMoveSound(false), 100);
        }
      }
      
      // Update snake
      setSnake(newSnake);
    };
    
    // Set up game loop
    const gameInterval = setInterval(moveSnake, speed);
    
    return () => {
      clearInterval(gameInterval);
    };
  }, [gameStarted, gamePaused, gameOver, snake, direction, nextDirection, food, tileCount, score, speed, user, currentDifficulty, addScore]);
  
  // Draw game with improved food visibility
  useEffect(() => {
    if (!contextRef.current || !canvasRef.current) return;
    
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < tileCount; i++) {
      for (let j = 0; j < tileCount; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillStyle = "rgba(229, 222, 255, 0.3)";
          ctx.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
        }
      }
    }
    
    // Draw food with enhanced visibility
    ctx.fillStyle = "#FE6A00"; // Brighter orange
    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(255, 100, 0, 0.8)";
    
    const foodRadius = Math.max(tileSize / 2 * 0.9, 5); // Ensure minimum size
    ctx.beginPath();
    ctx.arc(
      food.x * tileSize + tileSize / 2,
      food.y * tileSize + tileSize / 2,
      foodRadius,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Add a pulsing effect to food
    const pulseFactor = 1 + 0.1 * Math.sin(Date.now() / 200);
    ctx.beginPath();
    ctx.arc(
      food.x * tileSize + tileSize / 2,
      food.y * tileSize + tileSize / 2,
      foodRadius * pulseFactor * 0.7,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fill();
    
    ctx.shadowBlur = 0;
    
    // Draw snake
    snake.forEach((segment, index) => {
      let gradient;
      
      if (index === 0) {
        // Head
        ctx.fillStyle = "#9b87f5";
      } else {
        // Body - gradient that gets lighter toward the tail
        const gradientProgress = 1 - index / snake.length;
        
        gradient = ctx.createLinearGradient(
          segment.x * tileSize,
          segment.y * tileSize,
          (segment.x + 1) * tileSize,
          (segment.y + 1) * tileSize
        );
        
        gradient.addColorStop(0, `rgba(155, 135, 245, ${0.8 + gradientProgress * 0.2})`);
        gradient.addColorStop(1, `rgba(211, 228, 253, ${0.8 + gradientProgress * 0.2})`);
        
        ctx.fillStyle = gradient;
      }
      
      // Draw rounded rectangle for snake segment
      const radius = index === 0 ? tileSize / 4 : tileSize / 5;
      const x = segment.x * tileSize;
      const y = segment.y * tileSize;
      const width = tileSize;
      const height = tileSize;
      
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.arcTo(x + width, y + height, x, y + height, radius);
      ctx.arcTo(x, y + height, x, y, radius);
      ctx.arcTo(x, y, x + width, y, radius);
      ctx.closePath();
      ctx.fill();
      
      // Draw eyes on the head
      if (index === 0) {
        ctx.fillStyle = "white";
        
        let eyeX1, eyeY1, eyeX2, eyeY2;
        const eyeSize = tileSize / 5;
        
        // Position eyes based on direction
        switch (direction) {
          case "RIGHT":
            eyeX1 = x + width - eyeSize * 1.5;
            eyeY1 = y + height / 3;
            eyeX2 = x + width - eyeSize * 1.5;
            eyeY2 = y + height * 2/3;
            break;
          case "LEFT":
            eyeX1 = x + eyeSize / 2;
            eyeY1 = y + height / 3;
            eyeX2 = x + eyeSize / 2;
            eyeY2 = y + height * 2/3;
            break;
          case "UP":
            eyeX1 = x + width / 3;
            eyeY1 = y + eyeSize / 2;
            eyeX2 = x + width * 2/3;
            eyeY2 = y + eyeSize / 2;
            break;
          case "DOWN":
            eyeX1 = x + width / 3;
            eyeY1 = y + height - eyeSize * 1.5;
            eyeX2 = x + width * 2/3;
            eyeY2 = y + height - eyeSize * 1.5;
            break;
        }
        
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "black";
        
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, eyeSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(eyeX2, eyeY2, eyeSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // Draw game over or paused overlay
    if (gameOver || (!gameStarted && snake.length > 1) || gamePaused) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = "bold 24px 'Baloo 2', cursive";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";
      
      if (gameOver) {
        ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = "18px 'Quicksand', sans-serif";
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 15);
        ctx.fillText("Press Restart to play again", canvas.width / 2, canvas.height / 2 + 45);
      } else if (gamePaused) {
        ctx.fillText("Paused", canvas.width / 2, canvas.height / 2);
        ctx.font = "18px 'Quicksand', sans-serif";
        ctx.fillText("Press Space to resume", canvas.width / 2, canvas.height / 2 + 30);
      } else if (!gameStarted && snake.length > 1) {
        ctx.fillText("Ready?", canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = "18px 'Quicksand', sans-serif";
        ctx.fillText("Press any arrow key to start", canvas.width / 2, canvas.height / 2 + 15);
      }
    }
  }, [snake, food, tileCount, tileSize, gameOver, gameStarted, gamePaused, score, direction]);
  
  // Reset game when difficulty changes
  useEffect(() => {
    resetGame();
  }, [currentDifficulty]);
  
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
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <Link to="/" className="flex items-center text-primary mb-4 md:mb-0">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to Games</span>
            </Link>
            
            <h1 className="text-3xl font-bold text-center mb-4 md:mb-0">Snake Game</h1>
            
            <div className="flex space-x-4">
              <button 
                onClick={resetGame}
                className="flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm p-2 rounded-full shadow-sm hover:shadow transition-all"
                aria-label="Restart game"
              >
                <RotateCcw className="h-5 w-5 text-primary" />
              </button>
              
              {gameStarted && !gameOver && (
                <button 
                  onClick={() => setGamePaused(!gamePaused)}
                  className="flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm p-2 rounded-full shadow-sm hover:shadow transition-all"
                  aria-label={gamePaused ? "Resume game" : "Pause game"}
                >
                  {gamePaused ? (
                    <Play className="h-5 w-5 text-primary" />
                  ) : (
                    <Pause className="h-5 w-5 text-primary" />
                  )}
                </button>
              )}
            </div>
          </div>
          
          {/* Game Controls */}
          <div className="mb-6">
            <DifficultySelector />
            
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <span className="text-sm font-medium mr-2">Score:</span>
                <span className="font-bold">{score}</span>
              </div>
              
              <div className="flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <span className="text-sm font-medium mr-2">Length:</span>
                <span className="font-bold">{snake.length}</span>
              </div>
            </div>
          </div>
          
          {/* Game Canvas */}
          <div className="flex justify-center mb-6">
            <canvas 
              ref={canvasRef} 
              className="rounded-xl shadow-lg border-4 border-white border-opacity-50"
            />
          </div>
          
          {/* Mobile Controls */}
          <div className="md:hidden">
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
              <div className="col-start-2">
                <button
                  className="w-full h-16 flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm"
                  onClick={() => handleSwipe("UP")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              </div>
              
              <div>
                <button
                  className="w-full h-16 flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm"
                  onClick={() => handleSwipe("LEFT")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              
              <div className="col-start-3">
                <button
                  className="w-full h-16 flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm"
                  onClick={() => handleSwipe("RIGHT")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="col-start-2">
                <button
                  className="w-full h-16 flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm"
                  onClick={() => handleSwipe("DOWN")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <h3 className="font-medium mb-1">How to Play</h3>
            <p className="mb-2">Use arrow keys to control the snake. Collect food to grow longer.</p>
            <p>Avoid hitting walls and yourself. Press space to pause/resume.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SnakeGame;
