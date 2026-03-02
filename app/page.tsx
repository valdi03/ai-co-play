// app/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { GameState, ActionType, AutonomyLevel, TraceRecord } from '../src/types';
import { shareOrStealAdapter } from '../src/game/adapter';

// use adapter
const adapter = shareOrStealAdapter;

export default function Home() {
  const [state, setState] = useState<GameState>(adapter.getInitialState());
  const [autonomy, setAutonomy] = useState<AutonomyLevel>(2);
  const [loading, setLoading] = useState(false);
  const [traces, setTraces] = useState<TraceRecord[]>([]);
  
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

  const [pendingResult, setPendingResult] = useState<{
    newState: GameState;
    trace: TraceRecord;
  } | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsSettingsOpen(false);
    }
  }, []);

  const handleSaveKey = (val: string) => {
    setApiKey(val);
    localStorage.setItem('gemini_api_key', val);
  };

  const playTurn = async (action: ActionType) => {
    if (state.isTerminal || loading) return;
    
    if (!apiKey) {
      alert("Please configure your Gemini API Key in Settings first!");
      setIsSettingsOpen(true);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, humanAction: action, autonomy, apiKey })
      });

      if (!res.ok) throw new Error('API Request Failed');

      const data = await res.json();

      // 修改這裡：Level 3, 4 以及 Level 0 都直接自動執行
      if (autonomy >= 3 || autonomy === 0) {
        if (data.newState) setState(data.newState);
        if (data.trace) setTraces((prev) => [data.trace, ...prev]);
      } else {
        // Level 1, 2 需要手動批准
        setPendingResult({ newState: data.newState, trace: data.trace });
      }
    } catch (err) {
      console.error(err);
      alert("Error processing turn. Check console or API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    if (!pendingResult) return;
    setState(pendingResult.newState);
    setTraces((prev) => [pendingResult.trace, ...prev]);
    setPendingResult(null);
  };

  const handleReject = () => {
    setPendingResult(null);
  };

  const resetGame = () => {
    setState(adapter.getInitialState());
    setTraces([]);
    setPendingResult(null);
  };

  // get dynamic actions
  const legalActions = adapter.listLegalActions(state);

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Settings Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
            <h2 className="text-lg font-bold flex items-center gap-2">⚙️ Global Settings</h2>
            <span className="text-gray-500">{isSettingsOpen ? '▲' : '▼'}</span>
          </div>
          
          {isSettingsOpen && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium mb-2 text-gray-700">Gemini API Key</label>
              <input 
                type="password" 
                placeholder="AIzaSy..." 
                value={apiKey}
                onChange={(e) => handleSaveKey(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}
        </div>

        {/* Header & Score */}
        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
          <h1 className="text-2xl font-bold mb-2">AI Co-Play: Share or Steal</h1>
          <p className="text-gray-500 mb-4">Round: {state.currentRound > state.maxRounds ? state.maxRounds : state.currentRound} / {state.maxRounds}</p>
          <div className="flex justify-center gap-12 text-xl font-semibold">
            <div>Human: <span className="text-blue-600">{state.scores.human}</span></div>
            <div>AI: <span className="text-red-600">{state.scores.ai}</span></div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">AI Autonomy Level: {autonomy} {autonomy >= 3 ? '(Auto-Execute)' : '(Needs Approval)'}</label>
            <input 
              type="range" 
              min="0" max="4" 
              value={autonomy} 
              onChange={(e) => setAutonomy(Number(e.target.value) as AutonomyLevel)}
              className="w-full"
            />
          </div>

          {state.isTerminal ? (
            <button onClick={resetGame} className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900">
              Play Again
            </button>
          ) : pendingResult ? (
            <div className="p-4 border-2 border-yellow-400 bg-yellow-50 rounded-lg">
              <h3 className="font-bold text-yellow-800 mb-2">⚠️ AI proposes to: {pendingResult.trace.modelOutput?.type}</h3>
              <p className="text-sm text-yellow-700 italic mb-4">"{pendingResult.trace.modelOutput?.explanation}"</p>
              <div className="flex gap-4">
                <button onClick={handleApprove} className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600">
                  ✅ Approve
                </button>
                <button onClick={handleReject} className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500">
                  ❌ Reject (Cancel Move)
                </button>
              </div>
            </div>
          ) : (
            // DYNAMIC BUTTONS HERE
            <div className="flex gap-4">
              {legalActions.map((action) => (
                <button 
                  key={action}
                  onClick={() => playTurn(action)} 
                  disabled={loading || !apiKey} 
                  className="flex-1 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 disabled:opacity-50 font-bold"
                >
                  {loading ? 'Wait...' : action}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Logs / Traces */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold mb-4">Trace Logs</h2>
          <div className="space-y-4">
            {traces.map((trace) => (
              <div key={trace.traceId} className="p-4 bg-gray-100 rounded-lg text-sm">
                <div className="font-semibold text-gray-700">AI decided to: {trace.modelOutput?.type}</div>
                <div className="text-gray-600 mt-1 italic">" {trace.modelOutput?.explanation} "</div>
                <div className="text-xs text-gray-400 mt-2">Confidence: {trace.modelOutput?.confidence} | Autonomy: Level {trace.autonomyLevel}</div>
              </div>
            ))}
            {traces.length === 0 && <p className="text-gray-400">No moves yet...</p>}
          </div>
        </div>

      </div>
    </main>
  );
}