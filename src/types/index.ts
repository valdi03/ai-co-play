// src/types/index.ts

export type PlayerRole = 'human' | 'ai';
// Add all possible actions from all games here
export type ActionType = 'SHARE' | 'STEAL' | 'CHOP_TOMATO' | 'CHOP_LETTUCE' | 'SERVE' | 'CLEAN';
export type AutonomyLevel = 0 | 1 | 2 | 3 | 4;
export type DifficultyLevel = 0 | 1 | 2; // 0 = Easy, 1 = Normal, 2 = Hard

export interface ActionPayload {
  type: string; // Changed to string to be more flexible for dynamic games
  confidence?: number;
  explanation?: string;
}

export interface RoundRecord {
  round: number;
  humanAction: string;
  aiAction: string;
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
  // allow additional properties for different games
  [key: string]: any; 
}

export interface TraceRecord {
  traceId: string;
  timestamp: string;
  actor: PlayerRole;
  autonomyLevel: AutonomyLevel;
  difficultyLevel?: DifficultyLevel;
  stateSummary: GameState;
  legalActions: string[];
  modelOutput: ActionPayload | null;
  isValidated: boolean;
}

export interface GameAdapter {
  getInitialState(): GameState;
  listLegalActions(state: GameState): string[];
  applyRound(state: GameState, humanAction: string, aiAction: string): GameState;
}