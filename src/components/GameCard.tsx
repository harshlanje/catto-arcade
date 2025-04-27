
import { Link } from "react-router-dom";

type GameCardProps = {
  title: string;
  description: string;
  image: string;
  path: string;
};

const GameCard = ({ title, description, image, path }: GameCardProps) => {
  return (
    <div className="game-card h-full flex flex-col rounded-lg overflow-hidden shadow-md bg-card border border-border">
      <div className="h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground mb-4 flex-grow">{description}</p>
        <Link
          to={path}
          className="mt-auto btn-game w-full flex justify-center items-center"
        >
          Play Now
        </Link>
      </div>
    </div>
  );
};

export default GameCard;
