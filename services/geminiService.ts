
import { GoogleGenAI, Type } from "@google/genai";
import { InsightData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHeadingInsight = async (heading: number, lat: number | null, lng: number | null): Promise<InsightData> => {
  const prompt = `Provide a short, interesting insight for a traveler heading ${heading} degrees. 
  Current location (Lat/Lng): ${lat || 'Unknown'}, ${lng || 'Unknown'}.
  Tell them what direction they are facing (N, NE, E, etc.) and a brief travel-related tip or historical fact about that cardinal direction.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headingName: { type: Type.STRING, description: 'Short cardinal direction name' },
            description: { type: Type.STRING, description: 'The interesting insight text' },
            landmarks: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'Potential landmarks in this general direction'
            }
          },
          required: ['headingName', 'description']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text) as InsightData;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return {
      headingName: getCardinal(heading),
      description: "Enjoy your journey! Stay focused on the horizon."
    };
  }
};

const getCardinal = (angle: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(angle / 45) % 8];
};
