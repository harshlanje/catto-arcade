
import { Direction } from "@/types/snakeGame";

type MobileControlsProps = {
  onSwipe: (direction: Direction) => void;
};

const MobileControls = ({ onSwipe }: MobileControlsProps) => {
  return (
    <div className="md:hidden">
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
        <div className="col-start-2">
          <button
            className="w-full h-16 flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm"
            onClick={() => onSwipe("UP")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
        
        <div>
          <button
            className="w-full h-16 flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm"
            onClick={() => onSwipe("LEFT")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        <div className="col-start-3">
          <button
            className="w-full h-16 flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm"
            onClick={() => onSwipe("RIGHT")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="col-start-2">
          <button
            className="w-full h-16 flex items-center justify-center bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm"
            onClick={() => onSwipe("DOWN")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileControls;
