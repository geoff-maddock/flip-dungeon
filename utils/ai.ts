
import { GoogleGenAI, Modality } from "@google/genai";

export const generateClassIcon = async (className: string, description: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Create a simple, stylish, iconic character archetype icon for a fantasy RPG class: ${className}. 
                   Context: ${description}. 
                   Style: Dark fantasy, stylized vector art, flat design, high contrast, dark background, glowing accents. 
                   The image should look like a high-quality game asset, tarot card, or ability icon. Center the subject.`
          },
        ],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            }
        }
    }
    return null;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return null;
  }
};

export const generateAdventureStorySpeech = async (
  characterClass: string,
  outcome: 'Victory' | 'Defeat',
  score: number,
  round: number,
  difficulty: string
): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      You are an old tavern storyteller recounting a legend. 
      Narrate a very short, dramatic summary (max 3 sentences) of a ${characterClass} who ventured into the Flip Dungeon.
      
      Details:
      - Outcome: ${outcome} (Make it heroic if Victory, tragic but hopeful if Defeat)
      - Difficulty: ${difficulty}
      - They lasted ${round} rounds and achieved a score of ${score}.
      
      Style: Epic, atmospheric, fantasy narration.
      Do not include any intro like "Here is the story". Just start the story.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' } // Deep, storytelling voice
          }
        }
      }
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.[0];
    if (audioPart?.inlineData?.data) {
      return audioPart.inlineData.data;
    }
    
    return null;
  } catch (error) {
    console.error("AI Speech Generation Error:", error);
    return null;
  }
};
