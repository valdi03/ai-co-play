// src/game/monopolyAdapter.ts
import { GameAdapter, GameState } from '../types';

// step 1: define custom state for monopoly
export interface MonopolyState extends GameState {
  cash: {
    human: number;
    ai: number;
  };
  properties: {
    human: number;
    ai: number;
  };
}

// step 2: init game
export const monopolyAdapter: GameAdapter = {
  getInitialState: (): MonopolyState => ({
    currentRound: 1,
    maxRounds: 10,
    isTerminal: false,
    scores: { human: 1000, ai: 1000 },
    history: [],
    cash: { human: 1000, ai: 1000 },
    properties: { human: 0, ai: 0 }
  }),

  // step 3: define legal actions
  listLegalActions: (state: GameState): string[] => {
    return ['BUY_LAND', 'SAVE_CASH'];
  },

  // step 4: core game rules
  applyRound: (state: GameState, humanAction: string, aiAction: string): GameState => {
    const s = state as MonopolyState;
    const newState = { 
      ...s, 
      cash: { ...s.cash }, 
      properties: { ...s.properties }, 
      scores: { ...s.scores } 
    };

    const landCost = 300;
    const landValue = 500;
    const interest = 100;

    // process human action
    if (humanAction === 'BUY_LAND' && newState.cash.human >= landCost) {
      newState.cash.human -= landCost;
      newState.properties.human += 1;
    } else {
      newState.cash.human += interest;
    }

    // process ai action
    if (aiAction === 'BUY_LAND' && newState.cash.ai >= landCost) {
      newState.cash.ai -= landCost;
      newState.properties.ai += 1;
    } else {
      newState.cash.ai += interest;
    }

    // step 5: calc final scores
    newState.scores.human = newState.cash.human + (newState.properties.human * landValue);
    newState.scores.ai = newState.cash.ai + (newState.properties.ai * landValue);

    // step 6: check end game
    newState.currentRound += 1;
    if (newState.currentRound > newState.maxRounds) {
      newState.isTerminal = true;
    }

    return newState;
  }
};