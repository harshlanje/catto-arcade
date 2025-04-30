
import { useState, useEffect, useRef, useCallback } from "react";
import { Direction, Point, GameStatus } from "@/types/snakeGame";
import { generateFoodPosition, moveSnake, checkCollisions, getDifficultyParams } from "@/utils/snakeGameUtils";
import { useGame } from "@/contexts/GameContext";

export const useSnakeGame = () => {
  const { currentDifficulty, addScore, user } = useGame();
  
  // Game state
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [score, setScore] = useState(0);
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [nextDirection, setNextDirection] = useState<Direction>("RIGHT");
  const [previousDirection, setPreviousDirection] = useState<Direction>("RIGHT");
  const [lastMoveSoundTime, setLastMoveSoundTime] = useState(0);
  
  // Canvas setup related state
  const [speed, setSpeed] = useState(0);
  const [tileCount, setTileCount] = useState(20);
  const [tileSize, setTileSize] = useState(20);
  
  // Sound effect triggers
  const [playMoveSound, setPlayMoveSound] = useState(false);
  const [playSuccessSound, setPlaySuccessSound] = useState(false);
  const [playGameOverSound, setPlayGameOverSound] = useState(false);
  
  // Canvas references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // Initialize game parameters based on difficulty
  useEffect(() => {
    const { speed: newSpeed, tileCount: newTileCount } = getDifficultyParams(currentDifficulty);
    setSpeed(newSpeed);
    setTileCount(newTileCount);
  }, [currentDifficulty]);
  
  // Setup canvas and update its size
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
    
    updateCanvasSize();
    
    window.addEventListener("resize", updateCanvasSize);
    
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [tileCount]);
  
  // Reset game state
  const resetGame = useCallback(() => {
    const initialPos = Math.floor(tileCount / 2);
    setSnake([{ x: initialPos, y: initialPos }]);
    setDirection("RIGHT");
    setNextDirection("RIGHT");
    setGameStatus("idle");
    setScore(0);
    
    // Use setTimeout to defer food placement and break circular dependency
    setTimeout(() => {
      const newFood = generateFoodPosition([{ x: initialPos, y: initialPos }], tileCount);
      setFood(newFood);
    }, 0);
  }, [tileCount]);
  
  // Initialize game when difficulty changes
  useEffect(() => {
    resetGame();
  }, [resetGame, currentDifficulty]);
  
  // Handle direction changes and game controls
  const changeDirection = useCallback((newDirection: Direction) => {
    // Don't change direction if game is paused or over
    if (gameStatus !== "playing") return;
    
    // Prevent reversing direction
    if (
      (newDirection === "UP" && direction !== "DOWN" && nextDirection !== "UP") ||
      (newDirection === "DOWN" && direction !== "UP" && nextDirection !== "DOWN") ||
      (newDirection === "LEFT" && direction !== "RIGHT" && nextDirection !== "LEFT") ||
      (newDirection === "RIGHT" && direction !== "LEFT" && nextDirection !== "RIGHT")
    ) {
      setNextDirection(newDirection);
      
      // Play move sound only when direction changes
      const now = Date.now();
      if (now - lastMoveSoundTime > 300) {
        setPlayMoveSound(true);
        setLastMoveSoundTime(now);
        setTimeout(() => setPlayMoveSound(false), 10);
      }
    }
  }, [direction, nextDirection, gameStatus, lastMoveSoundTime]);
  
  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Start the game if it's not started yet
    if (gameStatus === "idle") {
      setGameStatus("playing");
    }
    
    // Toggle pause
    if (e.key === " " || e.key === "Spacebar") {
      if (gameStatus === "playing") {
        setGameStatus("paused");
      } else if (gameStatus === "paused") {
        setGameStatus("playing");
      }
      return;
    }
    
    // Handle arrow keys
    switch (e.key) {
      case "ArrowUp":
        changeDirection("UP");
        break;
      case "ArrowDown":
        changeDirection("DOWN");
        break;
      case "ArrowLeft":
        changeDirection("LEFT");
        break;
      case "ArrowRight":
        changeDirection("RIGHT");
        break;
    }
  }, [gameStatus, changeDirection]);
  
  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Main game loop
  useEffect(() => {
    if (gameStatus !== "playing") return;
    
    const gameLoop = () => {
      // Save previous direction before updating
      setPreviousDirection(direction);
      
      // Set direction from next direction
      setDirection(nextDirection);
      
      // Move the snake
      const { newSnake, ate } = moveSnake(snake, nextDirection, food);
      
      // Check for collisions
      if (checkCollisions(newSnake[0], snake, tileCount)) {
        // Game over - hit wall or self
        setGameStatus("gameOver");
        
        // Play game over sound immediately
        setPlayGameOverSound(true);
        setTimeout(() => setPlayGameOverSound(false), 10);
        
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
      
      // Update snake
      setSnake(newSnake);
      
      // Handle food consumption
      if (ate) {
        // Increase score
        setScore(prev => prev + 10);
        
        // Play success sound
        setPlaySuccessSound(true);
        setTimeout(() => setPlaySuccessSound(false), 10);
        
        // Generate new food position
        setTimeout(() => {
          const newFood = generateFoodPosition(newSnake, tileCount);
          setFood(newFood);
        }, 0);
      }
    };
    
    // Set up game loop with appropriate speed
    const gameInterval = setInterval(gameLoop, speed);
    
    return () => {
      clearInterval(gameInterval);
    };
  }, [
    gameStatus, snake, direction, nextDirection, food, tileCount, 
    score, speed, user, currentDifficulty, addScore
  ]);
  
  // Start the game
  const startGame = useCallback(() => {
    setGameStatus("playing");
  }, []);
  
  // Pause/resume the game
  const togglePause = useCallback(() => {
    if (gameStatus === "playing") {
      setGameStatus("paused");
    } else if (gameStatus === "paused") {
      setGameStatus("playing");
    }
  }, [gameStatus]);
  
  // Mobile swipe handler
  const handleSwipe = useCallback((swipeDirection: Direction) => {
    // Start the game if it's not started yet
    if (gameStatus === "idle") {
      setGameStatus("playing");
    }
    
    changeDirection(swipeDirection);
  }, [gameStatus, changeDirection]);
  
  return {
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
    startGame,
    togglePause,
    handleSwipe
  };
};
