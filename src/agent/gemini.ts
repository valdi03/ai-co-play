// src/agent/gemini.ts
import { GameState } from '../types';

export interface ActionPayload {
  type: string;
  explanation: string;
}

export async function getGeminiAction(
  state: GameState,
  legalActions: string[],
  apiKey: string
): Promise<ActionPayload> {
  // step 1: set up prompt
  const prompt = `
    Analyze the current game state and make a strategic move.
    State: ${JSON.stringify(state)}
    Legal Actions: ${legalActions.join(', ')}
    
    You MUST return ONLY a raw JSON object. Do not include markdown formatting or backticks.
    Format:
    {
      "type": "ONE_OF_THE_LEGAL_ACTIONS",
      "explanation": "Short strategic reason"
    }
  `;

  // step 2: call api with latest model
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 }
    })
  });

  if (!res.ok) {
    const errorDetail = await res.text();
    console.error("api error details:", errorDetail);
    throw new Error(`api failed with status ${res.status}`);
  }

  const data = await res.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // step 3: clean text
  text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

  if (!text) {
    throw new Error("empty response");
  }

  // step 4: parse output
  const parsed = JSON.parse(text) as ActionPayload;
  
  if (!legalActions.includes(parsed.type)) {
    const randomIndex = Math.floor(Math.random() * legalActions.length);
    parsed.type = legalActions[randomIndex];
    parsed.explanation = "fallback random legal move";
  }

  return parsed;
}