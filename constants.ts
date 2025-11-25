
import { CharacterClass, PlayerStats, AdventureLocation, GameSettings } from './types';

export const DEFAULT_SETTINGS: GameSettings = {
  initialHealth: 10,
  handSize: 5,
  maxRounds: 3,
  turnsPerRound: 5,
  evilThreshold: -5,
  goodThreshold: 5,
  xpBaseCost: 1, // Cost = current val + base
  xpLevelUpMult: 5, // Cost = level * mult
  manaCostPerExtraCard: 1,
  alignmentMin: -10,
  alignmentMax: 10
};

export const CLASS_DEFAULTS: Record<CharacterClass, { stats: PlayerStats; description: string; image: string }> = {
  Druid: {
    stats: { level: 1, might: 1, agility: 2, wisdom: 3, spirit: 4 },
    description: "Masters of nature. Balanced stats with high Spirit.",
    image: "https://images.unsplash.com/photo-1511376777868-611b54f68967?q=80&w=1000&auto=format&fit=crop"
  },
  Ranger: {
    stats: { level: 1, might: 2, agility: 4, wisdom: 2, spirit: 1 },
    description: "Expert marksmen and trackers. High Agility.",
    image: "https://images.unsplash.com/photo-1473163928189-364b2c4e1135?q=80&w=1000&auto=format&fit=crop"
  },
  Paladin: {
    stats: { level: 1, might: 4, agility: 1, wisdom: 2, spirit: 3 },
    description: "Holy warriors. High Might and defense capabilities.",
    image: "https://images.unsplash.com/photo-1599789177509-53426ce92d78?q=80&w=1000&auto=format&fit=crop"
  },
  Alchemist: {
    stats: { level: 1, might: 1, agility: 3, wisdom: 4, spirit: 2 },
    description: "Seekers of transmutation. High Wisdom for magic.",
    image: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?q=80&w=1000&auto=format&fit=crop"
  },
  Necromancer: {
    stats: { level: 1, might: 1, agility: 1, wisdom: 4, spirit: 4 },
    description: "Wielders of dark arts. High Wisdom and Spirit.",
    image: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=1000&auto=format&fit=crop"
  },
  Bard: {
    stats: { level: 1, might: 1, agility: 3, wisdom: 3, spirit: 3 },
    description: "Jacks of all trades. Good Agility, Wisdom and Spirit.",
    image: "https://images.unsplash.com/photo-1465847899078-b413929f7120?q=80&w=1000&auto=format&fit=crop"
  }
};

