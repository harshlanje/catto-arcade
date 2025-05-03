
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import GameCard from "@/components/GameCard";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import SoundEffect from "@/components/SoundEffect";

const Index = () => {
  const { user: gameUser } = useGame();
  const { user: authUser } = useAuth();
  const [playSound, setPlaySound] = useState(false);

  // Generate placeholder images for the games using colorful gradients
  const memoryGameImage = "https://cdn.discordapp.com/attachments/1367034059209048145/1367043773896458281/memory-flip.png?ex=68171aba&is=6815c93a&hm=13f4b3fe49345bbe004aaa5ddfc7f7e776b488aefb47b00c95db1b888f367f2b&";
  const ticTacToeImage = "https://cdn.discordapp.com/attachments/1367034059209048145/1367043774399643698/tic-tac-toe.png?ex=68171aba&is=6815c93a&hm=48dc5acb1d1d691e0e116574caafd406537400d6c3c1d6b079f47a3693599980&";
  const snakeGameImage = "https://cdn.discordapp.com/attachments/1367034059209048145/1367043774169092117/snake.png?ex=68171aba&is=6815c93a&hm=e6c1f16a7e3bd6a1fa81fcc676d519ab7908be8bd382be25747277a86d989df0&";

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
            Welcome to Catto's Arcade
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {authUser 
              ? `Welcome back, ${gameUser?.username || 'Player'}! Ready to play some fun games?`
              : "Create a profile and enjoy a collection of classic games"}
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
          <p>Catto's Arcade &copy; {new Date().getFullYear()} - Made by Harsh Lanje - Built with React & TailwindCSS</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
