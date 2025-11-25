
import { GoogleGenAI, Modality } from "@google/genai";
import { PlayerState, TurnRecord, Difficulty } from '../types';

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
  player: PlayerState,
  history: TurnRecord[],
  outcome: 'Victory' | 'Defeat',
  score: number,
  round: number,
  difficulty: Difficulty
): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Analyze History for Flavor
    const locationsVisited = [...new Set(history.filter(h => h.actionName.startsWith('Explore')).map(h => h.actionName.replace('Explore ', '')))];
    const bestStatEntry = Object.entries(player.stats).filter(([k]) => k !== 'level').reduce((a, b) => a[1] > b[1] ? a : b, ['Balanced', 0]);
    const bestStat = bestStatEntry[0];
    const deathCause = outcome === 'Defeat' ? history[history.length - 1]?.details : '';
    
    const prompt = `
      You are an old tavern storyteller recounting a legend. 
      Narrate a dramatic, flavorful summary (max 3-4 sentences) of a Level ${player.stats.level} ${player.class} who ventured into the Flip Dungeon.
      
      Weave these details into the story naturally:
      - Defining Trait: Known for their high ${bestStat}.
      - Journey: They traveled through ${locationsVisited.length > 0 ? locationsVisited.join(', ') : 'the entrance'}.
      - Achievements: Cleared ${player.locationsCleared} locations.
      - Fate: ${outcome} on Round ${round} (${difficulty} difficulty).
      - Ending: ${outcome === 'Defeat' ? `Fell to: ${deathCause}` : 'Retired a wealthy legend.'}
      - Alignment: ${player.alignment < -3 ? 'A corrupted soul.' : player.alignment > 3 ? 'A beacon of virtue.' : 'A pragmatic mercenary.'}
      
      Style: Epic, atmospheric, dark fantasy. 
      Do not list numbers or stats directly like a report. Tell it as a myth.
      Do not include an intro like "Here is the story". Start directly with the narration.
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
            prebuiltVoiceConfig: { voiceName: 'Fenrir' } // Fenrir: Deeper, more intense for dark fantasy
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
