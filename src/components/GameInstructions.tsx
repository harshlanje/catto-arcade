
const GameInstructions = () => {
  return (
    <div className="mt-8 text-center text-sm text-muted-foreground">
      <h3 className="font-medium mb-1">How to Play</h3>
      <p className="mb-2">Use arrow keys to control the snake. Collect food to grow longer.</p>
      <p>Avoid hitting walls and yourself. Press space to pause/resume.</p>
    </div>
  );
};

export default GameInstructions;
