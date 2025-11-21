import { NodeModifier, Suit } from '../types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

export const generateLocationModifiers = (nodes: number, difficultyScalar: number): (NodeModifier | null)[] => {
  const modifiers: (NodeModifier | null)[] = [];

  for (let i = 0; i < nodes; i++) {
    // First node is always safe
    if (i === 0) {
      modifiers.push(null);
      continue;
    }

    // Chance of modifier increases with depth
    const chance = 0.3 + (i * 0.1);
    if (Math.random() > chance) {
      modifiers.push(null);
      continue;
    }

    const typeRoll = Math.random();
    
    // 1. Difficulty Increase (Most Common)
    if (typeRoll < 0.5) {
      const addedDiff = Math.floor(i * 1.5) + difficultyScalar;
      modifiers.push({
        type: 'difficulty',
        value: addedDiff,
        name: 'High Ground',
        description: `Enemy has advantage. +${addedDiff} to Dungeon Card value.`,
        icon: 'shield-alert'
      });
    } 
    // 2. Card Limits (Occasional)
    else if (typeRoll < 0.75) {
      const limit = Math.max(1, 4 - Math.floor(i / 3));
      modifiers.push({
        type: 'max_cards',
        value: limit,
        name: 'Narrow Pass',
        description: `Cramped space. You can play a maximum of ${limit} cards.`,
        icon: 'minimize'
      });
    }
    // 3. Suit Penalty (Occasional)
    else {
      const penaltySuit = SUITS[Math.floor(Math.random() * SUITS.length)];
      modifiers.push({
        type: 'suit_penalty',
        value: 0, // Value doesn't matter for boolean ban, or could be multiplier
        targetSuit: penaltySuit,
        name: `${penaltySuit.charAt(0).toUpperCase() + penaltySuit.slice(1)} Dampener`,
        description: `${penaltySuit.charAt(0).toUpperCase() + penaltySuit.slice(1)} cards contribute 0 value here.`,
        icon: 'eye-off'
      });
    }
  }

  return modifiers;
};