import { Point, Direction } from "@/types/snakeGame";

// Generate random food position that doesn't overlap with the snake
export const generateFoodPosition = (
  snake: Point[], 
  tileCount: number
): Point => {
  // Get the safe area based on current tile count (add buffer to keep away from edges)
  const safeMin = 2;
  const safeMax = tileCount - 3;
  
  // If safeMax is less than safeMin, adjust to prevent errors
  const adjustedMax = Math.max(safeMax, safeMin + 1);
  
  // Generate coordinates within the safe area
  const newFood = {
    x: Math.floor(Math.random() * (adjustedMax - safeMin + 1)) + safeMin,
    y: Math.floor(Math.random() * (adjustedMax - safeMin + 1)) + safeMin
  };
  
  // Ensure food doesn't spawn on snake
  if (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
    // If snake is too big, find first available spot
    if (snake.length >= (tileCount - 4) * (tileCount - 4)) {
      for (let x = safeMin; x <= adjustedMax; x++) {
        for (let y = safeMin; y <= adjustedMax; y++) {
          if (!snake.some(segment => segment.x === x && segment.y === y)) {
            return { x, y };
          }
        }
      }
    }
    
    // Try again recursively with a different position
    return generateFoodPosition(snake, tileCount);
  }
  
  return newFood;
};

// Move the snake based on current direction
export const moveSnake = (
  snake: Point[], 
  direction: Direction, 
  food: Point
): { newSnake: Point[], ate: boolean } => {
  // Create a copy of the snake
  const newSnake = [...snake];
  
  // Get the head position
  const head = { ...newSnake[0] };
  
  // Move head based on direction
  switch (direction) {
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
  
  // Add new head to the snake
  newSnake.unshift(head);
  
  // Check if snake eats food
  const ate = head.x === food.x && head.y === food.y;
  
  // If the snake didn't eat food, remove the tail
  if (!ate) {
    newSnake.pop();
  }
  
  return { newSnake, ate };
};

// Check for collisions with walls or self
export const checkCollisions = (
  head: Point, 
  snake: Point[], 
  tileCount: number
): boolean => {
  // Check for collisions with wall
  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= tileCount ||
    head.y >= tileCount
  ) {
    return true;
  }
  
  // Check for collisions with self (skip the head itself)
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      return true;
    }
  }
  
  return false;
};

// Get difficulty-based parameters
export const getDifficultyParams = (difficulty: string): { speed: number, tileCount: number } => {
  switch (difficulty) {
    case "easy":
      return { speed: 150, tileCount: 15 };
    case "medium":
      return { speed: 100, tileCount: 20 };
    case "hard":
      return { speed: 70, tileCount: 25 };
    default:
      return { speed: 100, tileCount: 20 };
  }
};
