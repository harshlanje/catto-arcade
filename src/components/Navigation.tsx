
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGame } from "@/contexts/GameContext";
import { Gamepad, User, Trophy, Volume2, VolumeX } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  const { user, soundEnabled, toggleSound } = useGame();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Gamepad className="h-8 w-8 text-primary animate-float" />
              <span className="ml-2 text-xl font-bold text-foreground">
                Pastel Arcade
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className={`nav-link ${isActive("/") ? "active" : ""}`}
            >
              Home
            </Link>
            <Link
              to="/leaderboard"
              className={`nav-link ${isActive("/leaderboard") ? "active" : ""}`}
            >
              Leaderboard
            </Link>
            <Link
              to="/profile"
              className={`nav-link ${isActive("/profile") ? "active" : ""}`}
            >
              {user ? user.username : "Profile"}
            </Link>
            <button 
              onClick={toggleSound} 
              className="ml-4 p-2 rounded-full hover:bg-muted transition-colors"
              aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5 text-primary" />
              ) : (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleSound} 
              className="p-2 rounded-full hover:bg-muted transition-colors mr-2"
              aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5 text-primary" />
              ) : (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-primary focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white bg-opacity-90 backdrop-filter backdrop-blur-md animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/")
                  ? "bg-primary bg-opacity-20 text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/leaderboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/leaderboard")
                  ? "bg-primary bg-opacity-20 text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              Leaderboard
            </Link>
            <Link
              to="/profile"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/profile")
                  ? "bg-primary bg-opacity-20 text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {user ? user.username : "Profile"}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
