
import { CharacterClass, PlayerStats, AdventureLocation } from './types';

export const INITIAL_HEALTH = 10;
export const HAND_SIZE = 5;

export const CLASS_DEFAULTS: Record<CharacterClass, { stats: PlayerStats; description: string; image: string }> = {
  Druid: {
    stats: { level: 1, might: 1, agility: 2, wisdom: 3, spirit: 4 },
    description: "Masters of nature and the wild. Strong Spirit and Wisdom.",
    image: "https://images.unsplash.com/photo-1511376777868-611b54f68967?q=80&w=1000&auto=format&fit=crop"
  },
  Rogue: {
    stats: { level: 1, might: 2, agility: 4, wisdom: 2, spirit: 1 },
    description: "Swift and cunning. High Agility allows for great movement.",
    image: "https://images.unsplash.com/photo-1533468398514-885dc21615a6?q=80&w=1000&auto=format&fit=crop"
  },
  Paladin: {
    stats: { level: 1, might: 4, agility: 1, wisdom: 2, spirit: 3 },
    description: "Holy warriors. High Might and defense capabilities.",
    image: "https://images.unsplash.com/photo-1599789177509-53426ce92d78?q=80&w=1000&auto=format&fit=crop"
  },
  Alchemist: {
    stats: { level: 1, might: 1, agility: 3, wisdom: 4, spirit: 2 },
    description: "Seekers of knowledge and transmutation. High Wisdom.",
    image: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?q=80&w=1000&auto=format&fit=crop"
  },
  Sorceror: {
    stats: { level: 1, might: 1, agility: 2, wisdom: 3, spirit: 4 },
    description: "Wielders of arcane power. High Spirit and Mana focus.",
    image: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1000&auto=format&fit=crop"
  }
};

export const ADVENTURE_LOCATIONS: AdventureLocation[] = [
  { 
    id: 'forest', 
    name: 'Whispering Forest', 
    description: 'A dense thicket teeming with life.', 
    lootDescription: 'Success: Gain Location Progress.\nCrit (Margin 5+): +1 Gold.\nCrit (Margin 10+): +1 XP.',
    nodes: 5, 
    progress: 0, 
    rewards: ['XP', 'Green Mana'],
    preferredSuit: 'clubs',
    statAttribute: 'spirit',
    nodeModifiers: []
  },
  { 
    id: 'dungeon', 
    name: 'Deep Dungeon', 
    description: 'Dark corridors filled with ancient treasure.', 
    lootDescription: 'Success: Gain Location Progress.\nCrit (Margin 5+): +1 Gold.\nCrit (Margin 10+): +1 XP.',
    nodes: 8, 
    progress: 0, 
    rewards: ['Gold', 'Items'],
    preferredSuit: 'spades',
    statAttribute: 'might',
    nodeModifiers: []
  },
  { 
    id: 'tower', 
    name: 'Mage Tower', 
    description: 'Arcane libraries and magical anomalies.', 
    lootDescription: 'Success: Gain Location Progress.\nCrit (Margin 5+): +1 Gold.\nCrit (Margin 10+): +1 XP.',
    nodes: 4, 
    progress: 0, 
    rewards: ['Mana', 'Spells'],
    preferredSuit: 'diamonds',
    statAttribute: 'wisdom',
    nodeModifiers: []
  },
  { 
    id: 'city', 
    name: 'Capital City', 
    description: 'Bustling streets of commerce and intrigue.', 
    lootDescription: 'Success: Gain Location Progress.\nCrit (Margin 5+): +1 Gold.\nCrit (Margin 10+): +1 XP.',
    nodes: 3, 
    progress: 0, 
    rewards: ['Gold', 'Reputation'],
    preferredSuit: 'hearts',
    statAttribute: 'agility',
    nodeModifiers: []
  },
];
