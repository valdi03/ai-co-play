// app/api/turn/route.ts
import { NextResponse } from 'next/server';
import { getGeminiAction } from '../../../src/agent/gemini';
import { GAME_REGISTRY } from '../../../src/game/registry';
import { GameState, TraceRecord, AutonomyLevel, DifficultyLevel } from '../../../src/types';

export async function POST(req: Request) {
  try {
    // step 1: parse request
    const body = await req.json();
    const { gameId, state, humanAction, difficulty, apiKey } = body;

    const gameMeta = GAME_REGISTRY[gameId];
    const adapter = gameMeta?.adapter;

    if (!adapter) {
      return NextResponse.json({ error: 'engine not found' }, { status: 400 });
    }

    // step 2: get legal actions
    const legalActions = adapter.listLegalActions(state);
    
    // step 3: get ai action
    const aiPayload = await getGeminiAction(state, legalActions, apiKey);

    // step 4: apply actions
    const newState = adapter.applyRound(state, humanAction, aiPayload.type);

    // step 5: log trace
    const trace: TraceRecord = {
      traceId: Date.now().toString(),
      timestamp: Date.now().toString(),
      actor: 'ai',
      autonomyLevel: 3 as AutonomyLevel, // AI is always autonomous
      difficultyLevel: difficulty as DifficultyLevel,
      stateSummary: state,
      legalActions: legalActions,
      modelOutput: aiPayload,
      isValidated: legalActions.includes(aiPayload.type)
    };

    return NextResponse.json({ newState, trace });

  } catch (error: any) {
    console.error("api error:", error);
    return NextResponse.json({ error: error.message || 'turn failed' }, { status: 500 });
  }
}