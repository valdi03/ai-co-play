"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GAME_REGISTRY } from '../src/game/registry';

export default function Lobby() {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
    }
  }, []);

  const handleSaveKey = (val: string) => {
    setApiKey(val);
    localStorage.setItem('gemini_api_key', val);
    setIsSaved(true);
  };

  const games = Object.values(GAME_REGISTRY);

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Hero */}
        <div className="text-center py-10 space-y-5">
          <span className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-wider">
            Autonomous Multi-Agent Gameplay
          </span>
          <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight">
            AI Co-Play
          </h1>
          <p className="text-lg md:text-xl font-semibold text-gray-700">
            This Is Not Just Another Game Lobby.
          </p>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Play against AI agents that make their own strategic decisions from live game state and legal moves.
            No scripted first-round behavior. No fixed difficulty rails. Just adaptive, autonomous play.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl mx-auto pt-2">
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-sm font-semibold text-gray-700">🧠 Real-time AI reasoning</div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-sm font-semibold text-gray-700">⚖️ Legal-action constrained decisions</div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-sm font-semibold text-gray-700">📊 Transparent decision trace</div>
          </div>
          <p className="text-sm font-semibold text-gray-500">built by @lerenaminy</p>
        </div>

        {/* Global API Settings */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 uppercase tracking-wider">Gemini API Key</label>
              <input
                type="password"
                placeholder="Enter your API Key..."
                value={apiKey}
                onChange={(e) => handleSaveKey(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
              />
              <p className="text-xs text-gray-400 mt-2">
                {isSaved ? "● Key active" : "○ API Key required to run AI agents"}
              </p>
            </div>
          </div>
        </div>

        {/* Game Cards Grid - Fixed: Clean headers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game) => (
            <Link href={`/game/${game.id}`} key={game.id} className="group block h-full">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-2xl">{game.type === 'Co-op' ? '🤝' : '⚔️'}</span>
                  <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded-lg uppercase tracking-widest">{game.type}</span>
                </div>
                
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-500 transition-colors uppercase">
                  {game.name}
                </h3>
                
                <p className="text-sm text-gray-500 flex-1 leading-relaxed">
                  {game.description}
                </p>
                
                <div className="mt-6 text-sm font-bold text-blue-500 flex items-center">
                  PLAY NOW <span className="ml-2">&rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}