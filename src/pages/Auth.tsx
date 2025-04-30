
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signIn, signUp, supabase } from "@/lib/supabase";
import { User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SoundEffect from "@/components/SoundEffect";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("😊");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [playSound, setPlaySound] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // List of avatar options (emoji for simplicity)
  const avatarOptions = [
    "😊", "😎", "🐱", "🐶", "🦊", "🦄", "🐼", "🐨", "🐯", "🦁", "🐸", "🐙"
  ];
  
  // If user is already logged in, redirect to home
  if (user) {
    navigate("/");
    return null;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        // Login
        const { error } = await signIn(email, password);
        if (error) throw error;
        
        // Play success sound
        setPlaySound(true);
        setTimeout(() => setPlaySound(false), 100);
        
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        
        navigate("/");
      } else {
        // Signup
        if (!username.trim()) {
          throw new Error("Username cannot be empty");
        }
        
        const { error } = await signUp(email, password, {
          username,
          avatar: selectedAvatar,
        });
        
        if (error) throw error;
        
        // Play success sound
        setPlaySound(true);
        setTimeout(() => setPlaySound(false), 100);
        
        toast({
          title: "Account created!",
          description: "Please check your email to confirm your account.",
        });
        
        // Automatically log in the user if email verification is disabled
        const { error: loginError } = await signIn(email, password);
        if (!loginError) {
          navigate("/");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pastel-purple/30 via-pastel-blue/30 to-pastel-green/30">
      <SoundEffect sound="success" play={playSound} />
      
      <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-md rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-primary">Catto's Arcade</h1>
          </Link>
          
          <h2 className="text-2xl font-bold">
            {isLogin ? "Welcome Back!" : "Create Account"}
          </h2>
          <p className="text-muted-foreground">
            {isLogin 
              ? "Log in to access your account"
              : "Sign up to save your high scores"}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>
          </div>
          
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Choose an Avatar</Label>
                <div className="grid grid-cols-6 gap-2">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`h-10 w-10 text-xl flex items-center justify-center rounded-full border-2 transition-all ${
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
            </>
          )}
          
          <Button
            type="submit"
            className="w-full btn-game py-2"
            disabled={loading}
          >
            {loading 
              ? "Loading..."
              : isLogin ? "Log In" : "Sign Up"}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline focus:outline-none"
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Log In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
