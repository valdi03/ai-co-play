// src/game/adapter.ts
import { GameState, ActionType, GameAdapter } from '../types';
import { createInitialState, applyRound } from './engine';

export const shareOrStealAdapter: GameAdapter = {
  getInitialState: () => createInitialState(),
  listLegalActions: (state: GameState) => ['SHARE', 'STEAL'],
  applyRound: (state, humanAction, aiAction) => applyRound(state, humanAction, aiAction)
};