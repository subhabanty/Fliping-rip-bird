
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
      const prompt = `A player just finished a round of 'Netlify Bird'. 
        Score: ${currentScore}. 
        Best: ${bestScore}. 
        You are the 'Netlify Flight Coach'. You are incredibly supportive, calm, and friendly. 
        Provide a 1-sentence warm encouragement. 
        Focus on the joy of flying and the progress they are making. 
        If they beat a record, celebrate! If not, tell them they have 'excellent form'.
        Keep it under 15 words and use a gentle emoji like ✨, ☁️, or 🐦.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAiCommentary(response.text || "Your wings are getting stronger with every flight! ☁️");
    } catch (error) {
      setAiCommentary("The sky is waiting for you! Keep soaring! ✨");
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
    <div className="relative w-full h-screen flex items-center justify-center bg-[#f8fafc] overflow-hidden select-none font-sans">
      {/* Abstract Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full -ml-32 -mb-32 blur-3xl"></div>

      <div className="relative shadow-[0_20px_60px_-15px_rgba(0,199,183,0.15)] overflow-hidden rounded-[2.5rem] border-[12px] border-white bg-white">
        <GameEngine 
          gameState={gameState} 
          onGameOver={handleGameOver} 
          onScoreUpdate={setScore}
        />

        {/* Start Overlay */}
        {gameState === GameState.START && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center z-20 transition-all duration-700 p-8 text-center">
            <div className="mb-10 animate-bounce">
                <div className="text-teal-500 font-bold text-[10px] tracking-[0.2em] mb-3 uppercase">Netlify Presents</div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                  NETLIFY BIRD
                </h1>
                <div className="w-12 h-1.5 bg-teal-400 mx-auto mt-3 rounded-full"></div>
            </div>
            
            <p className="text-slate-500 text-sm mb-10 leading-relaxed max-w-[220px]">
              A peaceful journey through the clouds. Tap to keep our friend afloat!
            </p>

            <button 
              onClick={startGame}
              className="w-full max-w-[220px] py-4.5 bg-gradient-to-br from-teal-400 to-teal-600 hover:from-teal-300 hover:to-teal-500 text-white rounded-2xl font-bold shadow-xl shadow-teal-200/50 transition-all active:scale-95 text-lg"
            >
              Start Flight
            </button>

            <div className="mt-10 flex gap-6 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div> Space</span>
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div> Click</span>
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div> Tap</span>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === GameState.GAMEOVER && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center z-20 p-8 text-center">
            <div className="mb-2 text-teal-600 font-bold text-sm tracking-widest uppercase">Well Done!</div>
            <h2 className="text-3xl font-black mb-8 text-slate-800">Flight Complete</h2>
            
            <div className="flex gap-4 w-full max-w-[300px] mb-8">
                <div className="flex-1 bg-teal-50/50 p-5 rounded-3xl border-2 border-teal-100">
                    <div className="text-[10px] font-bold text-teal-500 uppercase mb-1 tracking-wider">Score</div>
                    <div className="text-3xl font-black text-teal-700">{score}</div>
                </div>
                <div className="flex-1 bg-slate-50 p-5 rounded-3xl border-2 border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Best</div>
                    <div className="text-3xl font-black text-slate-600">{highScore}</div>
                </div>
            </div>

            {/* AI Coaching Card */}
            <div className="w-full max-w-[320px] bg-gradient-to-br from-white to-slate-50 border border-slate-100 rounded-3xl p-6 mb-10 shadow-sm relative group">
               {isAiLoading ? (
                 <div className="flex items-center justify-center gap-2 py-2">
                   <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                   <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse [animation-delay:200ms]"></div>
                   <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse [animation-delay:400ms]"></div>
                 </div>
               ) : (
                 <p className="text-[15px] leading-relaxed text-slate-700 font-semibold italic">
                    "{aiCommentary || "You're getting better with every wingbeat! 🐦"}"
                 </p>
               )}
               <div className="absolute -top-3 -right-3 bg-teal-500 text-white text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-tighter shadow-lg">AI Coach</div>
            </div>

            <button 
              onClick={startGame}
              className="w-full max-w-[240px] py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all active:scale-95 mb-4"
            >
              Take Off Again
            </button>
            <button 
              onClick={() => setGameState(GameState.START)}
              className="text-slate-400 hover:text-teal-500 text-xs font-bold transition-colors uppercase tracking-widest"
            >
              Menu
            </button>
          </div>
        )}

        {/* Score HUD */}
        {gameState === GameState.PLAYING && (
          <div className="absolute top-10 left-0 w-full flex justify-center z-10 pointer-events-none">
            <div className="bg-white shadow-[0_10px_30px_rgba(0,199,183,0.1)] px-8 py-3 rounded-full border-2 border-teal-50">
                <span className="text-3xl font-black text-slate-800 tracking-tight">{score}</span>
            </div>
          </div>
        )}
      </div>

      {/* Netlify Branding Footer */}
      <div className="absolute bottom-8 flex flex-col items-center opacity-70">
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200 transition-all hover:opacity-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="#00C7B7"/>
            </svg>
            <span className="text-[10px] text-slate-500 tracking-widest font-bold uppercase">Deployed on Netlify</span>
        </div>
      </div>
    </div>
  );
};

export default App;
