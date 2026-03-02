import { GameState, ActionType } from '../types';

// init game state
export function createInitialState(maxRounds = 8): GameState {
  return {
    currentRound: 1,
    maxRounds,
    scores: { human: 0, ai: 0 },
    history: [],
    isTerminal: false,
  };
}

// calc scores for a single round
export function resolveRound(humanAction: ActionType, aiAction: ActionType): { humanScore: number; aiScore: number } {
  if (humanAction === 'SHARE' && aiAction === 'SHARE') return { humanScore: 3, aiScore: 3 };
  if (humanAction === 'STEAL' && aiAction === 'SHARE') return { humanScore: 5, aiScore: 0 };
  if (humanAction === 'SHARE' && aiAction === 'STEAL') return { humanScore: 0, aiScore: 5 };
  return { humanScore: 1, aiScore: 1 }; // both STEAL
}

// update state with round results
export function applyRound(state: GameState, humanAction: ActionType, aiAction: ActionType): GameState {
  if (state.isTerminal) return state;

  const { humanScore, aiScore } = resolveRound(humanAction, aiAction);

  const newState: GameState = {
    ...state,
    currentRound: state.currentRound + 1,
    scores: {
      human: state.scores.human + humanScore,
      ai: state.scores.ai + aiScore
    },
    history: [
      ...state.history,
      { round: state.currentRound, humanAction, aiAction }
    ],
    isTerminal: state.currentRound >= state.maxRounds
  };

  return newState;
}