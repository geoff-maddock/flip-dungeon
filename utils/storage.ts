import { HighScore } from '../types';

const STORAGE_KEY = 'flip_dungeon_high_scores';

export const getHighScores = (): HighScore[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load high scores", error);
    return [];
  }
};

export const saveHighScore = (entry: HighScore): HighScore[] => {
  try {
    const scores = getHighScores();
    scores.push(entry);
    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);
    // Keep top 20
    const topScores = scores.slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topScores));
    return topScores;
  } catch (error) {
    console.error("Failed to save high score", error);
    return [];
  }
};
