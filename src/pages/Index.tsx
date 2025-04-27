
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import GameCard from "@/components/GameCard";
import { useGame } from "@/contexts/GameContext";
import SoundEffect from "@/components/SoundEffect";

const Index = () => {
  const { user } = useGame();
  const [playSound, setPlaySound] = useState(false);

  // Generate placeholder images for the games using colorful gradients
  const memoryGameImage = "https://img.freepik.com/free-vector/memory-game-children-cartoon-animals_23-2147803280.jpg";
  const ticTacToeImage = "https://img.freepik.com/free-vector/gradient-tic-tac-toe-background_23-2149275275.jpg";
  const snakeGameImage = "https://img.freepik.com/free-vector/snake-pixel-game-screen-green-animal-digital-entertainment_24877-3193.jpg";

  // Play welcome sound only once when the component mounts
  useEffect(() => {
    setPlaySound(true);
    const timer = setTimeout(() => setPlaySound(false), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <SoundEffect sound="click" play={playSound} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-shadow">
            Welcome to Pastel Arcade
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {user 
              ? `Welcome back, ${user.username}! Ready to play some fun games?`
              : "Create a profile and enjoy a collection of classic games with a pastel twist!"}
          </p>
        </div>
        
        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <GameCard
              title="Memory Flip"
              description="Test your memory by matching pairs of cards. How fast can you clear the board?"
              image={memoryGameImage}
              path="/memory-game"
            />
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <GameCard
              title="Tic Tac Toe"
              description="The classic game of X's and O's. Play against the computer and sharpen your strategy."
              image={ticTacToeImage}
              path="/tic-tac-toe"
            />
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <GameCard
              title="Snake Game"
              description="Guide the snake to eat food and grow longer. Just don't bump into yourself or the walls!"
              image={snakeGameImage}
              path="/snake-game"
            />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-md py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>Pastel Arcade &copy; {new Date().getFullYear()} - Built with React & TailwindCSS</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
