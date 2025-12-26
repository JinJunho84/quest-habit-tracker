
import { GoogleGenAI, Type } from "@google/genai";
import { Quest, QuestStep } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generateQuestBreakdown(goal: string, durationDays: number): Promise<Partial<Quest>> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a detailed quest breakdown for the goal: "${goal}" to be completed in ${durationDays} days.`,
    config: {
      systemInstruction: `You are an RPG Quest Master. Transform user goals into a gamified quest line. 
      Break the goal into 3-7 logical, sequential steps (sub-quests). 
      Provide realistic timestamps for each step starting from today. 
      Output should be professional yet engaging.`,
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
                scheduledAt: { type: Type.STRING, description: "ISO 8601 Date string" },
                durationMinutes: { type: Type.NUMBER }
              },
              required: ["title", "description", "scheduledAt", "durationMinutes"]
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
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      lastUpdate: new Date().toISOString(),
      steps: data.steps.map((s: any) => ({ ...s, id: crypto.randomUUID(), isCompleted: false }))
    };
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Quest generation failed.");
  }
}

export async function getMotivationalNudge(questTitle: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The user hasn't made progress on their quest: "${questTitle}". Give them a short, punchy, RPG-themed motivational nudge to get back on track.`,
  });
  return response.text || "Your quest awaits, adventurer!";
}

export async function recommendNextQuests(completedQuestTitle: string): Promise<string[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on the completed quest "${completedQuestTitle}", suggest 3 potential next quests that would naturally follow up or expand the user's skill set.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  return JSON.parse(response.text);
}
