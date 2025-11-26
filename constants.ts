
import { CharacterClass, PlayerStats, AdventureLocation, GameSettings, ClassAbility } from './types';

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

type ClassDef = { stats: PlayerStats; description: string; image: string; ability: ClassAbility };

export const CLASS_DEFAULTS: Record<CharacterClass, ClassDef> = {
  Druid: {
    stats: { level: 1, might: 1, agility: 2, wisdom: 3, spirit: 4 },
    description: "Masters of nature. Balanced stats with high Spirit.",
    image: "https://images.unsplash.com/photo-1511376777868-611b54f68967?q=80&w=1000&auto=format&fit=crop",
    ability: {
        name: "Regrowth",
        description: "Free action. Heal 4 HP immediately.",
        manaCost: 2,
        cooldown: 3,
        effectType: 'heal',
        value: 4,
        icon: 'leaf'
    }
  },
  Ranger: {
    stats: { level: 1, might: 2, agility: 4, wisdom: 2, spirit: 1 },
    description: "Expert marksmen and trackers. High Agility.",
    image: "https://images.unsplash.com/photo-1473163928189-364b2c4e1135?q=80&w=1000&auto=format&fit=crop",
    ability: {
        name: "Bullseye",
        description: "Next action counts as an Automatic Critical Success (Margin 10).",
        manaCost: 3,
        cooldown: 4,
        effectType: 'auto_crit',
        icon: 'crosshair'
    }
  },
  Paladin: {
    stats: { level: 1, might: 4, agility: 1, wisdom: 2, spirit: 3 },
    description: "Holy warriors. High Might and defense capabilities.",
    image: "https://images.unsplash.com/photo-1599789177509-53426ce92d78?q=80&w=1000&auto=format&fit=crop",
    ability: {
        name: "Divine Shield",
        description: "Prevent all damage from the next failed test.",
        manaCost: 2,
        cooldown: 3,
        effectType: 'damage_block',
        icon: 'shield'
    }
  },
  Alchemist: {
    stats: { level: 1, might: 1, agility: 3, wisdom: 4, spirit: 2 },
    description: "Seekers of transmutation. High Wisdom for magic.",
    image: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?q=80&w=1000&auto=format&fit=crop",
    ability: {
        name: "Elixir of Insight",
        description: "Gain 3 Mana and 3 XP immediately.",
        manaCost: 0,
        cooldown: 4,
        effectType: 'resource_boost',
        value: 3,
        icon: 'flask'
    }
  },
  Necromancer: {
    stats: { level: 1, might: 1, agility: 1, wisdom: 4, spirit: 4 },
    description: "Wielders of dark arts. High Wisdom and Spirit.",
    image: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=1000&auto=format&fit=crop",
    ability: {
        name: "Soul Harvest",
        description: "Discard hand. Draw 5 cards. Each Spade drawn grants +1 Gold.",
        manaCost: 2,
        cooldown: 4,
        effectType: 'draw',
        icon: 'skull'
    }
  },
  Bard: {
    stats: { level: 1, might: 1, agility: 3, wisdom: 3, spirit: 3 },
    description: "Jacks of all trades. Good Agility, Wisdom and Spirit.",
    image: "https://images.unsplash.com/photo-1465847899078-b413929f7120?q=80&w=1000&auto=format&fit=crop",
    ability: {
        name: "Encore",
        description: "The next action costs 0 Mana to use multiple cards.",
        manaCost: 1,
        cooldown: 3,
        effectType: 'resource_boost', // Custom handling in app logic
        icon: 'music'
    }
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
                        { id: 'f4b', name: 'Bear Den', modifier: { type: 'elite_mechanic', value: 5, name: 'Enraged Bear', description: 'Double Damage on Failure.', icon: 'skull' } }
                    ]
                }
            }
        },
        { id: 'f3', name: 'Deep Thicket', modifier: { type: 'max_cards', value: 2, name: 'Dense Vines', description: 'Max 2 Cards', icon: 'minimize' } },
        { id: 'f4', name: 'Elder Tree', modifier: { type: 'elite_mechanic', value: 6, name: 'Ancient Ward', description: '+6 Difficulty. Needs Spirit to pass.', icon: 'shield-alert' } }
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
        { id: 'd5', name: 'Dragon Hoard', modifier: { type: 'elite_mechanic', value: 6, name: 'Dragon Scales', description: 'Difficulty +6. Must deal 15+ Total Power to succeed.', icon: 'shield' } }
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
        { id: 't5', name: 'Archmage Study', modifier: { type: 'elite_mechanic', value: 5, name: 'Anti-Magic Field', description: 'Spades & Clubs Only. Diamonds/Hearts disabled.', icon: 'eye-off' } }
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
        { id: 'c4', name: 'Royal Court', modifier: { type: 'elite_mechanic', value: 4, name: 'Corrupt Judge', description: 'Cost to Play Cards doubled.', icon: 'coins' } }
    ], 
    currentEncounterIndex: 0, 
    rewards: ['Gold', 'Reputation'],
    preferredSuit: 'hearts',
    statAttribute: 'agility',
    icon: 'city'
  },
];
