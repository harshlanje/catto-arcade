
import { useEffect } from "react";
import { Point, Direction, GameStatus } from "@/types/snakeGame";

type GameCanvasProps = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  contextRef: React.RefObject<CanvasRenderingContext2D>;
  snake: Point[];
  food: Point;
  direction: Direction;
  tileCount: number;
  tileSize: number;
  gameStatus: GameStatus;
  score: number;
};

const GameCanvas = ({
  canvasRef,
  contextRef,
  snake,
  food,
  direction,
  tileCount,
  tileSize,
  gameStatus,
  score
}: GameCanvasProps) => {
  // Draw game elements
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
    const isGameOver = gameStatus === "gameOver";
    const isIdle = gameStatus === "idle" && snake.length > 1;
    const isPaused = gameStatus === "paused";
    
    if (isGameOver || isIdle || isPaused) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = "bold 24px 'Baloo 2', cursive";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";
      
      if (isGameOver) {
        ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = "18px 'Quicksand', sans-serif";
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 15);
        ctx.fillText("Press Restart to play again", canvas.width / 2, canvas.height / 2 + 45);
      } else if (isPaused) {
        ctx.fillText("Paused", canvas.width / 2, canvas.height / 2);
        ctx.font = "18px 'Quicksand', sans-serif";
        ctx.fillText("Press Space to resume", canvas.width / 2, canvas.height / 2 + 30);
      } else if (isIdle) {
        ctx.fillText("Ready?", canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = "18px 'Quicksand', sans-serif";
        ctx.fillText("Press any arrow key to start", canvas.width / 2, canvas.height / 2 + 15);
      }
    }
  }, [snake, food, tileCount, tileSize, gameStatus, score, direction, canvasRef, contextRef]);
  
  return null; // This component doesn't render anything directly
};

export default GameCanvas;
