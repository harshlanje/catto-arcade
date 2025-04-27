
import React, { createContext, useContext, useState, useEffect } from "react";

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

  // Load user data from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("arcadeUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedLeaderboard = localStorage.getItem("arcadeLeaderboard");
    if (storedLeaderboard) {
      setLeaderboard(JSON.parse(storedLeaderboard));
    }

    const storedSound = localStorage.getItem("arcadeSoundEnabled");
    if (storedSound !== null) {
      setSoundEnabled(JSON.parse(storedSound));
    }

    const storedDifficulty = localStorage.getItem("arcadeDifficulty");
    if (storedDifficulty) {
      setCurrentDifficulty(storedDifficulty as Difficulty);
    }
  }, []);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("arcadeUser", JSON.stringify(user));
    }
  }, [user]);

  // Save leaderboard to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("arcadeLeaderboard", JSON.stringify(leaderboard));
  }, [leaderboard]);

  // Save sound preference to localStorage
  useEffect(() => {
    localStorage.setItem("arcadeSoundEnabled", JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // Save difficulty preference to localStorage
  useEffect(() => {
    localStorage.setItem("arcadeDifficulty", currentDifficulty);
  }, [currentDifficulty]);

  // Function to add a new score
  const addScore = (newScore: Score) => {
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
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
