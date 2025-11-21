
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
  id: string;
}

export type CharacterClass = 'Druid' | 'Rogue' | 'Paladin' | 'Alchemist' | 'Sorceror';
export type Difficulty = 'Easy' | 'Normal' | 'Hard';

export interface PlayerStats {
  level: number;
  might: number;
  agility: number;
  wisdom: number;
  spirit: number;
}

export interface Resources {
  health: number;
  maxHealth: number;
  gold: number;
  mana: number;
  xp: number;
}

export interface Scoring {
  explore: number;
  champion: number;
  fortune: number;
  spirit: number;
}

export interface PlayerState {
  class: CharacterClass;
  stats: PlayerStats;
  resources: Resources;
  scoring: Scoring;
  items: string[];
  artifacts: string[];
  activeBuffs: Partial<Record<keyof PlayerStats, number>>;
}

export type GamePhase = 'setup' | 'playing' | 'resolving' | 'round_end' | 'game_over';

export type StatAttribute = keyof PlayerStats;

// --- Modifiers ---
export type ModifierType = 'difficulty' | 'max_cards' | 'suit_penalty' | 'stat_penalty';

export interface NodeModifier {
  type: ModifierType;
  value: number; // e.g., +2 difficulty, or Max 2 cards
  targetSuit?: Suit; // For suit penalties
  name: string;
  description: string;
  icon: string; // Identifier for UI rendering
}

export interface AdventureLocation {
  id: string;
  name: string;
  description: string;
  lootDescription: string; // New field for specific reward info
  nodes: number;
  progress: number;
  rewards: string[];
  preferredSuit: Suit; // Suit that grants a bonus
  statAttribute: StatAttribute; // Stat used to calculate success here
  nodeModifiers: (NodeModifier | null)[]; // Array corresponding to nodes. null = no modifier
}

export interface TurnRecord {
  round: number;
  turn: number;
  actionName: string;
  playerTotal: number;
  dungeonTotal: number;
  success: boolean;
  details: string; // e.g. "+2 Gold, Took 1 Dmg"
  cardCount: number;
}

export interface TurnResult {
  playerCards: Card[];
  dungeonCard: Card;
  success: boolean;
  message: string;
  reward?: string;
  damage?: number;
  statBonus: number;
  suitBonus: number;
  modifierEffect?: string; // Text description of what the modifier did
  margin?: number; // The amount by which the player succeeded
  pendingRecord: TurnRecord; // The history log to be saved if turn is confirmed
}

export interface HighScore {
  id: string;
  date: string;
  playerName: string;
  characterClass: CharacterClass;
  difficulty: Difficulty;
  score: number;
  outcome: 'Victory' | 'Defeat';
  stats: {
      explore: number;
      champion: number;
      fortune: number;
      spirit: number;
  };
  history: TurnRecord[];
}
