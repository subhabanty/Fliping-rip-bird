
import React, { useState, useEffect, useCallback } from 'react';
import GameEngine from './components/GameEngine';
import { GameState } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('flippingBirdHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    setGameState(GameState.GAMEOVER);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('flippingBirdHighScore', finalScore.toString());
    }
  }, [highScore]);

  const startGame = () => {
    setScore(0);
    setGameState(GameState.PLAYING);
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-zinc-900 overflow-hidden select-none">
      <div className="relative shadow-2xl overflow-hidden rounded-lg">
        <GameEngine 
          gameState={gameState} 
          onGameOver={handleGameOver} 
          onScoreUpdate={setScore}
        />

        {/* Start Overlay */}
        {gameState === GameState.START && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white z-10 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold mb-8 retro-text text-yellow-400 text-center px-4 leading-relaxed">
              FLIPPING<br/>BIRD
            </h1>
            <button 
              onClick={startGame}
              className="px-8 py-4 bg-orange-500 border-b-8 border-orange-700 hover:bg-orange-400 active:border-b-0 active:translate-y-2 transition-all rounded text-sm mb-4"
            >
              START GAME
            </button>
            <p className="text-[10px] text-gray-300 animate-pulse">PRESS SPACE OR CLICK</p>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === GameState.GAMEOVER && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10 animate-in zoom-in duration-300">
            <h2 className="text-2xl font-bold mb-4 retro-text text-red-500">GAME OVER</h2>
            
            <div className="bg-orange-100 p-6 rounded-lg border-4 border-orange-800 text-orange-900 mb-8 w-64">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px]">SCORE</span>
                <span className="text-xl">{score}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px]">BEST</span>
                <span className="text-xl">{highScore}</span>
              </div>
            </div>

            <button 
              onClick={startGame}
              className="px-8 py-4 bg-orange-500 border-b-8 border-orange-700 hover:bg-orange-400 active:border-b-0 active:translate-y-2 transition-all rounded text-sm"
            >
              PLAY AGAIN
            </button>
          </div>
        )}

        {/* HUD Score */}
        {gameState === GameState.PLAYING && (
          <div className="absolute top-12 left-0 w-full flex justify-center z-10 pointer-events-none">
            <span className="text-4xl retro-text text-white drop-shadow-lg">{score}</span>
          </div>
        )}
      </div>

      {/* Background Decorative Text */}
      <div className="hidden lg:block absolute bottom-4 left-4 text-zinc-700 text-[10px]">
        USE SPACE OR MOUSE TO FLAP
      </div>
    </div>
  );
};

export default App;
