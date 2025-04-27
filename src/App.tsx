
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "./contexts/GameContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MemoryGame from "./pages/MemoryGame";
import TicTacToe from "./pages/TicTacToe";
import SnakeGame from "./pages/SnakeGame";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GameProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/memory-game" element={<MemoryGame />} />
            <Route path="/tic-tac-toe" element={<TicTacToe />} />
            <Route path="/snake-game" element={<SnakeGame />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </GameProvider>
  </QueryClientProvider>
);

export default App;
