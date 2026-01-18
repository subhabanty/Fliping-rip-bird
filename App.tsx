
import React, { useState, useEffect, useCallback } from 'react';
import GameEngine from './components/GameEngine';
import { GameState } from './types';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('flippingBirdHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [aiCommentary, setAiCommentary] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fetchAiCommentary = async (currentScore: number, bestScore: number) => {
    setIsAiLoading(true);
    setAiCommentary("");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `A player just played 'Cloudy Bird'. 
        Score: ${currentScore}. 
        Best: ${bestScore}. 
        You are a KIND, SUPPORTIVE, and FRIENDLY flight instructor. 
        Provide a 1-sentence warm encouragement or praise. 
        Even if they scored 0, be sweet and tell them they'll get it next time!
        Keep it under 12 words and use a friendly emoji.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAiCommentary(response.text || "You're doing great, keep flying! 🌤️");
    } catch (error) {
      setAiCommentary("The sky is the limit! Keep trying! ✨");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    setGameState(GameState.GAMEOVER);
    
    let currentBest = highScore;
    if (finalScore > highScore) {
      currentBest = finalScore;
      setHighScore(finalScore);
      localStorage.setItem('flippingBirdHighScore', finalScore.toString());
    }

    fetchAiCommentary(finalScore, currentBest);
  }, [highScore]);

  const startGame = () => {
    setScore(0);
    setAiCommentary("");
    setGameState(GameState.PLAYING);
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-[#f0f4f8] overflow-hidden select-none font-sans">
      <div className="relative shadow-2xl overflow-hidden rounded-3xl border-8 border-white bg-white">
        <GameEngine 
          gameState={gameState} 
          onGameOver={handleGameOver} 
          onScoreUpdate={setScore}
        />

        {/* Friendly Start Overlay */}
        {gameState === GameState.START && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-20 transition-all duration-700 p-8 text-center">
            <div className="mb-8 animate-bounce">
                <div className="text-blue-500 font-black text-xs tracking-widest mb-2 uppercase">Welcome to</div>
                <h1 className="text-4xl font-black text-blue-600 drop-shadow-sm">
                  CLOUDY BIRD
                </h1>
                <div className="w-16 h-1 bg-yellow-400 mx-auto mt-2 rounded-full"></div>
            </div>
            
            <p className="text-zinc-600 text-sm mb-8 leading-relaxed max-w-[200px]">
              Tap gently to help our little friend glide through the pipes!
            </p>

            <button 
              onClick={startGame}
              className="w-full max-w-[200px] py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 text-lg"
            >
              Let's Fly!
            </button>

            <div className="mt-8 flex gap-4 text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
                <span>Spacebar</span>
                <span className="text-zinc-300">•</span>
                <span>Click</span>
                <span className="text-zinc-300">•</span>
                <span>Tap</span>
            </div>
          </div>
        )}

        {/* Friendly Game Over Overlay */}
        {gameState === GameState.GAMEOVER && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-20 p-8 text-center">
            <div className="mb-2 text-blue-600 font-bold text-lg">Great Effort!</div>
            <h2 className="text-3xl font-black mb-6 text-zinc-800">Flight Complete</h2>
            
            <div className="flex gap-4 w-full max-w-[280px] mb-6">
                <div className="flex-1 bg-blue-50 p-4 rounded-2xl border-2 border-blue-100">
                    <div className="text-[10px] font-bold text-blue-400 uppercase mb-1">Score</div>
                    <div className="text-2xl font-black text-blue-700">{score}</div>
                </div>
                <div className="flex-1 bg-yellow-50 p-4 rounded-2xl border-2 border-yellow-100">
                    <div className="text-[10px] font-bold text-yellow-600 uppercase mb-1">Best</div>
                    <div className="text-2xl font-black text-yellow-700">{highScore}</div>
                </div>
            </div>

            {/* Supportive AI Coach */}
            <div className="w-full max-w-[300px] bg-white border-2 border-zinc-100 rounded-2xl p-5 mb-8 shadow-sm relative overflow-hidden">
               {isAiLoading ? (
                 <div className="flex items-center justify-center gap-2 py-2">
                   <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                   <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse [animation-delay:200ms]"></div>
                   <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse [animation-delay:400ms]"></div>
                 </div>
               ) : (
                 <p className="text-sm leading-relaxed text-zinc-700 font-medium italic">
                    {aiCommentary || "You're a natural-born flyer! 🌤️"}
                 </p>
               )}
               <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-yellow-400"></div>
            </div>

            <button 
              onClick={startGame}
              className="w-full max-w-[200px] py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all active:scale-95 mb-4"
            >
              Try Again
            </button>
            <button 
              onClick={() => setGameState(GameState.START)}
              className="text-zinc-400 hover:text-zinc-600 text-xs font-bold transition-colors"
            >
              BACK TO MENU
            </button>
          </div>
        )}

        {/* Floating HUD Score */}
        {gameState === GameState.PLAYING && (
          <div className="absolute top-8 left-0 w-full flex justify-center z-10 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg border-2 border-blue-100 animate-in fade-in slide-in-from-top-4 duration-500">
                <span className="text-3xl font-black text-blue-600">{score}</span>
            </div>
          </div>
        )}
      </div>

      {/* Cloud Decor - Friendly Google Cloud Vibe */}
      <div className="absolute bottom-10 flex flex-col items-center opacity-60">
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-zinc-200">
            <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#4285F4] rounded-full"></div>
                <div className="w-2 h-2 bg-[#EA4335] rounded-full"></div>
                <div className="w-2 h-2 bg-[#FBBC05] rounded-full"></div>
                <div className="w-2 h-2 bg-[#34A853] rounded-full"></div>
            </div>
            <span className="text-[10px] text-zinc-500 tracking-widest font-black uppercase">Optimized for Google Cloud</span>
        </div>
      </div>
    </div>
  );
};

export default App;
