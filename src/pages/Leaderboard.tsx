
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { useGame } from "@/contexts/GameContext";
import { Trophy, Medal, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type LeaderboardEntry = {
  id: string;
  game: string;
  score: number;
  difficulty: string;
  date: string;
  user_id: string;
  username: string;
  avatar: string;
};

const Leaderboard = () => {
  const { leaderboard, user } = useGame();
  const { user: authUser } = useAuth();
  const [filter, setFilter] = useState("all");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch leaderboard data from Supabase when component mounts
  useEffect(() => {
    fetchLeaderboardData();
  }, []);
  
  // Fetch leaderboard data from Supabase
  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scores')
        .select(`
          id,
          game,
          score,
          difficulty,
          date,
          user_id,
          profiles(username, avatar)
        `)
        .order('score', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      // Transform data to include username and avatar
      const transformedData: LeaderboardEntry[] = data.map(item => ({
        id: item.id,
        game: item.game,
        score: item.score,
        difficulty: item.difficulty,
        date: item.date,
        user_id: item.user_id,
        username: item.profiles?.username || 'Unknown Player',
        avatar: item.profiles?.avatar || '👤',
      }));
      
      setLeaderboardData(transformedData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      // Fall back to local leaderboard if fetch fails
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter leaderboard by game type
  const filteredLeaderboard = leaderboardData.filter(
    (score) => filter === "all" || score.game === filter
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center justify-center mb-2">
              <Trophy className="h-8 w-8 mr-3 text-yellow-500" />
              Leaderboard
            </h1>
            <p className="text-muted-foreground">
              Check out the top scores from players around the world!
            </p>
          </div>
          
          {/* Filter Controls */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm flex items-center mr-2">
              <Filter className="h-4 w-4 mr-1" /> Filter:
            </span>
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-1 text-sm rounded-full ${
                filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              All Games
            </button>
            <button
              onClick={() => setFilter("memoryGame")}
              className={`px-4 py-1 text-sm rounded-full ${
                filter === "memoryGame"
                  ? "bg-pastel-purple text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              Memory Game
            </button>
            <button
              onClick={() => setFilter("ticTacToe")}
              className={`px-4 py-1 text-sm rounded-full ${
                filter === "ticTacToe"
                  ? "bg-pastel-blue text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              Tic Tac Toe
            </button>
            <button
              onClick={() => setFilter("snakeGame")}
              className={`px-4 py-1 text-sm rounded-full ${
                filter === "snakeGame"
                  ? "bg-pastel-green text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              Snake Game
            </button>
          </div>
          
          {/* Leaderboard Table */}
          <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-md rounded-xl shadow-md overflow-hidden">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading leaderboard data...</p>
              </div>
            ) : filteredLeaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-muted">
                  <thead className="bg-muted bg-opacity-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Rank
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Player
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Game
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Score
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Difficulty
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white bg-opacity-50 divide-y divide-muted">
                    {filteredLeaderboard.map((score, index) => (
                      <tr 
                        key={score.id} 
                        className={`${
                          authUser && score.user_id === authUser.id
                            ? "bg-pastel-yellow bg-opacity-30"
                            : ""
                        } hover:bg-muted hover:bg-opacity-30 transition-colors`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {index === 0 && <Medal className="h-5 w-5 text-yellow-500 mr-1" />}
                            {index === 1 && <Medal className="h-5 w-5 text-gray-400 mr-1" />}
                            {index === 2 && <Medal className="h-5 w-5 text-amber-700 mr-1" />}
                            <span className="font-medium">{index + 1}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-xl mr-2">{score.avatar}</span>
                            <div className="font-medium text-foreground">
                              {authUser && score.user_id === authUser.id ? (
                                <span className="font-bold">You</span>
                              ) : (
                                score.username
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {score.game.replace(/([A-Z])/g, ' $1').trim()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold">
                          {score.score}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            score.difficulty === "easy" 
                              ? "bg-pastel-green bg-opacity-50" 
                              : score.difficulty === "medium"
                              ? "bg-pastel-blue bg-opacity-50"
                              : "bg-pastel-purple bg-opacity-50"
                          }`}>
                            {score.difficulty.charAt(0).toUpperCase() + score.difficulty.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(score.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No scores yet! Be the first to play.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
