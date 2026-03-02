// app/game/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GameState, ActionType, AutonomyLevel, TraceRecord } from '../../../src/types';
import { GAME_REGISTRY } from '../../../src/game/registry';

export default function GameRoom() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const gameMeta = GAME_REGISTRY[id];
  const adapter = gameMeta?.adapter;

  const [state, setState] = useState<any>(null);
  const [autonomy, setAutonomy] = useState<AutonomyLevel>(2);
  const [loading, setLoading] = useState(false);
  const [traces, setTraces] = useState<TraceRecord[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [pendingResult, setPendingResult] = useState<any>(null);

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
        body: JSON.stringify({ gameId: id, state, humanAction: action, autonomy, apiKey })
      });
      const data = await res.json();
      if (autonomy >= 3 || autonomy === 0) {
        if (data.newState) setState(data.newState);
        if (data.trace) setTraces((prev) => [data.trace, ...prev]);
      } else {
        setPendingResult({ newState: data.newState, trace: data.trace });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    setState(pendingResult.newState);
    setTraces((prev) => [pendingResult.trace, ...prev]);
    setPendingResult(null);
  };

  // Expanded Rule Book Component
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
            <p className="text-xs italic bg-gray-50 p-2 rounded-lg">Pro-tip: If you chop the tomato, the AI will observe your action and likely prepare the lettuce for you!</p>
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
            <p className="font-bold text-gray-800">GOAL: Maximize your personal score.</p>
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
        
        {/* Left: Expanded Rule Book */}
        <div className="lg:col-span-1">
          <RuleBook />
        </div>

        {/* Right: Game UI */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Header & Progress */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <h1 className="text-3xl font-bold mb-2">{gameMeta.name}</h1>
            <p className="text-sm font-bold text-gray-400 mb-6">Environment Progress: {state.currentRound} / {state.maxRounds}</p>
            
            <div className="w-full bg-gray-100 h-3 rounded-full mb-8 overflow-hidden">
              <div className="bg-blue-500 h-3 rounded-full transition-all duration-700 shadow-sm" style={{ width: `${(state.currentRound / state.maxRounds) * 100}%` }}></div>
            </div>

            <div className="flex justify-center gap-20">
              <div className="space-y-1"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Human Team</p><p className="text-5xl font-bold text-blue-500">{state.scores.human}</p></div>
              <div className="h-16 w-px bg-gray-100"></div>
              <div className="space-y-1"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Partner</p><p className="text-5xl font-bold text-red-500">{state.scores.ai}</p></div>
            </div>
          </div>

          {/* Visualization: Kitchen Status */}
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

          {/* Controls */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold uppercase tracking-widest">AI Autonomy Level</p>
                <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase">Level {autonomy}</span>
              </div>
              <input type="range" min="0" max="4" value={autonomy} onChange={(e) => setAutonomy(Number(e.target.value) as any)} className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>

            {!state.isTerminal ? (
              pendingResult ? (
                <div className="p-8 bg-blue-50 rounded-2xl border border-blue-100 animate-pulse">
                  <p className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-widest">Agent Proposal</p>
                  <p className="font-bold text-xl text-blue-900 mb-4">{pendingResult.trace.modelOutput?.type}</p>
                  <p className="text-sm text-blue-700/70 italic mb-6">"{pendingResult.trace.modelOutput?.explanation}"</p>
                  <div className="flex gap-4">
                    <button onClick={handleApprove} className="flex-1 bg-blue-500 text-white font-bold py-4 rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-100 transition-all uppercase tracking-widest text-xs">Execute Action</button>
                    <button onClick={() => setPendingResult(null)} className="flex-1 bg-white text-gray-400 font-bold py-4 rounded-xl border border-gray-200 uppercase tracking-widest text-xs">Decline</button>
                  </div>
                </div>
              ) : (
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
              )
            ) : (
              <button onClick={() => setState(adapter.getInitialState())} className="w-full bg-gray-900 text-white py-5 font-bold rounded-2xl hover:bg-black transition-all shadow-xl uppercase tracking-[0.3em]">Restart Session</button>
            )}
          </div>

          {/* Decision Logs */}
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