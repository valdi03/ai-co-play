// src/game/overcookedAdapter.ts
import { GameAdapter } from '../types';
import { createOvercookedInitialState, applyOvercookedRound } from './overcookedEngine';

export const overcookedAdapter: GameAdapter = {
  getInitialState: () => createOvercookedInitialState(),
  listLegalActions: (state: any) => {
    // These must match the ActionType in src/types/index.ts
    return ['CHOP_TOMATO', 'CHOP_LETTUCE', 'SERVE', 'CLEAN'];
  },
  applyRound: (state, humanAction, aiAction) => 
    applyOvercookedRound(state as any, humanAction, aiAction)
};