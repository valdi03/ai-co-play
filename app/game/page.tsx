"use client";

import Link from 'next/link';
import { GAME_REGISTRY } from '../../src/game/registry';

export default function GameListPage() {
  const games = Object.values(GAME_REGISTRY);

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Game Library</h1>
          <Link href="/" className="text-sm text-blue-500 font-bold hover:underline">Back to Lobby</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game) => (
            <Link href={`/game/${game.id}`} key={game.id} className="group">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-500">{game.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{game.description}</p>
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Start Game</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}