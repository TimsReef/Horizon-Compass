
import { GoogleGenAI, Type } from "@google/genai";
import { InsightData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface EnhancedInsightData extends InsightData {
  sources?: Array<{ uri: string; title: string }>;
}

export const getHeadingInsight = async (heading: number, lat: number | null, lng: number | null): Promise<EnhancedInsightData> => {
  const cardinal = getCardinal(heading);
  const prompt = `I am a traveler facing ${heading} degrees (${cardinal}). 
  My current GPS coordinates are Latitude: ${lat || 'Unknown'}, Longitude: ${lng || 'Unknown'}.
  Using Google Search, find any interesting geographic features, nearby landmarks, or historical facts specifically in the direction I am facing from my current location.
  Provide a professional cardinal direction name and a brief, engaging insight.
  Return the result in JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headingName: { type: Type.STRING, description: 'Cardinal direction name (e.g., North, Southwest)' },
            description: { type: Type.STRING, description: 'The interesting travel insight' },
            landmarks: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'Potential landmarks in this direction'
            }
          },
          required: ['headingName', 'description']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    
    const baseData = JSON.parse(text) as InsightData;
    
    // Extract grounding sources from search tool
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks
      ?.filter(chunk => chunk.web)
      ?.map(chunk => ({
        uri: chunk.web?.uri || '',
        title: chunk.web?.title || 'Source'
      }))
      .filter(s => s.uri !== '');

    return {
      ...baseData,
      sources: sources && sources.length > 0 ? sources : undefined
    };
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return {
      headingName: cardinal,
      description: "You are heading towards new horizons. Keep exploring and stay safe on your journey."
    };
  }
};

const getCardinal = (angle: number): string => {
  const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
  return directions[Math.round(angle / 45) % 8];
};
