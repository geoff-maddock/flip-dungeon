
import { NodeModifier, Suit, AdventureLocation, StatAttribute, Encounter } from '../types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const STATS: StatAttribute[] = ['might', 'agility', 'wisdom', 'spirit'];

// Thematic Names
const FOREST_ENCOUNTERS = ["Overgrown Path", "Wolf Den", "Ancient Oak", "Whispering Creek", "Druid's Circle", "Fairy Ring", "Thorny Thicket", "Bear Cave"];
const DUNGEON_ENCOUNTERS = ["Rusty Gate", "Guard Room", "Dark Hallway", "Armory", "Torture Chamber", "Underground Lake", "Crypt Entrance", "Dragon's Hoard"];
const TOWER_ENCOUNTERS = ["Spiral Staircase", "Library", "Alchemy Lab", "Observatory", "Summoning Circle", "Arcane Vault", "Wizard's Study", "Roof Peak"];
const CITY_ENCOUNTERS = ["City Gates", "Market Square", "Tavern Brawl", "Thieves Alley", "Noble's Estate", "Guard Post", "Sewers", "Royal Palace"];
const GENERIC_ENCOUNTERS = ["Unknown Path", "Strange Landmark", "Hidden Trap", "Resting Spot", "Enemy Outpost"];

export const generateModifier = (index: number, difficultyScalar: number): NodeModifier | null => {
    // First node usually safe-ish
    if (index === 0 && Math.random() > 0.3) return null;

    // Chance of modifier increases with depth
    const chance = 0.3 + (index * 0.1);
    if (Math.random() > chance) return null;

    const typeRoll = Math.random();
    
    // 1. Difficulty Increase (Most Common)
    if (typeRoll < 0.5) {
      const addedDiff = Math.floor(index * 1.5) + difficultyScalar + 1;
      return {
        type: 'difficulty',
        value: addedDiff,
        name: 'Hostile Terrain',
        description: `Dangerous footing. +${addedDiff} to Dungeon Card value.`,
        icon: 'shield-alert'
      };
    } 
    // 2. Card Limits (Occasional)
    else if (typeRoll < 0.75) {
      const limit = Math.max(1, 4 - Math.floor(index / 3));
      return {
        type: 'max_cards',
        value: limit,
        name: 'Narrow Pass',
        description: `Cramped space. You can play a maximum of ${limit} cards.`,
        icon: 'minimize'
      };
    }
    // 3. Suit Penalty (Occasional)
    else {
      const penaltySuit = SUITS[Math.floor(Math.random() * SUITS.length)];
      return {
        type: 'suit_penalty',
        value: 0,
        targetSuit: penaltySuit,
        name: `${penaltySuit.charAt(0).toUpperCase() + penaltySuit.slice(1)} Ban`,
        description: `${penaltySuit.charAt(0).toUpperCase() + penaltySuit.slice(1)} cards contribute 0 value here.`,
        icon: 'eye-off'
      };
    }
};

export const generateEncounters = (count: number, difficultyScalar: number, type: string): Encounter[] => {
    const encounters: Encounter[] = [];
    let namePool = GENERIC_ENCOUNTERS;
    
    if (type.includes('Forest') || type.includes('Grove')) namePool = FOREST_ENCOUNTERS;
    else if (type.includes('Dungeon') || type.includes('Crypt')) namePool = DUNGEON_ENCOUNTERS;
    else if (type.includes('Tower') || type.includes('Spire')) namePool = TOWER_ENCOUNTERS;
    else if (type.includes('City') || type.includes('Capital')) namePool = CITY_ENCOUNTERS;

    for (let i = 0; i < count; i++) {
        const name = namePool[Math.floor(Math.random() * namePool.length)] || `Area ${i+1}`;
        encounters.push({
            id: `enc_${Date.now()}_${i}`,
            name: i === count - 1 ? "Boss: " + name : name,
            modifier: generateModifier(i, difficultyScalar)
        });
    }
    return encounters;
};

// Generators for Random Locations
const ADJECTIVES = ['Ancient', 'Forgotten', 'Cursed', 'Hallowed', 'Misty', 'Burning', 'Frozen', 'Shadow', 'Golden', 'Crystal', 'Silent', 'Whispering'];
const NOUNS = ['Ruins', 'Caverns', 'Peaks', 'Shrine', 'Depths', 'Sanctuary', 'Wasteland', 'Crypt', 'Grove', 'Citadel', 'Nexus', 'Tomb'];
const ICONS = ['castle', 'tree', 'mountain', 'city', 'tent', 'flag', 'compass'];

export const generateRandomLocation = (round: number): AdventureLocation => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const name = `${adj} ${noun}`;
  
  const id = `loc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const nodeCount = Math.floor(Math.random() * 4) + 3; // 3 to 6 nodes
  
  const stat = STATS[Math.floor(Math.random() * STATS.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  const icon = ICONS[Math.floor(Math.random() * ICONS.length)];

  const encounters = generateEncounters(nodeCount, round * 2, name);

  return {
    id,
    name,
    description: `A ${adj.toLowerCase()} place of power. Test your ${stat} here.`,
    lootDescription: 'Success: Progress.\nCrit (Margin 5+): +1 Gold.\nCrit (Margin 10+): +1 XP & Double Move.',
    encounters,
    currentEncounterIndex: 0,
    rewards: ['Random Loot'],
    preferredSuit: suit,
    statAttribute: stat,
    icon
  };
};