export const ADVENTURE_LOCATIONS: AdventureLocation[] = [
  { 
    id: 'forest', 
    name: 'Whispering Forest', 
    description: 'A dense thicket teeming with life and branching paths.', 
    lootDescription: 'Success: Progress.\nCrit (Margin 5+): +1 Gold.\nCrit (Margin 10+): +1 XP & Double Move.',
    completionReward: { type: 'stat_permanent', value: 2, target: 'spirit', description: 'Permanent +2 Spirit', icon: 'leaf' },
    encounters: [
        { id: 'f1', name: 'Edge of Woods', modifier: null },
        { 
            id: 'f2', 
            name: 'Fork in the River', 
            modifier: { type: 'difficulty', value: 2, name: 'Running Water', description: 'Slippery rocks. +2 Diff.', icon: 'shield-alert' },
            branch: {
                type: 'suit_color',
                text: 'Red: Sunlit Glade (Safe) | Black: Murky Cave (Hard)',
                paths: {
                    red: [
                        { id: 'f3a', name: 'Sunlit Glade', modifier: null },
                        { id: 'f4a', name: 'Fairy Ring', modifier: { type: 'difficulty', value: 1, name: 'Distraction', description: '+1 Difficulty', icon: 'shield-alert' } }
                    ],
                    black: [
                        { id: 'f3b', name: 'Murky Cave', modifier: { type: 'difficulty', value: 4, name: 'Darkness', description: '+4 Difficulty', icon: 'eye-off' } },
                        { id: 'f4b', name: 'Bear Den', modifier: { type: 'difficulty', value: 5, name: 'Angry Bear', description: '+5 Difficulty', icon: 'shield-alert' } }
                    ]
                }
            }
        },
        { id: 'f3', name: 'Deep Thicket', modifier: { type: 'max_cards', value: 2, name: 'Dense Vines', description: 'Max 2 Cards', icon: 'minimize' } },
        { id: 'f4', name: 'Elder Tree', modifier: { type: 'difficulty', value: 4, name: 'Ancient Ward', description: '+4 Difficulty', icon: 'shield-alert' } }
    ],
    currentEncounterIndex: 0, 
    rewards: ['XP', 'Green Mana'],
    preferredSuit: 'clubs',
    statAttribute: 'spirit',
    icon: 'tree'
  },
  { 
    id: 'dungeon', 
    name: 'Deep Dungeon', 
    description: 'Dark corridors filled with ancient treasure.', 
    lootDescription: 'Success: Progress.\nCrit (Margin 5+): +1 Gold.\nCrit (Margin 10+): +1 XP & Double Move.',
    completionReward: { type: 'item', value: 1, target: 'Dragon Slayer Sword', description: 'Weapon: Dragon Slayer', icon: 'sword' },
    encounters: [
        { id: 'd1', name: 'Rusty Gate', modifier: null },
        { id: 'd2', name: 'Guard Room', modifier: { type: 'difficulty', value: 2, name: 'Orc Guard', description: '+2 Difficulty', icon: 'shield-alert' } },
        { id: 'd3', name: 'Trap Hall', modifier: { type: 'suit_penalty', value: 0, targetSuit: 'clubs', name: 'Spike Pit', description: 'Clubs have 0 value', icon: 'eye-off' } },
        { id: 'd4', name: 'Torture Chamber', modifier: { type: 'difficulty', value: 3, name: 'Bad Vibes', description: '+3 Difficulty', icon: 'shield-alert' } },
        { id: 'd5', name: 'Dragon Hoard', modifier: { type: 'difficulty', value: 6, name: 'Dragon', description: '+6 Difficulty', icon: 'shield-alert' } }
    ],
    currentEncounterIndex: 0, 
    rewards: ['Gold', 'Items'],
    preferredSuit: 'spades',
    statAttribute: 'might',
    icon: 'castle'
  },
  { 
    id: 'tower', 
    name: 'Mage Tower', 
    description: 'Arcane libraries and magical anomalies.', 
    lootDescription: 'Success: Progress.\nCrit (Margin 5+): +1 Gold.\nCrit (Margin 10+): +1 XP & Double Move.',
    completionReward: { type: 'mana', value: 10, description: 'Gain 10 Mana', icon: 'sparkles' },
    encounters: [
        { id: 't1', name: 'Lobby', modifier: null },
        { id: 't2', name: 'Spiral Stairs', modifier: { type: 'max_cards', value: 3, name: 'Narrow Steps', description: 'Max 3 Cards', icon: 'minimize' } },
        { id: 't3', name: 'Library', modifier: { type: 'difficulty', value: 3, name: 'Silence', description: '+3 Difficulty', icon: 'shield-alert' } },
        { id: 't4', name: 'Observatory', modifier: null },
        { id: 't5', name: 'Archmage Study', modifier: { type: 'suit_penalty', value: 0, targetSuit: 'spades', name: 'Wards', description: 'Spades have 0 value', icon: 'eye-off' } }
    ], 
    currentEncounterIndex: 0, 
    rewards: ['Mana', 'Spells'],
    preferredSuit: 'diamonds',
    statAttribute: 'wisdom',
    icon: 'mountain'
  },
  { 
    id: 'city', 
    name: 'Capital City', 
    description: 'Bustling streets of commerce and intrigue.', 
    lootDescription: 'Success: Progress.\nCrit (Margin 5+): +1 Gold.\nCrit (Margin 10+): +1 XP & Double Move.',
    completionReward: { type: 'gold', value: 15, description: 'Heist Loot: 15 Gold', icon: 'coins' },
    encounters: [
        { id: 'c1', name: 'City Gates', modifier: null },
        { id: 'c2', name: 'Marketplace', modifier: null },
        { id: 'c3', name: 'Back Alley', modifier: { type: 'difficulty', value: 2, name: 'Thieves', description: '+2 Difficulty', icon: 'shield-alert' } },
        { id: 'c4', name: 'Royal Court', modifier: { type: 'difficulty', value: 4, name: 'Politics', description: '+4 Difficulty', icon: 'shield-alert' } }
    ], 
    currentEncounterIndex: 0, 
    rewards: ['Gold', 'Reputation'],
    preferredSuit: 'hearts',
    statAttribute: 'agility',
    icon: 'city'
  },
];