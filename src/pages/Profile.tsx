
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useGame } from "@/contexts/GameContext";
import { User, Trophy, Heart, LogOut } from "lucide-react";
import SoundEffect from "@/components/SoundEffect";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const { user, setUser, syncWithDatabase } = useGame();
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [playSound, setPlaySound] = useState(false);
  
  // List of avatar options (emoji for simplicity)
  const avatarOptions = [
    "😊", "😎", "🐱", "🐶", "🦊", "🦄", "🐼", "🐨", "🐯", "🦁", "🐸", "🐙"
  ];
  
  // Initialize form with user data if available
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setSelectedAvatar(user.avatar);
    }
  }, [user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError("Username cannot be empty!");
      return;
    }
    
    if (!selectedAvatar) {
      setError("Please select an avatar!");
      return;
    }
    
    setError("");
    
    // If user exists, update their info
    if (user) {
      setUser({
        ...user,
        username,
        avatar: selectedAvatar,
      });
      
      // If authenticated, sync with database
      if (authUser) {
        await syncWithDatabase();
      } else {
        setSuccess("Profile updated successfully!");
      }
      
      // Play success sound
      setPlaySound(true);
      setTimeout(() => setPlaySound(false), 100);
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <SoundEffect sound="success" play={playSound} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white bg-opacity-80 backdrop-filter backdrop-blur-md rounded-xl shadow-md p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Profile
            </h1>
            <p className="text-muted-foreground">
              {authUser ? "Update your gaming profile" : "Create a profile to track your scores"}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground" />
                </span>
                <Input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 w-full"
                  placeholder="Enter your username"
                />
              </div>
            </div>
            
            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Choose an Avatar
              </label>
              <div className="grid grid-cols-6 gap-2">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`h-12 w-12 text-2xl flex items-center justify-center rounded-full border-2 transition-all ${
                      selectedAvatar === avatar
                        ? "border-primary bg-primary bg-opacity-20 transform scale-110"
                        : "border-muted bg-white hover:border-primary/50"
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Error and Success Messages */}
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-md text-sm animate-fade-in">
                {success}
              </div>
            )}
            
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full btn-game py-3"
            >
              Update Profile
            </Button>
            
            {/* Logout Button - Only if authenticated */}
            {authUser && (
              <Button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            )}
          </form>
          
          {/* User Stats - Only shown for existing users */}
          {user && (
            <div className="mt-10 pt-6 border-t border-muted">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Your High Scores
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-pastel-purple bg-opacity-30 rounded-lg p-4 text-center">
                  <h3 className="font-medium mb-1">Memory Game</h3>
                  <p className="text-xl font-bold">{user.highScores.memoryGame}</p>
                </div>
                
                <div className="bg-pastel-blue bg-opacity-30 rounded-lg p-4 text-center">
                  <h3 className="font-medium mb-1">Tic Tac Toe</h3>
                  <p className="text-xl font-bold">{user.highScores.ticTacToe}</p>
                </div>
                
                <div className="bg-pastel-green bg-opacity-30 rounded-lg p-4 text-center">
                  <h3 className="font-medium mb-1">Snake Game</h3>
                  <p className="text-xl font-bold">{user.highScores.snakeGame}</p>
                </div>
              </div>
              
              {user.scores.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Heart className="h-4 w-4 mr-1 text-red-500" />
                    Recent Scores
                  </h3>
                  <div className="max-h-40 overflow-y-auto pr-2">
                    {user.scores.slice(-5).reverse().map((score, index) => (
                      <div 
                        key={index} 
                        className="flex justify-between items-center py-2 border-b border-muted last:border-0"
                      >
                        <span>{score.game.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-sm text-muted-foreground">{new Date(score.date).toLocaleDateString()}</span>
                        <span className="font-medium">{score.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
