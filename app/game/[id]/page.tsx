// app/game/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GameState, ActionType, AutonomyLevel, TraceRecord, DifficultyLevel } from '../../../src/types';
import { GAME_REGISTRY } from '../../../src/game/registry';

export default function GameRoom() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const gameMeta = GAME_REGISTRY[id];
  const adapter = gameMeta?.adapter;

  const [state, setState] = useState<any>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1); // 0=Easy, 1=Normal, 2=Hard
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
        body: JSON.stringify({ gameId: id, state, humanAction: action, difficulty, apiKey })
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
    <main className="min-h-screen p-6 md:p-10 bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <div className="lg:col-span-1">
          <RuleBook />
        </div>

        <div className="lg:col-span-3 space-y-6">
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <h1 className="text-3xl font-bold mb-2">{gameMeta.name}</h1>
            
            {/* AI Role Indicator */}
            <div className="mb-6 p-3 bg-gray-50 rounded-lg inline-flex items-center gap-3">
              <span className="text-lg">🤖</span>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-500 uppercase">AI Role</p>
                <p className="text-sm font-bold text-gray-700">
                  {id === 'overcooked-lite' ? '🤝 Teammate' : '⚔️ Opponent'}
                </p>
              </div>
            </div>
            
            <p className="text-sm font-bold text-gray-400 mb-6">Environment Progress: {state.currentRound} / {state.maxRounds}</p>
            
            <div className="w-full bg-gray-100 h-3 rounded-full mb-8 overflow-hidden">
              <div className="bg-blue-500 h-3 rounded-full transition-all duration-700 shadow-sm" style={{ width: `${(state.currentRound / state.maxRounds) * 100}%` }}></div>
            </div>

            <div className="flex justify-center gap-20">
              <div className="space-y-1"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">👤 You</p><p className="text-5xl font-bold text-blue-500">{state.scores.human}</p></div>
              <div className="h-16 w-px bg-gray-100"></div>
              <div className="space-y-1"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">🤖 AI</p><p className="text-5xl font-bold text-red-500">{state.scores.ai}</p></div>
            </div>
          </div>

          {id === 'monopoly-lite' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border-2 border-gray-100 bg-gray-50 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Assets</p>
                <p className="text-4xl font-bold text-green-500 mb-2">${state.cash?.human || 0}</p>
                <p className="text-sm font-bold text-gray-600">🏠 {state.properties?.human || 0} Properties</p>
              </div>
              <div className="p-6 rounded-2xl border-2 border-gray-100 bg-gray-50 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">AI Assets</p>
                <p className="text-4xl font-bold text-red-500 mb-2">${state.cash?.ai || 0}</p>
                <p className="text-sm font-bold text-gray-600">🏠 {state.properties?.ai || 0} Properties</p>
              </div>
            </div>
          )}

          {id === 'overcooked-lite' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">Kitchen Status</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className={`p-8 rounded-2xl border-2 text-center transition-all duration-500 ${state.inventory.tomatoPrepped ? 'bg-red-50 border-red-500 shadow-inner' : 'bg-gray-50 border-gray-100 opacity-40'}`}>
                  <span className="text-5xl mb-4 block">🍅</span>
                  <p className="text-xs font-black uppercase tracking-widest">Tomato: {state.inventory.tomatoPrepped ? <span className="text-red-600">READY</span> : <span className="text-gray-400">WAITING</span>}</p>
                </div>
                <div className={`p-8 rounded-2xl border-2 text-center transition-all duration-500 ${state.inventory.lettucePrepped ? 'bg-green-50 border-green-500 shadow-inner' : 'bg-gray-50 border-gray-100 opacity-40'}`}>
                  <span className="text-5xl mb-4 block">🥬</span>
                  <p className="text-xs font-black uppercase tracking-widest">Lettuce: {state.inventory.lettucePrepped ? <span className="text-green-600">READY</span> : <span className="text-gray-400">WAITING</span>}</p>
                </div>
              </div>
            </div>
          )}

          {id === 'deduction-game' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">Your Dice & Current Bid</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Hidden Dice</p>
                  <div className="flex justify-center gap-4">
                    {state.humanDice?.map((die: number, idx: number) => (
                      <div key={idx} className="w-16 h-16 bg-purple-100 border-2 border-purple-400 rounded-lg flex items-center justify-center">
                        <span className="text-3xl font-bold text-purple-600">{die}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {state.currentBid && (
                  <div className="p-4 rounded-xl border-2 border-yellow-300 bg-yellow-50">
                    <p className="text-xs font-bold text-yellow-700 mb-1">Current Bid ({state.currentBid.biddingPlayer === 'human' ? '👤 You' : '🤖 AI'}):</p>
                    <p className="text-2xl font-bold text-yellow-800">{state.currentBid.quantity} × {state.currentBid.faceValue}s</p>
                  </div>
                )}
                {state.gamePhase === 'reveal' && state.revealedDice && (
                  <div className="p-4 rounded-xl border-2 border-purple-300 bg-purple-50">
                    <p className="text-xs font-bold text-purple-700 mb-3">🎲 Revealed Dice</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-gray-600 mb-2">Your Dice:</p>
                        <div className="flex gap-2">
                          {state.revealedDice.human.map((die: number, idx: number) => (
                            <div key={idx} className="w-12 h-12 bg-blue-100 border border-blue-300 rounded flex items-center justify-center">
                              <span className="font-bold text-blue-600">{die}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-600 mb-2">AI Dice:</p>
                        <div className="flex gap-2">
                          {state.revealedDice.ai.map((die: number, idx: number) => (
                            <div key={idx} className="w-12 h-12 bg-red-100 border border-red-300 rounded flex items-center justify-center">
                              <span className="font-bold text-red-600">{die}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {state.roundResult && (
                      <div className={`mt-4 p-3 rounded-lg ${state.roundResult.winner === 'human' ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'}`}>
                        <p className={`text-xs font-bold ${state.roundResult.winner === 'human' ? 'text-green-700' : 'text-red-700'}`}>
                          {state.roundResult.winner === 'human' ? '✅' : '❌'} {state.roundResult.reason}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest">AI Opponent Level</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {difficulty === 0 ? '🟢 Easy - AI plays cautiously' : difficulty === 1 ? '🟡 Normal - Balanced strategy' : '🔴 Hard - AI plays aggressively'}
                  </p>
                </div>
                <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                  {difficulty === 0 ? 'Easy' : difficulty === 1 ? 'Normal' : 'Hard'}
                </span>
              </div>
              <input type="range" min="0" max="2" value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value) as DifficultyLevel)} className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Easy</span>
                <span>Normal</span>
                <span>Hard</span>
              </div>
            </div>

            {!state.isTerminal ? (
              <div className="grid grid-cols-2 gap-4">
                {adapter.listLegalActions(state).map((action, idx) => (
                  <button 
                    key={action} 
                    onClick={() => playTurn(action)} 
                    disabled={loading}
                    className={`py-5 rounded-2xl font-bold text-white transition-all active:scale-95 shadow-md uppercase tracking-widest text-xs ${idx % 2 === 0 ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-100' : 'bg-red-500 hover:bg-red-600 shadow-red-100'} disabled:opacity-30`}
                  >
                    {loading ? 'Processing...' : action}
                  </button>
                ))}
              </div>
            ) : (
              <button onClick={() => setState(adapter.getInitialState())} className="w-full bg-gray-900 text-white py-5 font-bold rounded-2xl hover:bg-black transition-all shadow-xl uppercase tracking-[0.3em]">Restart Session</button>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-6 text-center">Agent Reasoning Trace</h2>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {traces.map((t) => (
                <div key={t.traceId} className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-800 uppercase tracking-tight mb-2">Intent: {t.modelOutput?.type}</p>
                  <p className="text-gray-500 text-sm italic leading-relaxed">"{t.modelOutput?.explanation}"</p>
                </div>
              ))}
              {traces.length === 0 && <p className="text-gray-300 text-sm italic text-center py-6">Waiting for agent activity...</p>}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}