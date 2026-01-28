
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getStyleAdvice = async (productName: string, category: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a world-class fashion stylist for a high-end luxury brand called "ShopVibe Maison". 
      Provide a brief, poetic, and practical styling tip for the following item: "${productName}" (Category: ${category}). 
      Focus on what other items or vibes it pairs with. Keep the advice under 25 words.`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      },
    });

    return response.text?.trim() || "Pairs beautifully with minimalist accessories for a timeless aesthetic.";
  } catch (error) {
    console.error("Error fetching style advice:", error);
    return "A versatile piece that elevates any curated wardrobe.";
  }
};
