// src/agent/gemini.ts
import { GoogleGenAI } from '@google/genai';
import { GameState, ActionPayload, AutonomyLevel } from '../types';

function buildPrompt(
  gameId: string, 
  legalActions: string[], 
  state: GameState, 
  autonomy: AutonomyLevel, 
  retryError?: string
): string {
  let prompt = `
  Role: AI player in a game called [${gameId}].
  Autonomy Level: ${autonomy} (0=Observer, 1=Advisor, 2=Executor, 3=Teammate, 4=Leader).
  Current State: ${JSON.stringify(state)}
  
  Your goal: Win the game or cooperate based on the game type.
  Legal Actions: ${JSON.stringify(legalActions)}.
  Output valid JSON ONLY.
  `;

  if (retryError) {
    prompt += `\nWARNING: Previous response failed. Error: ${retryError}. Correct it.`;
  }

  return prompt;
}

export async function getAiDecision(
  gameId: string,
  legalActions: string[],
  state: GameState, 
  autonomy: AutonomyLevel, 
  apiKey: string, 
  maxRetries = 2
): Promise<ActionPayload> {
  
  if (!apiKey) throw new Error('API Key missing');
  const ai = new GoogleGenAI({ apiKey });
  let lastError = '';

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const prompt = buildPrompt(gameId, legalActions, state, autonomy, attempt > 0 ? lastError : undefined);
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              type: { type: 'STRING' }, // dynamic type
              confidence: { type: 'NUMBER' },
              explanation: { type: 'STRING' }
            },
            required: ['type', 'explanation']
          }
        }
      });

      const text = response.text;
      const parsed = JSON.parse(text) as ActionPayload;
      
      // dynamic validation against legalActions
      if (!legalActions.includes(parsed.type)) {
        throw new Error(`Invalid action: ${parsed.type}. Must be one of ${legalActions.join(',')}`);
      }

      return parsed;

    } catch (error: any) {
      lastError = error.message;
      console.warn(`[Attempt ${attempt + 1}] failed: ${lastError}`);
    }
  }

  return { type: legalActions[0], confidence: 0, explanation: 'Fallback to first legal action.' };
}