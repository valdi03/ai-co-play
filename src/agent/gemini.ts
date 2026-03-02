// src/agent/gemini.ts
import { GoogleGenAI } from '@google/genai';
import { GameState, ActionPayload, AutonomyLevel } from '../types';

function buildPrompt(state: GameState, autonomy: AutonomyLevel, retryError?: string): string {
  let prompt = `
  Role: AI player in a 'Share or Steal' game.
  Autonomy Level: ${autonomy} (0=Observer, 1=Advisor, 2=Executor, 3=Teammate, 4=Leader).
  Round: ${state.currentRound} / ${state.maxRounds}.
  Scores - Human: ${state.scores.human}, AI: ${state.scores.ai}.
  History: ${JSON.stringify(state.history)}

  Analyze history and decide next move.
  Legal Actions: "SHARE" or "STEAL".
  Output valid JSON ONLY.
  `;

  if (retryError) {
    prompt += `\nWARNING: Your previous response failed validation.\nError: ${retryError}\nPlease correct your output and try again.`;
  }

  return prompt;
}

// require apiKey as parameter
export async function getAiDecision(
  state: GameState, 
  autonomy: AutonomyLevel, 
  apiKey: string, 
  maxRetries = 2
): Promise<ActionPayload> {
  
  if (!apiKey) throw new Error('API Key is missing');
  
  // init client dynamically
  const ai = new GoogleGenAI({ apiKey });
  let lastError = '';

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const prompt = buildPrompt(state, autonomy, attempt > 0 ? lastError : undefined);
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              type: { type: 'STRING', enum: ['SHARE', 'STEAL'] },
              confidence: { type: 'NUMBER' },
              explanation: { type: 'STRING' }
            },
            required: ['type', 'explanation']
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error('Empty model response');

      const parsed = JSON.parse(text) as ActionPayload;
      
      if (parsed.type !== 'SHARE' && parsed.type !== 'STEAL') {
        throw new Error(`Invalid action type: ${parsed.type}`);
      }

      return parsed;

    } catch (error: any) {
      lastError = error.message || 'Unknown parsing error';
      console.warn(`[Attempt ${attempt + 1}/${maxRetries + 1}] Validation failed: ${lastError}`);
    }
  }

  return { type: 'SHARE', confidence: 0, explanation: 'Fallback executed due to multiple AI validation failures.' };
}