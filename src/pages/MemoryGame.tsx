
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Timer from "@/components/Timer";
import DifficultySelector from "@/components/DifficultySelector";
import { useGame } from "@/contexts/GameContext";
import { Settings, RotateCcw, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import SoundEffect from "@/components/SoundEffect";

// Define card types
type CardType = {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const MemoryGame = () => {
  const { currentDifficulty, addScore, user } = useGame();
  
  // Game state
  const [cards, setCards] = useState<CardType[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [playClickSound, setPlayClickSound] = useState(false);
  const [playSuccessSound, setPlaySuccessSound] = useState(false);
  const [playFailSound, setPlayFailSound] = useState(false);
  const [playGameOverSound, setPlayGameOverSound] = useState(false);
  
  // Get emojis based on difficulty
  const getEmojis = () => {
    const emojiSets = {
      easy: ["🐶", "🐱", "🦊", "🐰", "🐻", "🐼", "🐨", "🦁"],
      medium: ["🐶", "🐱", "🦊", "🐰", "🐻", "🐼", "🐨", "🦁", "🐯", "🦄", "🐮", "🐷"],
      hard: ["🐶", "🐱", "🦊", "🐰", "🐻", "🐼", "🐨", "🦁", "🐯", "🦄", "🐮", "🐷", "🐸", "🐵", "🐔", "🦉"],
    };
    
    return emojiSets[currentDifficulty];
  };
  
  // Initialize or restart the game
  const initializeGame = () => {
    const emojis = getEmojis();
    let gameCards: CardType[] = [];
    
    // Create pairs of cards
    emojis.forEach((emoji, index) => {
      // Add two cards with the same emoji
      gameCards.push({ id: index * 2, emoji, isFlipped: false, isMatched: false });
      gameCards.push({ id: index * 2 + 1, emoji, isFlipped: false, isMatched: false });
    });
    
    // Shuffle the cards
    gameCards = shuffleCards(gameCards);
    
    setCards(gameCards);
    setSelectedCards([]);
    setMoves(0);
    setGameOver(false);
    setScore(0);
    setGameTime(0);
  };
  
  // Fisher-Yates shuffle algorithm
  const shuffleCards = (cardArray: CardType[]): CardType[] => {
    const shuffled = [...cardArray];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  };
  
  // Handle card click
  const handleCardClick = (id: number) => {
    // Ignore click if game not started
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    // Ignore if more than 2 cards are already selected or card is already flipped/matched
    if (
      selectedCards.length >= 2 || 
      selectedCards.includes(id) || 
      cards.find(card => card.id === id)?.isFlipped || 
      cards.find(card => card.id === id)?.isMatched
    ) {
      return;
    }
    
    // Play click sound
    setPlayClickSound(true);
    setTimeout(() => setPlayClickSound(false), 100);
    
    // Add card to selected cards
    const newSelectedCards = [...selectedCards, id];
    setSelectedCards(newSelectedCards);
    
    // Flip the card
    const newCards = cards.map(card => 
      card.id === id ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);
    
    // If we have 2 cards selected, check for a match
    if (newSelectedCards.length === 2) {
      setMoves(moves + 1);
      
      const [firstCardId, secondCardId] = newSelectedCards;
      const firstCard = newCards.find(card => card.id === firstCardId);
      const secondCard = newCards.find(card => card.id === secondCardId);
      
      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match found!
        setTimeout(() => {
          // Play success sound
          setPlaySuccessSound(true);
          setTimeout(() => setPlaySuccessSound(false), 100);
          
          // Mark cards as matched
          const matchedCards = newCards.map(card => 
            card.id === firstCardId || card.id === secondCardId
              ? { ...card, isMatched: true }
              : card
          );
          setCards(matchedCards);
          setSelectedCards([]);
          
          // Calculate score
          const newScore = calculateScore(matchedCards);
          setScore(newScore);
          
          // Check if game is over
          if (matchedCards.every(card => card.isMatched)) {
            gameComplete(newScore);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          // Play fail sound
          setPlayFailSound(true);
          setTimeout(() => setPlayFailSound(false), 100);
          
          // Flip cards back
          const flippedBackCards = newCards.map(card => 
            card.id === firstCardId || card.id === secondCardId
              ? { ...card, isFlipped: false }
              : card
          );
          setCards(flippedBackCards);
          setSelectedCards([]);
        }, 1000);
      }
    }
  };
  
  // Calculate score based on moves and time
  const calculateScore = (cardArray: CardType[]) => {
    const matchedPairs = cardArray.filter(card => card.isMatched).length / 2;
    const totalPairs = cardArray.length / 2;
    const baseScore = Math.round((matchedPairs / totalPairs) * 1000);
    
    // Bonus for fewer moves and faster time
    const movesBonus = Math.max(0, 500 - (moves * 20));
    const timeBonus = gameTime === 0 ? 0 : Math.max(0, 500 - (gameTime * 5));
    
    // Difficulty multiplier
    const difficultyMultiplier = currentDifficulty === "easy" ? 1 :
                                currentDifficulty === "medium" ? 1.5 : 2;
    
    return Math.round((baseScore + movesBonus + timeBonus) * difficultyMultiplier);
  };
  
  // Handle game completion
  const gameComplete = (finalScore: number) => {
    setGameOver(true);
    setGameStarted(false);
    
    // Play game over sound
    setPlayGameOverSound(true);
    setTimeout(() => setPlayGameOverSound(false), 100);
    
    // Add score to leaderboard if user exists
    if (user) {
      addScore({
        game: "memoryGame",
        score: finalScore,
        date: new Date().toISOString(),
        difficulty: currentDifficulty,
      });
    }
  };
  
  // Initialize game on difficulty change
  useEffect(() => {
    initializeGame();
    setGameStarted(false);
  }, [currentDifficulty]);
  
  // Card layout configuration based on difficulty
  const getGridConfig = () => {
    switch (currentDifficulty) {
      case "easy":
        return "grid-cols-4";
      case "medium":
        return "grid-cols-6";
      case "hard":
        return "grid-cols-8";
      default:
        return "grid-cols-4";
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Sound Effects */}
      <SoundEffect sound="click" play={playClickSound} />
      <SoundEffect sound="success" play={playSuccessSound} />
      <SoundEffect sound="fail" play={playFailSound} />
      <SoundEffect sound="gameOver" play={playGameOverSound} />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Game Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <Link to="/" className="flex items-center text-primary mb-4 md:mb-0">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to Games</span>
            </Link>
            
            <h1 className="text-3xl font-bold text-center mb-4 md:mb-0">Memory Flip</h1>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => initializeGame()}
                className="flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm p-2 rounded-full shadow-sm hover:shadow transition-all"
                aria-label="Restart game"
              >
                <RotateCcw className="h-5 w-5 text-primary" />
              </button>
              
              <button 
                onClick={() => setGameStarted(!gameStarted)}
                className="flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm p-2 rounded-full shadow-sm hover:shadow transition-all"
                aria-label="Game settings"
              >
                <Settings className="h-5 w-5 text-primary" />
              </button>
            </div>
          </div>
          
          {/* Game Controls */}
          <div className="mb-6">
            <DifficultySelector />
            
            <div className="flex flex-wrap justify-center items-center gap-4">
              <div className="flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <span className="text-sm font-medium mr-2">Moves:</span>
                <span className="font-bold">{moves}</span>
              </div>
              
              <div className="flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <span className="text-sm font-medium mr-2">Score:</span>
                <span className="font-bold">{score}</span>
              </div>
              
              <Timer 
                isRunning={gameStarted && !gameOver} 
                onTimeUpdate={setGameTime}
              />
            </div>
          </div>
          
          {/* Game Board - Using a consistent grid layout with fixed card sizes */}
          <div className="relative max-w-4xl mx-auto">
            <div className={`grid ${getGridConfig()} gap-2 md:gap-4`}>
              {cards.map((card) => (
                <div 
                  key={card.id}
                  className="aspect-square cursor-pointer transform transition-all duration-300"
                  onClick={() => handleCardClick(card.id)}
                  style={{ 
                    perspective: "1000px",
                    width: "100%",
                    maxWidth: currentDifficulty === "hard" ? "65px" : (currentDifficulty === "medium" ? "80px" : "100px"),
                    margin: "0 auto"
                  }}
                >
                  <div
                    className={`absolute inset-0 rounded-lg bg-gradient-to-br from-pastel-purple to-pastel-blue flex items-center justify-center shadow-md ${
                      card.isFlipped || card.isMatched
                        ? "opacity-0"
                        : "opacity-100"
                    } transition-opacity duration-300 backface-hidden`}
                  >
                    <span className="text-2xl">?</span>
                  </div>
                  
                  <div
                    className={`absolute inset-0 rounded-lg bg-white flex items-center justify-center ${
                      card.isFlipped || card.isMatched
                        ? "opacity-100"
                        : "opacity-0"
                    } transition-opacity duration-300 backface-hidden ${
                      card.isMatched ? "bg-pastel-green bg-opacity-30" : ""
                    }`}
                  >
                    <span className="text-4xl">{card.emoji}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Game Over Message */}
          {gameOver && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 animate-fade-in">
              <div className="bg-white rounded-xl p-6 max-w-md mx-4 text-center shadow-lg animate-scale-in">
                <h2 className="text-2xl font-bold mb-4">🎉 Game Complete! 🎉</h2>
                <p className="mb-4">You completed the game with:</p>
                <div className="flex justify-around mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Moves</p>
                    <p className="text-xl font-bold">{moves}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="text-xl font-bold">{gameTime}s</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="text-xl font-bold">{score}</p>
                  </div>
                </div>
                
                {!user && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a profile to save your scores!
                  </p>
                )}
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => initializeGame()}
                    className="btn-game w-full"
                  >
                    Play Again
                  </button>
                  
                  {!user && (
                    <Link to="/profile" className="btn-secondary w-full">
                      Create Profile
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MemoryGame;
