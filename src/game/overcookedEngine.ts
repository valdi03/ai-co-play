// src/game/overcookedEngine.ts
import { GameState } from '../types';

export interface OvercookedState extends GameState {
  inventory: {
    tomatoPrepped: boolean;
    lettucePrepped: boolean;
  };
}

export function createOvercookedInitialState(maxRounds = 5): OvercookedState {
  return {
    currentRound: 1,
    maxRounds,
    scores: { human: 0, ai: 0 },
    history: [],
    isTerminal: false,
    inventory: { tomatoPrepped: false, lettucePrepped: false }
  };
}

export function applyOvercookedRound(
  state: OvercookedState, 
  humanAction: string, 
  aiAction: string
): OvercookedState {
  const nextInventory = { ...state.inventory };
  let roundScore = 0;

  // Process actions
  [humanAction, aiAction].forEach(act => {
    if (act === 'CHOP_TOMATO') nextInventory.tomatoPrepped = true;
    if (act === 'CHOP_LETTUCE') nextInventory.lettucePrepped = true;
  });

  // Score if SERVE and prepped
  if ((humanAction === 'SERVE' || aiAction === 'SERVE') && 
      nextInventory.tomatoPrepped && nextInventory.lettucePrepped) {
    roundScore = 10;
    nextInventory.tomatoPrepped = false;
    nextInventory.lettucePrepped = false;
  }

  return {
    ...state,
    currentRound: state.currentRound + 1,
    scores: {
      human: state.scores.human + roundScore,
      ai: state.scores.ai + roundScore
    },
    inventory: nextInventory,
    history: [...state.history, { round: state.currentRound, humanAction, aiAction }],
    isTerminal: state.currentRound >= state.maxRounds
  };
}