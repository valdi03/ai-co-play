// src/game/liarsDiceEngine.ts
import { GameState, RoundRecord } from '../types';

export interface LiarsDiceState extends GameState {
  humanDice: number[];
  aiDice: number[];
  currentBid: {
    quantity: number;
    faceValue: number;
    biddingPlayer: 'human' | 'ai';
  } | null;
  lastBidder: 'human' | 'ai' | null;
  gamePhase: 'bidding' | 'reveal' | 'round-end';
  revealedDice?: {
    human: number[];
    ai: number[];
  };
  roundResult?: {
    winner: 'human' | 'ai';
    reason: string;
    matchedCount: number;
  };
}

// Helper: Roll 3 dice
function rollDice(): number[] {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1
  ];
}

// Helper: Count matching dice faces on the table
function countMatchingFace(allDice: number[], faceValue: number): number {
  return allDice.filter(d => d === faceValue).length;
}

export function createLiarsDiceInitialState(maxRounds = 7): LiarsDiceState {
  return {
    currentRound: 1,
    maxRounds,
    scores: { human: 0, ai: 0 },
    history: [],
    isTerminal: false,
    humanDice: rollDice(),
    aiDice: rollDice(),
    currentBid: null,
    lastBidder: null,
    gamePhase: 'bidding'
  };
}

export function applyLiarsDiceRound(
  state: LiarsDiceState,
  humanAction: string,
  aiAction: string
): LiarsDiceState {
  const newState: LiarsDiceState = {
    ...state,
    humanDice: [...state.humanDice],
    aiDice: [...state.aiDice],
    currentBid: state.currentBid ? { ...state.currentBid } : null
  };

  // Parse actions
  let humanActionParsed: { type: 'BID' | 'CHALLENGE'; quantity?: number; faceValue?: number } | null = null;
  let aiActionParsed: { type: 'BID' | 'CHALLENGE'; quantity?: number; faceValue?: number } | null = null;

  try {
    // Try to parse human action
    if (humanAction.startsWith('BID_')) {
      const [, qty, face] = humanAction.split('_');
      humanActionParsed = { type: 'BID', quantity: parseInt(qty), faceValue: parseInt(face) };
    } else if (humanAction === 'CHALLENGE') {
      humanActionParsed = { type: 'CHALLENGE' };
    }

    // Try to parse AI action
    if (aiAction.startsWith('BID_')) {
      const [, qty, face] = aiAction.split('_');
      aiActionParsed = { type: 'BID', quantity: parseInt(qty), faceValue: parseInt(face) };
    } else if (aiAction === 'CHALLENGE') {
      aiActionParsed = { type: 'CHALLENGE' };
    }
  } catch (e) {
    // Fallback
  }

  // If either action is invalid, use default (challenge)
  if (!humanActionParsed) humanActionParsed = { type: 'CHALLENGE' };
  if (!aiActionParsed) aiActionParsed = { type: 'CHALLENGE' };

  // Simulate turn-based logic (simplified: human acts, then AI responds)
  // In a real game, you'd track whose turn it is more carefully
  
  // Human's turn: BID or CHALLENGE
  if (humanActionParsed.type === 'BID') {
    const validBid = isValidBid(newState.currentBid, humanActionParsed.quantity, humanActionParsed.faceValue);
    if (validBid) {
      newState.currentBid = {
        quantity: humanActionParsed.quantity!,
        faceValue: humanActionParsed.faceValue!,
        biddingPlayer: 'human'
      };
      newState.lastBidder = 'human';
    }
  } else if (humanActionParsed.type === 'CHALLENGE') {
    // Reveal and resolve
    const allDice = [...newState.humanDice, ...newState.aiDice];
    const matchedCount = countMatchingFace(allDice, newState.currentBid?.faceValue || 1);
    
    const bidWasTruth = (newState.currentBid?.quantity || 0) <= matchedCount;
    
    newState.gamePhase = 'reveal';
    newState.revealedDice = {
      human: newState.humanDice,
      ai: newState.aiDice
    };
    
    if (bidWasTruth) {
      // AI's bid was correct → AI wins
      newState.roundResult = {
        winner: 'ai',
        reason: `AI's bid of ${newState.currentBid?.quantity} ${newState.currentBid?.faceValue}s was true! Found ${matchedCount}.`,
        matchedCount
      };
      newState.scores.ai += 1;
    } else {
      // AI's bid was false → Human wins (caught the bluff)
      newState.roundResult = {
        winner: 'human',
        reason: `You caught the bluff! Only ${matchedCount} dice matched.`,
        matchedCount
      };
      newState.scores.human += 1;
    }
    
    // Move to next round
    newState.currentRound += 1;
    if (newState.currentRound > newState.maxRounds) {
      newState.isTerminal = true;
    } else {
      // Reset for next round
      newState.humanDice = rollDice();
      newState.aiDice = rollDice();
      newState.currentBid = null;
      newState.lastBidder = null;
      newState.gamePhase = 'bidding';
    }
  }

  // AI's turn (simplified): either raise bid or challenge
  if (aiActionParsed.type === 'BID' && newState.gamePhase === 'bidding') {
    const validBid = isValidBid(newState.currentBid, aiActionParsed.quantity, aiActionParsed.faceValue);
    if (validBid) {
      newState.currentBid = {
        quantity: aiActionParsed.quantity!,
        faceValue: aiActionParsed.faceValue!,
        biddingPlayer: 'ai'
      };
      newState.lastBidder = 'ai';
    }
  } else if (aiActionParsed.type === 'CHALLENGE' && newState.gamePhase === 'bidding') {
    // AI challenges human's bid
    if (newState.currentBid) {
      const allDice = [...newState.humanDice, ...newState.aiDice];
      const matchedCount = countMatchingFace(allDice, newState.currentBid.faceValue);
      
      const bidWasTruth = newState.currentBid.quantity <= matchedCount;
      
      newState.gamePhase = 'reveal';
      newState.revealedDice = {
        human: newState.humanDice,
        ai: newState.aiDice
      };
      
      if (bidWasTruth) {
        // Human's bid was correct → Human wins
        newState.roundResult = {
          winner: 'human',
          reason: `Your bid of ${newState.currentBid.quantity} ${newState.currentBid.faceValue}s was true! Found ${matchedCount}.`,
          matchedCount
        };
        newState.scores.human += 1;
      } else {
        // Human's bid was false → AI wins (caught the bluff)
        newState.roundResult = {
          winner: 'ai',
          reason: `AI caught your bluff! Only ${matchedCount} dice matched.`,
          matchedCount
        };
        newState.scores.ai += 1;
      }
      
      // Move to next round
      newState.currentRound += 1;
      if (newState.currentRound > newState.maxRounds) {
        newState.isTerminal = true;
      } else {
        // Reset for next round
        newState.humanDice = rollDice();
        newState.aiDice = rollDice();
        newState.currentBid = null;
        newState.lastBidder = null;
        newState.gamePhase = 'bidding';
      }
    }
  }

  return newState;
}

// Helper: Validate bid (must be higher than previous bid)
function isValidBid(currentBid: LiarsDiceState['currentBid'], quantity: number | undefined, faceValue: number | undefined): boolean {
  if (quantity === undefined || faceValue === undefined) return false;
  if (quantity < 1 || quantity > 6) return false;
  if (faceValue < 1 || faceValue > 6) return false;

  if (!currentBid) return true; // First bid is always valid

  // New bid must be higher
  if (faceValue > currentBid.faceValue) return true;
  if (faceValue === currentBid.faceValue && quantity > currentBid.quantity) return true;

  return false;
}
