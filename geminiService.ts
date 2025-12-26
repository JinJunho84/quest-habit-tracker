
import { GoogleGenAI, Type } from "@google/genai";
import { Quest, QuestStep } from "./types";
import { Language } from "./translations";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generateQuestBreakdown(goal: string, durationMinutes: number, lang: Language = 'en', category?: string): Promise<Partial<Quest>> {
  const currentDate = new Date().toISOString();
  
  // Format duration for the prompt
  let durationText = `${durationMinutes} minutes`;
  if (durationMinutes >= 1440) {
    durationText = `${Math.round(durationMinutes / 1440)} days`;
  } else if (durationMinutes >= 60) {
    durationText = `${Math.round(durationMinutes / 60)} hours`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Today's date and time is ${currentDate}. Generate a detailed quest breakdown for the goal: "${goal}" to be completed in exactly ${durationText} from now. ${category ? `The quest category is "${category}".` : ''} The response must be in ${lang === 'ko' ? 'Korean' : 'English'}.`,
    config: {
      systemInstruction: `You are an RPG Quest Master. Transform user goals into a gamified quest line. 
      Break the goal into 3-7 logical, sequential steps (sub-quests). 
      IMPORTANT: For each step, provide a "recommendation" field containing deep, detailed, and actionable advice or strategies on how to achieve that specific objective. 
      Schedule steps realistically starting from NOW (${currentDate}).
      If the quest is short (e.g., 30m or 1h), ensure step durationMinutes are small and scheduled minutes apart.
      If the quest is long (days), distribute steps across the period.
      Provide realistic timestamps for each step's "scheduledAt" field using ISO 8601 format. 
      Output should be professional yet engaging.
      IMPORTANT: All text fields (title, category, description, recommendation, steps title/description) MUST be in the requested language: ${lang === 'ko' ? 'Korean' : 'English'}. 
      If a category was suggested by the user, use it. Otherwise, create a thematic one.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
          xp: { type: Type.NUMBER },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                recommendation: { type: Type.STRING, description: "Detailed strategy and tips for this step" },
                scheduledAt: { type: Type.STRING, description: "ISO 8601 Date string" },
                durationMinutes: { type: Type.NUMBER }
              },
              required: ["title", "description", "recommendation", "scheduledAt", "durationMinutes"]
            }
          }
        },
        required: ["title", "category", "description", "difficulty", "xp", "steps"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return {
      ...data,
      id: crypto.randomUUID(),
      startDate: currentDate,
      endDate: new Date(Date.now() + durationMinutes * 60 * 1000).toISOString(),
      status: 'active',
      lastUpdate: currentDate,
      steps: data.steps.map((s: any) => ({ ...s, id: crypto.randomUUID(), isCompleted: false }))
    };
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Quest generation failed.");
  }
}

export async function getMotivationalNudge(questTitle: string, lang: Language = 'en'): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The user hasn't made progress on their quest: "${questTitle}". Give them a short, punchy, RPG-themed motivational nudge to get back on track in ${lang === 'ko' ? 'Korean' : 'English'}.`,
  });
  return response.text || (lang === 'ko' ? "퀘스트가 당신을 기다립니다, 모험가여!" : "Your quest awaits, adventurer!");
}

export async function getAlternativeStrategy(questTitle: string, stepTitle: string, lang: Language = 'en'): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The user missed a deadline for the step "${stepTitle}" in the quest "${questTitle}". Provide a "Tactical Re-assessment": a short, encouraging, but highly actionable alternative strategy or catch-up plan to help them complete this specific step quickly. Use ${lang === 'ko' ? 'Korean' : 'English'}.`,
  });
  return response.text || (lang === 'ko' ? "일정이 늦어졌지만 포기하지 마세요. 오늘 당장 15분만 투자해 보는 건 어떨까요?" : "You're behind schedule, but don't give up. Why not invest just 15 minutes today?");
}
