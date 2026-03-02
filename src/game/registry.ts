// src/game/registry.ts
import { GameAdapter } from '../types';
import { shareOrStealAdapter } from './adapter';
import { overcookedAdapter } from './overcookedAdapter';

export interface GameMetadata {
  id: string;
  name: string;
  description: string;
  type: 'Co-op' | 'Competitive' | 'Strategy' | 'Hidden Info';
  adapter: GameAdapter;
}

export const GAME_REGISTRY: Record<string, GameMetadata> = {
  'share-or-steal': {
    id: 'share-or-steal',
    name: 'Share or Steal',
    description: 'A classic prisoner dilemma game. Test your trust!',
    type: 'Competitive',
    adapter: shareOrStealAdapter
  },
  'overcooked-lite': {
    id: 'overcooked-lite',
    name: 'Overcooked Lite',
    description: 'Co-op kitchen tasks. Coordinate with AI to serve salads!',
    type: 'Co-op',
    adapter: overcookedAdapter
  },
  'monopoly-lite': {
    id: 'monopoly-lite',
    name: 'Monopoly Lite',
    description: 'Strategic resource management and investment. AI as a rival.',
    type: 'Strategy',
    adapter: shareOrStealAdapter // Placeholder until we build the engine
  },
  'deduction-game': {
    id: 'deduction-game',
    name: 'Liar Dice Lite',
    description: 'Hidden information and social reasoning. Can you spot the bluff?',
    type: 'Hidden Info',
    adapter: shareOrStealAdapter // Placeholder until we build the engine
  }
};