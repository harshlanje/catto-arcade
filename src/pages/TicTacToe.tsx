
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import DifficultySelector from "@/components/DifficultySelector";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, Settings } from "lucide-react";
import { useGame } from "@/contexts/GameContext";
import SoundEffect from "@/components/SoundEffect";

type Player = "X" | "O";
type BoardState = (Player | null)[];
type GameStatus = "playing" | "won" | "lost" | "draw";

const TicTacToe = () => {
  const { currentDifficulty, addScore, user } = useGame();
  
  // Game state
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [score, setScore] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [gamesLost, setGamesLost] = useState(0);
  const [gamesDraw, setGamesDraw] = useState(0);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [playClickSound, setPlayClickSound] = useState(false);
  const [playSuccessSound, setPlaySuccessSound] = useState(false);
  const [playFailSound, setPlayFailSound] = useState(false);
  const [playMoveSound, setPlayMoveSound] = useState(false);
  
  // Winning combinations
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  
  // Reset the game
  const resetGame = (updateStats = false) => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setGameStatus("playing");
    setWinningLine(null);
    
    // Only update stats when resetting after a completed game
    if (updateStats) {
      // Calculate and update the score
      const newScore = calculateScore();
      setScore(newScore);
      
      // If user exists, add the score to their profile
      if (user) {
        addScore({
          game: "ticTacToe",
          score: newScore,
          date: new Date().toISOString(),
          difficulty: currentDifficulty,
        });
      }
    }
  };
  
  // Handle player move
  const handleCellClick = (index: number) => {
    // Ignore clicks if the cell is already filled or game is over
    if (board[index] || gameStatus !== "playing" || currentPlayer === "O") {
      return;
    }
    
    // Play click sound
    setPlayClickSound(true);
    setTimeout(() => setPlayClickSound(false), 100);
    
    // Update the board with player's move
    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    
    // Check if the player won or if it's a draw
    if (checkWinner(newBoard, "X")) {
      setGameStatus("won");
      setGamesWon(gamesWon + 1);
      
      // Play success sound
      setPlaySuccessSound(true);
      setTimeout(() => setPlaySuccessSound(false), 100);
      
      return;
    }
    
    if (newBoard.every(cell => cell !== null)) {
      setGameStatus("draw");
      setGamesDraw(gamesDraw + 1);
      return;
    }
    
    // Switch turn to computer
    setCurrentPlayer("O");
  };
  
  // Computer move
  useEffect(() => {
    if (currentPlayer === "O" && gameStatus === "playing") {
      // Add a small delay to make it feel like the computer is "thinking"
      const timer = setTimeout(() => {
        makeComputerMove();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameStatus]);
  
  // Make computer move based on difficulty
  const makeComputerMove = () => {
    const newBoard = [...board];
    let move: number;
    
    // Play move sound
    setPlayMoveSound(true);
    setTimeout(() => setPlayMoveSound(false), 100);
    
    switch (currentDifficulty) {
      case "easy":
        // Easy: Random move
        move = getRandomMove(newBoard);
        break;
      case "medium":
        // Medium: 50% chance of making a smart move, 50% random
        if (Math.random() < 0.5) {
          move = getSmartMove(newBoard);
        } else {
          move = getRandomMove(newBoard);
        }
        break;
      case "hard":
        // Hard: Smart move
        move = getSmartMove(newBoard);
        break;
      default:
        move = getRandomMove(newBoard);
    }
    
    // Make the move
    newBoard[move] = "O";
    setBoard(newBoard);
    
    // Check if the computer won or if it's a draw
    if (checkWinner(newBoard, "O")) {
      setGameStatus("lost");
      setGamesLost(gamesLost + 1);
      
      // Play fail sound
      setPlayFailSound(true);
      setTimeout(() => setPlayFailSound(false), 100);
      
      return;
    }
    
    if (newBoard.every(cell => cell !== null)) {
      setGameStatus("draw");
      setGamesDraw(gamesDraw + 1);
      return;
    }
    
    // Switch turn back to player
    setCurrentPlayer("X");
  };
  
  // Get a random valid move
  const getRandomMove = (currentBoard: BoardState): number => {
    const availableMoves = currentBoard
      .map((cell, index) => cell === null ? index : -1)
      .filter(index => index !== -1);
    
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };
  
  // Get a smart move for the computer
  const getSmartMove = (currentBoard: BoardState): number => {
    // Check if computer can win in the next move
    for (let i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i] === null) {
        const boardCopy = [...currentBoard];
        boardCopy[i] = "O";
        if (checkWinner(boardCopy, "O", false)) {
          return i;
        }
      }
    }
    
    // Check if player can win in the next move and block them
    for (let i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i] === null) {
        const boardCopy = [...currentBoard];
        boardCopy[i] = "X";
        if (checkWinner(boardCopy, "X", false)) {
          return i;
        }
      }
    }
    
    // Try to take the center
    if (currentBoard[4] === null) {
      return 4;
    }
    
    // Try to take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(corner => currentBoard[corner] === null);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Take any available edge
    const edges = [1, 3, 5, 7];
    const availableEdges = edges.filter(edge => currentBoard[edge] === null);
    if (availableEdges.length > 0) {
      return availableEdges[Math.floor(Math.random() * availableEdges.length)];
    }
    
    // If we get here, there are no available moves (should not happen)
    return getRandomMove(currentBoard);
  };
  
  // Check if a player has won
  const checkWinner = (currentBoard: BoardState, player: Player, updateWinningLine = true): boolean => {
    for (const combination of winningCombinations) {
      if (
        currentBoard[combination[0]] === player &&
        currentBoard[combination[1]] === player &&
        currentBoard[combination[2]] === player
      ) {
        if (updateWinningLine) {
          setWinningLine(combination);
        }
        return true;
      }
    }
    return false;
  };
  
  // Calculate score based on game results and difficulty
  const calculateScore = (): number => {
    const wins = gamesWon;
    const losses = gamesLost;
    const draws = gamesDraw;
    
    // Base score calculation
    let baseScore = (wins * 100) + (draws * 30);
    
    // Penalty for losses
    baseScore = Math.max(0, baseScore - (losses * 50));
    
    // Difficulty multiplier
    const difficultyMultiplier = 
      currentDifficulty === "easy" ? 1 :
      currentDifficulty === "medium" ? 1.5 :
      2; // hard
    
    return Math.round(baseScore * difficultyMultiplier);
  };
  
  // Reset game when difficulty changes
  useEffect(() => {
    resetGame(false);
    setGamesWon(0);
    setGamesLost(0);
    setGamesDraw(0);
    setScore(0);
  }, [currentDifficulty]);
  
  // Render a cell
  const renderCell = (index: number) => {
    const isWinningCell = winningLine && winningLine.includes(index);
    
    return (
      <button
        key={index}
        className={`aspect-square w-full h-full flex items-center justify-center text-4xl md:text-5xl font-bold rounded-xl transition-all ${
          board[index] === "X" 
            ? "text-blue-500" 
            : board[index] === "O" 
            ? "text-red-500" 
            : "text-transparent hover:bg-pastel-purple/20"
        } ${
          isWinningCell 
            ? "bg-pastel-green bg-opacity-40 animate-pulse" 
            : "bg-white bg-opacity-80"
        }`}
        onClick={() => handleCellClick(index)}
        disabled={board[index] !== null || gameStatus !== "playing" || currentPlayer === "O"}
      >
        {board[index] || "."}
      </button>
    );
  };
  
  // Get status message
  const getStatusMessage = () => {
    switch (gameStatus) {
      case "won":
        return "You won! 🎉";
      case "lost":
        return "You lost! 😢";
      case "draw":
        return "It's a draw! 🤝";
      default:
        return currentPlayer === "X" ? "Your turn" : "Computer's turn...";
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Sound Effects */}
      <SoundEffect sound="click" play={playClickSound} />
      <SoundEffect sound="success" play={playSuccessSound} />
      <SoundEffect sound="fail" play={playFailSound} />
      <SoundEffect sound="move" play={playMoveSound} />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Game Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <Link to="/" className="flex items-center text-primary mb-4 md:mb-0">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to Games</span>
            </Link>
            
            <h1 className="text-3xl font-bold text-center mb-4 md:mb-0">Tic Tac Toe</h1>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => resetGame(false)}
                className="flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm p-2 rounded-full shadow-sm hover:shadow transition-all"
                aria-label="Restart game"
              >
                <RotateCcw className="h-5 w-5 text-primary" />
              </button>
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
            </div>
            
            <div className="flex justify-center items-center gap-3 text-sm">
              <div className="bg-pastel-blue bg-opacity-30 px-3 py-1 rounded-full">
                Wins: <span className="font-bold">{gamesWon}</span>
              </div>
              <div className="bg-pastel-red bg-opacity-30 px-3 py-1 rounded-full">
                Losses: <span className="font-bold">{gamesLost}</span>
              </div>
              <div className="bg-pastel-yellow bg-opacity-30 px-3 py-1 rounded-full">
                Draws: <span className="font-bold">{gamesDraw}</span>
              </div>
            </div>
          </div>
          
          {/* Game Status */}
          <div className="text-center mb-6">
            <div className={`font-medium ${
              gameStatus === "won" 
                ? "text-emerald-600" 
                : gameStatus === "lost" 
                ? "text-red-500" 
                : ""
            }`}>
              {getStatusMessage()}
            </div>
          </div>
          
          {/* Game Board */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {board.map((_, index) => renderCell(index))}
          </div>
          
          {/* New Game Button (appears when game is over) */}
          {gameStatus !== "playing" && (
            <div className="text-center">
              <button
                onClick={() => resetGame(true)}
                className="btn-game"
              >
                New Game
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TicTacToe;
