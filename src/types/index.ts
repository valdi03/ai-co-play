// src/types/index.ts

export type PlayerRole = 'human' | 'ai';
export type ActionType = 'SHARE' | 'STEAL';
export type AutonomyLevel = 0 | 1 | 2 | 3 | 4;

export interface ActionPayload {
  type: ActionType;
  confidence?: number;
  explanation?: string;
}

export interface RoundRecord {
  round: number;
  humanAction: ActionType;
  aiAction: ActionType;
}

export interface GameState {
  currentRound: number;
  maxRounds: number;
  scores: {
    human: number;
    ai: number;
  };
  history: RoundRecord[];
  isTerminal: boolean;
}

export interface TraceRecord {
  traceId: string;
  timestamp: string;
  actor: PlayerRole;
  autonomyLevel: AutonomyLevel;
  stateSummary: GameState;
  legalActions: ActionType[];
  modelOutput: ActionPayload | null;
  isValidated: boolean;
}

// src/types/index.ts

export interface GameAdapter {
  getInitialState(): GameState;
  listLegalActions(state: GameState): ActionType[];
  applyRound(state: GameState, humanAction: ActionType, aiAction: ActionType): GameState;
}