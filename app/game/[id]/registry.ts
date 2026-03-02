// src/game/registry.ts
import { GameAdapter } from '../types';
import { shareOrStealAdapter } from './adapter';

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
  // future games will be added here
  'overcooked-lite': {
    id: 'overcooked-lite',
    name: 'Overcooked Lite',
    description: 'Co-op kitchen tasks. (Coming Soon)',
    type: 'Co-op',
    adapter: shareOrStealAdapter // temporary placeholder
  },
  'monopoly-lite': {
    id: 'monopoly-lite',
    name: 'Monopoly Lite',
    description: 'Resource management and strategy. (Coming Soon)',
    type: 'Strategy',
    adapter: shareOrStealAdapter // temporary placeholder
  },
  'deduction-game': {
    id: 'deduction-game',
    name: 'Liar Dice Lite',
    description: 'Hidden info and reasoning. (Coming Soon)',
    type: 'Hidden Info',
    adapter: shareOrStealAdapter // temporary placeholder
  }
};