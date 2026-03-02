// app/api/turn/route.ts
import { NextResponse } from 'next/server';
import { getAiDecision } from '../../../src/agent/gemini';
import { GAME_REGISTRY } from '../../../src/game/registry';
import { GameState, ActionType, AutonomyLevel, TraceRecord } from '../../../src/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { gameId, state, humanAction, autonomy, apiKey } = body as {
      gameId: string; // receive gameId
      state: GameState;
      humanAction: ActionType;
      autonomy: AutonomyLevel;
      apiKey: string;
    };

    const gameMeta = GAME_REGISTRY[gameId];
    if (!gameMeta) return NextResponse.json({ error: 'Game not found' }, { status: 404 });

    const adapter = gameMeta.adapter;
    const legalActions = adapter.listLegalActions(state);

    let aiDecision = { type: legalActions[0], explanation: 'Observer Mode.', confidence: 1 };

    if (autonomy > 0) {
      if (!apiKey) return NextResponse.json({ error: 'API Key required' }, { status: 401 });
      // pass gameId and legalActions to agent
      const decision = await getAiDecision(gameId, legalActions, state, autonomy, apiKey);
      aiDecision = decision as any;
    }

    // apply logic using specific adapter
    const newState = adapter.applyRound(state, humanAction, aiDecision.type as ActionType);

    const trace: TraceRecord = {
      traceId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      actor: 'ai',
      autonomyLevel: autonomy,
      stateSummary: state,
      legalActions: legalActions as ActionType[],
      modelOutput: aiDecision,
      isValidated: true,
    };

    return NextResponse.json({ newState, trace });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Turn failed' }, { status: 500 });
  }
}