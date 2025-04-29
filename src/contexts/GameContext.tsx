
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

// Define types for our context
type Difficulty = "easy" | "medium" | "hard";

type Score = {
  game: string;
  score: number;
  date: string;
  difficulty: Difficulty;
};

type User = {
  username: string;
  avatar: string;
  scores: Score[];
  highScores: {
    memoryGame: number;
    ticTacToe: number;
    snakeGame: number;
  };
};

type GameContextType = {
  user: User | null;
  leaderboard: Score[];
  soundEnabled: boolean;
  currentDifficulty: Difficulty;
  setUser: (user: User) => void;
  addScore: (score: Score) => void;
  toggleSound: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  syncWithDatabase: () => Promise<void>;
};

// Create context with default values
const GameContext = createContext<GameContextType>({
  user: null,
  leaderboard: [],
  soundEnabled: true,
  currentDifficulty: "medium",
  setUser: () => {},
  addScore: () => {},
  toggleSound: () => {},
  setDifficulty: () => {},
  syncWithDatabase: async () => {},
});

// Custom hook for using the context
export const useGame = () => useContext(GameContext);

// Provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [leaderboard, setLeaderboard] = useState<Score[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>("medium");
  const { user: authUser, loading } = useAuth();

  // Load preferences from localStorage on component mount
  useEffect(() => {
    const storedSound = localStorage.getItem("arcadeSoundEnabled");
    if (storedSound !== null) {
      setSoundEnabled(JSON.parse(storedSound));
    }

    const storedDifficulty = localStorage.getItem("arcadeDifficulty");
    if (storedDifficulty) {
      setCurrentDifficulty(storedDifficulty as Difficulty);
    }
    
    // Load leaderboard data
    fetchLeaderboard();
  }, []);

  // When auth user changes, fetch user data
  useEffect(() => {
    if (authUser && !loading) {
      fetchUserData();
    } else if (!authUser && !loading) {
      // If logged out, load from localStorage as fallback
      const storedUser = localStorage.getItem("arcadeUser");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [authUser, loading]);

  // Save sound preference to localStorage
  useEffect(() => {
    localStorage.setItem("arcadeSoundEnabled", JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // Save difficulty preference to localStorage
  useEffect(() => {
    localStorage.setItem("arcadeDifficulty", currentDifficulty);
  }, [currentDifficulty]);

  // Save user data to localStorage as fallback
  useEffect(() => {
    if (user) {
      localStorage.setItem("arcadeUser", JSON.stringify(user));
    }
  }, [user]);

  // Fetch user profile and scores from Supabase
  const fetchUserData = async () => {
    if (!authUser) return;

    try {
      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) throw profileError;

      // Get user scores
      const { data: scoresData, error: scoresError } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', authUser.id)
        .order('date', { ascending: false });

      if (scoresError) throw scoresError;

      // Transform scores format
      const transformedScores: Score[] = scoresData.map(score => ({
        game: score.game,
        score: score.score,
        date: score.date,
        difficulty: score.difficulty as Difficulty,
      }));

      // Calculate high scores
      const highScores = {
        memoryGame: 0,
        ticTacToe: 0,
        snakeGame: 0,
      };

      transformedScores.forEach(score => {
        if (score.game === "memoryGame" && score.score > highScores.memoryGame) {
          highScores.memoryGame = score.score;
        } else if (score.game === "ticTacToe" && score.score > highScores.ticTacToe) {
          highScores.ticTacToe = score.score;
        } else if (score.game === "snakeGame" && score.score > highScores.snakeGame) {
          highScores.snakeGame = score.score;
        }
      });

      // Set user with profile and scores
      setUser({
        username: profileData.username || authUser.email?.split('@')[0] || 'Player',
        avatar: profileData.avatar || '😊',
        scores: transformedScores,
        highScores,
      });

    } catch (error: any) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user data. Using offline mode.",
        variant: "destructive",
      });
    }
  };

  // Fetch leaderboard data from Supabase
  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select(`
          id,
          score,
          game,
          difficulty,
          date,
          user_id,
          profiles(username, avatar)
        `)
        .order('score', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Transform scores format
      const transformedScores: Score[] = data.map(score => ({
        game: score.game,
        score: score.score,
        date: score.date,
        difficulty: score.difficulty as Difficulty,
      }));

      setLeaderboard(transformedScores);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  // Function to add a new score
  const addScore = async (newScore: Score) => {
    // Update user scores
    if (user) {
      const updatedScores = [...user.scores, newScore];
      
      // Update high scores if necessary
      const highScores = { ...user.highScores };
      
      if (newScore.game === "memoryGame" && newScore.score > (user.highScores.memoryGame || 0)) {
        highScores.memoryGame = newScore.score;
      } else if (newScore.game === "ticTacToe" && newScore.score > (user.highScores.ticTacToe || 0)) {
        highScores.ticTacToe = newScore.score;
      } else if (newScore.game === "snakeGame" && newScore.score > (user.highScores.snakeGame || 0)) {
        highScores.snakeGame = newScore.score;
      }

      setUser({
        ...user,
        scores: updatedScores,
        highScores,
      });
    }

    // Update leaderboard
    const updatedLeaderboard = [...leaderboard, newScore].sort(
      (a, b) => b.score - a.score
    ).slice(0, 10); // Keep only top 10 scores
    
    setLeaderboard(updatedLeaderboard);

    // Save score to database if user is authenticated
    if (authUser) {
      try {
        const { error } = await supabase
          .from('scores')
          .insert({
            user_id: authUser.id,
            game: newScore.game,
            score: newScore.score,
            difficulty: newScore.difficulty,
            date: newScore.date,
          });

        if (error) throw error;
        
        // Refresh leaderboard data
        fetchLeaderboard();
      } catch (error: any) {
        console.error("Error saving score:", error);
        toast({
          title: "Error",
          description: "Failed to save score to database, but it's saved locally.",
          variant: "destructive",
        });
      }
    }
  };

  // Function to sync user data with database
  const syncWithDatabase = async () => {
    if (!authUser || !user) return;
    
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          username: user.username,
          avatar: user.avatar,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // Fetch latest user data
      await fetchUserData();
      
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error syncing data:", error);
      toast({
        title: "Error",
        description: "Failed to sync data with database.",
        variant: "destructive",
      });
    }
  };

  // Toggle sound on/off
  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  // Set difficulty level
  const setDifficulty = (difficulty: Difficulty) => {
    setCurrentDifficulty(difficulty);
  };

  return (
    <GameContext.Provider
      value={{
        user,
        leaderboard,
        soundEnabled,
        currentDifficulty,
        setUser,
        addScore,
        toggleSound,
        setDifficulty,
        syncWithDatabase,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
