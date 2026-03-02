// app/game/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TraceRecord } from '../../../src/types';
import { GAME_REGISTRY } from '../../../src/game/registry';

// CSS for custom animations
const animationStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
    50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
  }
  @keyframes bounce-gentle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  @keyframes shine {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-slide-in { animation: slideIn 0.5s ease-out; }
  .animate-pulse-glow { animation: pulse-glow 2s infinite; }
  .animate-bounce-gentle { animation: bounce-gentle 0.6s ease-in-out infinite; }
  .group:hover .group-hover\\:animate-shine { animation: shine 0.5s ease-in-out; }
`;

export default function GameRoom() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const gameMeta = GAME_REGISTRY[id];
  const adapter = gameMeta?.adapter;

  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [traces, setTraces] = useState<TraceRecord[]>([]);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (adapter && !state) setState(adapter.getInitialState());
  }, [adapter, state]);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  if (!gameMeta || !adapter || !state) return <div className="p-10 text-center">Loading...</div>;

  const playTurn = async (action: string) => {
    if (state.isTerminal || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: id, state, humanAction: action, apiKey })
      });
      const data = await res.json();
      
      // Safety net: check if API returned an error
      if (data.error) {
        alert("Agent Error: " + data.error);
        setLoading(false);
        return;
      }

      // AI is always autonomous - directly apply the result
      if (data.newState) setState(data.newState);
      if (data.trace) setTraces((prev) => [data.trace, ...prev]);
    } catch (err) {
      console.error("Network error:", err);
      alert("Failed to communicate with Agent.");
    } finally {
      setLoading(false);
    }
  };

  const RuleBook = () => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span>📖</span> Rule Book
      </h2>
      <div className="text-sm text-gray-600 space-y-6">
        {id === 'overcooked-lite' ? (
          <div className="space-y-4">
            <p className="font-bold text-blue-600">MISSION: SALAD RUSH</p>
            <p>Work as a team with the AI Agent to prepare and serve as many salads as possible before the rounds end.</p>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="font-bold text-blue-800 text-xs mb-2">RECIPE & STEPS:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li><strong>CHOP_TOMATO:</strong> Prepares the tomato.</li>
                <li><strong>CHOP_LETTUCE:</strong> Prepares the lettuce.</li>
                <li><strong>SERVE:</strong> Only works when BOTH items are READY.</li>
              </ul>
            </div>
            <p className="font-bold text-green-600">SCORING: +10 Points per Serve.</p>
          </div>
        ) : id === 'monopoly-lite' ? (
          <div className="space-y-4">
            <p className="font-bold text-green-600">MISSION: FINANCIAL DOMINANCE</p>
            <p>Manage your cash and buy properties to outscore the AI rival.</p>
            <div className="p-3 bg-green-50 rounded-xl border border-green-100">
              <p className="font-bold text-green-800 text-xs mb-2">ACTIONS:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li><strong>BUY_LAND:</strong> Costs $300. Adds 1 Property.</li>
                <li><strong>SAVE_CASH:</strong> Earns $100 interest.</li>
              </ul>
            </div>
            <p className="font-bold text-gray-800 text-xs">Score = Cash + (Properties * $500)</p>
          </div>
        ) : id === 'deduction-game' ? (
          <div className="space-y-4">
            <p className="font-bold text-purple-600">MISSION: CATCH THE BLUFF</p>
            <p>Each player has 3 secret dice. Use math and intuition to spot the AI's lie—or convince the AI that your bid is real!</p>
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
              <p className="font-bold text-purple-800 text-xs mb-2">GAME FLOW:</p>
              <ul className="list-disc ml-4 space-y-1 text-xs">
                <li><strong>Each Round:</strong> You and AI each roll 3 hidden dice (1-6).</li>
                <li><strong>Bidding:</strong> Take turns raising bids (e.g., "Three 4s").</li>
                <li><strong>Higher Bids:</strong> More quantity OR higher dice face required.</li>
                <li><strong>Challenge:</strong> Call "Liar!" to reveal all dice.</li>
              </ul>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
              <p className="font-bold text-purple-800 text-xs mb-2">ACTIONS:</p>
              <ul className="list-disc ml-4 space-y-1 text-xs">
                <li><strong>BID_qty_face:</strong> Bid (e.g., BID_3_4 = "Three 4s").</li>
                <li><strong>CHALLENGE:</strong> Call the last bid a bluff.</li>
              </ul>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
              <p className="font-bold text-purple-800 text-xs mb-2">WINNING:</p>
              <ul className="list-disc ml-4 space-y-1 text-xs">
                <li><strong>Bid is TRUE:</strong> Bidder +1 pt.</li>
                <li><strong>Bid is FALSE:</strong> Challenger +1 pt.</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-bold text-red-600">MISSION: TRUST OR BETRAY</p>
            <p>A classic social dilemma. You and the AI must choose to Share or Steal resources.</p>
            <div className="p-3 bg-red-50 rounded-xl border border-red-100 space-y-2">
              <p className="font-bold text-red-800 text-xs mb-1">PAYOFF MATRIX:</p>
              <p>• Both <strong>SHARE</strong>: Both get +3 pts.</p>
              <p>• You <strong>STEAL</strong> / AI Shares: You get +5, AI gets 0.</p>
              <p>• Both <strong>STEAL</strong>: Both get +1 pt.</p>
            </div>
          </div>
        )}
      </div>
      <button onClick={() => router.push('/')} className="mt-8 w-full py-3 text-sm font-bold text-gray-400 hover:text-blue-500 transition-colors uppercase tracking-widest">
        &larr; Exit to Lobby
      </button>
    </div>
  );

  return (
    <main className="min-h-screen p-6 md:p-10 bg-gray-50 text-gray-900 font-sans relative">
      <style>{animationStyles}</style>
      {/* Game End Modal */}
      {state.isTerminal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl animate-slide-in relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-purple-50 opacity-40 animate-pulse"></div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2">
              <div className={`p-8 md:p-10 flex flex-col items-center justify-center text-center ${state.scores.human > state.scores.ai ? 'bg-gradient-to-br from-green-100 via-emerald-100 to-green-200' : state.scores.human === state.scores.ai ? 'bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-200' : 'bg-gradient-to-br from-orange-100 via-red-100 to-orange-200'}`}>
                <p className="text-7xl font-black mb-4 animate-bounce-gentle inline-block">
                  {state.scores.human > state.scores.ai ? '🎉' : state.scores.human === state.scores.ai ? '🤝' : '😢'}
                </p>
                <p className={`text-5xl font-black tracking-tight ${state.scores.human > state.scores.ai ? 'text-green-700 drop-shadow-lg' : state.scores.human === state.scores.ai ? 'text-blue-700 drop-shadow-lg' : 'text-red-700 drop-shadow-lg'}`}>
                  {state.scores.human > state.scores.ai ? 'VICTORY!' : state.scores.human === state.scores.ai ? 'DRAW!' : 'DEFEAT'}
                </p>
              </div>

              <div className="p-6 md:p-8 space-y-5">
                <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">Final Score</p>
                  <div className="grid grid-cols-2 gap-6 mb-5">
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">You</p>
                      <p className="text-5xl font-black text-blue-600">{state.scores.human}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">AI</p>
                      <p className="text-5xl font-black text-red-600">{state.scores.ai}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-600 uppercase">Score Comparison</p>
                    <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden border-2 border-gray-400">
                      <div
                        className={`h-full transition-all duration-1500 ease-out relative ${state.scores.human > state.scores.ai ? 'bg-gradient-to-r from-blue-400 to-blue-600' : state.scores.ai > state.scores.human ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-purple-400 to-purple-600'}`}
                        style={{ width: `${state.scores.human > state.scores.ai ? 70 : state.scores.ai > state.scores.human ? 30 : 50}%` }}
                      >
                        <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                  <div className="text-center bg-white rounded-lg border border-blue-100 p-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Rounds</p>
                    <p className="text-2xl font-black text-blue-600">{state.currentRound - 1}</p>
                  </div>
                  <div className="text-center bg-white rounded-lg border border-blue-100 p-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Mode</p>
                    <p className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-lg capitalize inline-block">{id.replace('-', ' ')}</p>
                  </div>
                  <div className="text-center bg-white rounded-lg border border-blue-100 p-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Traces</p>
                    <p className="text-2xl font-black text-purple-600">{traces.length}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setState(adapter.getInitialState())}
                    className="flex-1 relative group bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 uppercase text-xs tracking-wider shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0"
                  >
                    <span className="relative flex items-center justify-center gap-2">
                      <span className="text-lg">🎮</span>
                      Play Again
                    </span>
                  </button>
                  <button
                    onClick={() => router.push('/game')}
                    className="flex-1 relative group bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700 font-bold py-3 rounded-xl hover:from-gray-400 hover:to-gray-500 transition-all duration-300 uppercase text-xs tracking-wider shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0"
                  >
                    <span className="relative flex items-center justify-center gap-2">
                      <span className="text-lg">🏠</span>
                      Back to Lobby
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Game Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <div className="lg:col-span-1">
          <RuleBook />
        </div>

        <div className="lg:col-span-3 space-y-6">
          
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow duration-300 animate-slide-in">
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{gameMeta.name}</h1>
            
            {/* AI Role Indicator - Enhanced */}
            <div className="mb-8 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl inline-flex items-center gap-4 border border-gray-200 hover:border-blue-300 transition-all duration-300">
              <span className="text-2xl animate-float">🤖</span>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Role</p>
                <p className="text-sm font-bold text-gray-700 mt-1">
                  {id === 'overcooked-lite' ? '🤝 Teammate' : '⚔️ Opponent'}
                </p>
              </div>
            </div>
            
            <p className="text-xs font-bold text-gray-400 mb-6 tracking-widest">ROUND PROGRESS: {state.currentRound} / {state.maxRounds}</p>
            
            <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 h-3 rounded-full mb-8 overflow-hidden border border-gray-300">
              <div 
                className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 h-3 rounded-full transition-all duration-700 shadow-md relative" 
                style={{ width: `${(state.currentRound / state.maxRounds) * 100}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
              </div>
            </div>

            {/* Score Display - Enhanced with animations */}
            <div className="flex justify-center gap-16 px-8">
              <div className="space-y-2 group">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">👤 You</p>
                <p className="text-6xl font-black text-blue-600 group-hover:scale-110 group-hover:text-blue-700 transition-all duration-300 drop-shadow-sm">{state.scores.human}</p>
                <div className="h-1 w-8 bg-blue-600 rounded-full mx-auto group-hover:w-12 transition-all duration-300"></div>
              </div>
              <div className="h-20 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              <div className="space-y-2 group">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">🤖 AI</p>
                <p className="text-6xl font-black text-red-600 group-hover:scale-110 group-hover:text-red-700 transition-all duration-300 drop-shadow-sm">{state.scores.ai}</p>
                <div className="h-1 w-8 bg-red-600 rounded-full mx-auto group-hover:w-12 transition-all duration-300"></div>
              </div>
            </div>
          </div>

          {id === 'monopoly-lite' && (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 animate-slide-in" style={{animationDelay: '0.15s'}}>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 text-center flex items-center justify-center gap-2">
                <span className="text-xl animate-float">🏠</span> Assets Overview
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border-3 border-blue-400 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 text-center group hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                    <span className="text-lg">👤</span> Your Assets
                  </p>
                  <p className="text-4xl font-black text-blue-600 drop-shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300">${state.cash?.human || 0}</p>
                  <div className="p-3 bg-white rounded-lg border-2 border-blue-300">
                    <p className="text-sm font-bold text-blue-700">🏠 <span className="text-2xl font-black text-blue-600">{state.properties?.human || 0}</span></p>
                    <p className="text-xs text-gray-600 font-semibold mt-1">Properties</p>
                  </div>
                </div>
                
                <div className="p-6 rounded-2xl border-3 border-red-400 bg-gradient-to-br from-red-50 via-red-100 to-red-50 text-center group hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300">
                  <p className="text-xs font-bold text-red-700 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                    <span className="text-lg">🤖</span> AI Assets
                  </p>
                  <p className="text-4xl font-black text-red-600 drop-shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300">${state.cash?.ai || 0}</p>
                  <div className="p-3 bg-white rounded-lg border-2 border-red-300">
                    <p className="text-sm font-bold text-red-700">🏠 <span className="text-2xl font-black text-red-600">{state.properties?.ai || 0}</span></p>
                    <p className="text-xs text-gray-600 font-semibold mt-1">Properties</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {id === 'overcooked-lite' && (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 animate-slide-in" style={{animationDelay: '0.15s'}}>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 text-center flex items-center justify-center gap-2">
                <span className="text-xl animate-float">👨‍🍳</span> Kitchen Status
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className={`p-8 rounded-2xl border-3 text-center transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 group ${state.inventory.tomatoPrepped ? 'bg-gradient-to-br from-red-100 via-red-50 to-red-100 border-red-500 shadow-lg shadow-red-200 scale-105' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 opacity-60'}`}>
                  <span className={`text-6xl mb-4 block inline-block ${state.inventory.tomatoPrepped ? 'animate-bounce-gentle' : ''}`}>🍅</span>
                  <p className="text-xs font-black uppercase tracking-widest">Tomato</p>
                  <p className={`text-lg font-black mt-2 transition-colors ${state.inventory.tomatoPrepped ? 'text-red-600' : 'text-gray-400'}`}>
                    {state.inventory.tomatoPrepped ? '✅ READY' : '⏳ WAITING'}
                  </p>
                </div>
                <div className={`p-8 rounded-2xl border-3 text-center transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 group ${state.inventory.lettucePrepped ? 'bg-gradient-to-br from-green-100 via-green-50 to-green-100 border-green-500 shadow-lg shadow-green-200 scale-105' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 opacity-60'}`}>
                  <span className={`text-6xl mb-4 block inline-block ${state.inventory.lettucePrepped ? 'animate-bounce-gentle' : ''}`}>🥬</span>
                  <p className="text-xs font-black uppercase tracking-widest">Lettuce</p>
                  <p className={`text-lg font-black mt-2 transition-colors ${state.inventory.lettucePrepped ? 'text-green-600' : 'text-gray-400'}`}>
                    {state.inventory.lettucePrepped ? '✅ READY' : '⏳ WAITING'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {id === 'deduction-game' && (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 animate-slide-in" style={{animationDelay: '0.15s'}}>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 text-center flex items-center justify-center gap-2">
                <span className="text-xl animate-float">🎲</span> Your Dice & Current Bid
              </h3>
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
                  <p className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span>🔒</span> Your Hidden Dice
                  </p>
                  <div className="flex justify-center gap-4">
                    {state.humanDice?.map((die: number, idx: number) => (
                      <div 
                        key={idx} 
                        className="w-16 h-16 bg-gradient-to-br from-purple-200 to-purple-400 border-3 border-purple-600 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 cursor-pointer group"
                      >
                        <span className="text-3xl font-black text-white drop-shadow-lg group-hover:scale-125 transition-transform duration-300">{die}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {state.currentBid && (
                  <div className="p-5 rounded-xl border-3 border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
                    <p className="text-xs font-bold text-yellow-700 mb-2 flex items-center gap-2">
                      <span>🎯</span> Current Bid ({state.currentBid.biddingPlayer === 'human' ? '👤 You' : '🤖 AI'})
                    </p>
                    <p className="text-3xl font-black text-yellow-800 drop-shadow-sm">
                      {state.currentBid.quantity} × <span className="text-yellow-600">⭐️</span>{state.currentBid.faceValue}s
                    </p>
                  </div>
                )}
                
                {state.gamePhase === 'reveal' && state.revealedDice && (
                  <div className="p-5 rounded-xl border-3 border-purple-400 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 shadow-lg">
                    <p className="text-xs font-bold text-purple-700 mb-4 flex items-center gap-2">
                      <span className="text-lg animate-bounce-gentle">🎲</span> Revealed Dice
                    </p>
                    <div className="grid grid-cols-2 gap-6 mb-4">
                      <div className="p-4 bg-white rounded-lg border-2 border-blue-300">
                        <p className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-2">
                          <span>👤</span> Your Dice
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {state.revealedDice.human.map((die: number, idx: number) => (
                            <div key={idx} className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-300 border-2 border-blue-500 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg hover:scale-125 transition-all">
                              <span className="font-bold text-blue-700 text-lg drop-shadow">{die}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-lg border-2 border-red-300">
                        <p className="text-xs font-bold text-red-700 mb-3 flex items-center gap-2">
                          <span>🤖</span> AI Dice
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {state.revealedDice.ai.map((die: number, idx: number) => (
                            <div key={idx} className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-300 border-2 border-red-500 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg hover:scale-125 transition-all">
                              <span className="font-bold text-red-700 text-lg drop-shadow">{die}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {state.roundResult && (
                      <div className={`mt-4 p-4 rounded-lg border-2 transition-all duration-300 ${state.roundResult.winner === 'human' ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-500 shadow-lg shadow-green-200' : 'bg-gradient-to-r from-red-100 to-rose-100 border-red-500 shadow-lg shadow-red-200'}`}>
                        <p className={`text-xs font-black flex items-center gap-2 ${state.roundResult.winner === 'human' ? 'text-green-800' : 'text-red-800'}`}>
                          <span className="text-lg">{state.roundResult.winner === 'human' ? '✅' : '❌'}</span>
                          {state.roundResult.reason}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 animate-slide-in" style={{animationDelay: '0.1s'}}>
            {!state.isTerminal ? (
              <div className="grid grid-cols-2 gap-4">
                {adapter.listLegalActions(state).map((action, idx) => (
                  <button 
                    key={action} 
                    onClick={() => playTurn(action)} 
                    disabled={loading}
                    className={`py-6 rounded-xl font-bold text-white transition-all duration-200 active:scale-95 shadow-md uppercase tracking-widest text-xs relative group overflow-hidden hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${idx % 2 === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' : 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'}`}
                  >
                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <span className="inline-block animate-spin">⚙️</span>
                          AI is playing...
                        </>
                      ) : (
                        action
                      )}
                    </span>
                    <div className={`absolute inset-0 ${idx % 2 === 0 ? 'bg-gradient-to-r from-white via-transparent to-transparent' : 'bg-gradient-to-r from-white via-transparent to-transparent'} opacity-0 group-hover:opacity-20 group-active:opacity-0 transition-opacity duration-200 pointer-events-none`}></div>
                  </button>
                ))}
              </div>
            ) : (
              <button 
                onClick={() => setState(adapter.getInitialState())} 
                className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-6 font-bold rounded-xl hover:from-black hover:to-gray-900 transition-all duration-300 shadow-xl hover:shadow-2xl uppercase tracking-widest text-sm active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="text-xl">🔄</span>
                Restart Session
              </button>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 animate-slide-in" style={{animationDelay: '0.2s'}}>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-6 text-center flex items-center justify-center gap-2">
              <span className="text-lg">🧠</span> AI Decision Trace
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-3 scroll-smooth">
              {traces.map((t, idx) => (
                <div 
                  key={t.traceId} 
                  className="p-4 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 hover:shadow-lg hover:border-purple-400 transition-all duration-300 group cursor-pointer transform hover:scale-101 hover:-translate-y-1"
                  style={{animationDelay: `${idx * 0.05}s`}}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <p className="text-xs font-black text-purple-700 uppercase tracking-widest mb-1">Round {traces.length - idx}</p>
                      <p className="text-sm font-bold text-gray-800 mt-1">
                        🤖 AI Decision: <span className="text-purple-600 bg-purple-100 px-2 py-1 rounded-lg text-xs font-black">{t.modelOutput?.type || 'UNKNOWN'}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white px-3 py-2 rounded-lg text-xs font-black shadow-md group-hover:shadow-lg transition-shadow">
                        {Math.round((t.modelOutput?.confidence || 0.8) * 100)}%
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold mt-1">Confidence</p>
                    </div>
                  </div>
                  
                  {/* Explanation with icon */}
                  <p className="text-xs text-gray-600 italic leading-relaxed border-l-4 border-purple-400 pl-3 mb-3 bg-white/50 p-2 rounded">
                    <span className="font-semibold">💭 Reasoning:</span> "{t.modelOutput?.explanation || 'Strategic decision'}"
                  </p>
                  
                  {/* Status badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full transition-all ${t.isValidated ? 'bg-green-100 text-green-700 shadow-sm' : 'bg-red-100 text-red-700 shadow-sm'}`}>
                      {t.isValidated ? '✅ Valid Move' : '❌ Invalid'}
                    </span>
                    <span className="text-xs font-bold px-2 py-1 rounded-full transition-all bg-gray-100 text-gray-700">
                      🤖 Autonomous Agent
                    </span>
                  </div>
                </div>
              ))}
              {traces.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-300 text-sm font-semibold italic">Waiting for agent to make decisions...</p>
                  <p className="text-gray-200 text-xs mt-2">🤔 Trace records will appear here</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}