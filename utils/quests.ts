
import { Quest, PlayerState, QuestCriteria } from '../types';

const QUEST_TEMPLATES: Partial<Quest>[] = [
  {
    name: "Jack of All Trades",
    description: "Achieve a balanced skill set across all disciplines.",
    bonusPoints: 15,
    criteria: [
      { type: 'scoring', subject: 'explore', target: 5, description: "5 Explore Score" },
      { type: 'scoring', subject: 'champion', target: 5, description: "5 Champion Score" },
      { type: 'scoring', subject: 'fortune', target: 5, description: "5 Fortune Score" },
      { type: 'scoring', subject: 'soul', target: 5, description: "5 Soul Score" },
    ]
  },
  {
    name: "The Hoarder",
    description: "Amass a significant amount of resources simultaneously.",
    bonusPoints: 10,
    criteria: [
      { type: 'resource', subject: 'gold', target: 10, description: "Hold 10 Gold" },
      { type: 'resource', subject: 'mana', target: 10, description: "Hold 10 Mana" },
    ]
  },
  {
    name: "Grand Archmage",
    description: "Reach the pinnacle of magical understanding.",
    bonusPoints: 10,
    criteria: [
      { type: 'stat', subject: 'wisdom', target: 6, description: "Reach 6 Wisdom" },
      { type: 'resource', subject: 'mana', target: 15, description: "Hold 15 Mana" }
    ]
  },
  {
    name: "Dungeon Crawler",
    description: "Clear multiple locations and prove your might.",
    bonusPoints: 12,
    criteria: [
      { type: 'location_cleared', target: 2, description: "Clear 2 Locations" },
      { type: 'stat', subject: 'might', target: 5, description: "Reach 5 Might" }
    ]
  },
  {
    name: "Saintly Path",
    description: "Maintain pure virtue while gaining spirit.",
    bonusPoints: 15,
    criteria: [
      { type: 'alignment', target: 8, description: "Reach +8 Alignment" },
      { type: 'stat', subject: 'spirit', target: 6, description: "Reach 6 Spirit" }
    ]
  },
  {
    name: "Dark Overlord",
    description: "Embrace the darkness and accumulate power.",
    bonusPoints: 15,
    criteria: [
      { type: 'alignment', target: -8, description: "Reach -8 Alignment" },
      { type: 'stat', subject: 'level', target: 3, description: "Reach Player Level 3" }
    ]
  },
  {
    name: "Merchant Prince",
    description: "Collect a variety of items from the shop.",
    bonusPoints: 10,
    criteria: [
      { type: 'item_count', target: 4, description: "Own 4 Items" },
      { type: 'resource', subject: 'gold', target: 5, description: "Hold 5 Gold" }
    ]
  },
  {
    name: "Untouchable",
    description: "Complete objectives while minimizing harm.",
    bonusPoints: 20,
    criteria: [
      { type: 'scoring', subject: 'champion', target: 10, description: "10 Champion Score" },
      // Note: We rely on current health being high as a proxy for "doing well", 
      // or specifically tracking damage taken in PlayerState if we wanted strict "no damage".
      // For now, let's use Max HP retention.
      { type: 'resource', subject: 'health', target: 15, description: "End with 15+ Health" }
    ]
  },
  {
    name: "Legendary Hero",
    description: "Reach a high level of experience.",
    bonusPoints: 10,
    criteria: [
      { type: 'stat', subject: 'level', target: 4, description: "Reach Player Level 4" }
    ]
  },
  {
    name: "Cartographer",
    description: "Explore the world extensively.",
    bonusPoints: 12,
    criteria: [
      { type: 'location_cleared', target: 3, description: "Clear 3 Locations" },
      { type: 'scoring', subject: 'explore', target: 15, description: "15 Explore Score" }
    ]
  }
];

export const generateQuests = (count: number = 4): Quest[] => {
  const shuffled = [...QUEST_TEMPLATES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((template, index) => ({
    id: `quest_${Date.now()}_${index}`,
    name: template.name!,
    description: template.description!,
    criteria: template.criteria!,
    bonusPoints: template.bonusPoints!,
    isCompleted: false
  }));
};

export const checkQuestCompletion = (player: PlayerState): PlayerState => {
  const updatedQuests = player.quests.map(quest => {
    if (quest.isCompleted) return quest; // Already done

    const allCriteriaMet = quest.criteria.every(criterion => {
      switch (criterion.type) {
        case 'resource':
          return player.resources[criterion.subject as keyof typeof player.resources] >= criterion.target;
        case 'stat':
          if (criterion.subject === 'level') return player.stats.level >= criterion.target;
          return player.stats[criterion.subject as keyof typeof player.stats] >= criterion.target;
        case 'scoring':
          return player.scoring[criterion.subject as keyof typeof player.scoring] >= criterion.target;
        case 'item_count':
          return player.items.length >= criterion.target;
        case 'location_cleared':
          return player.locationsCleared >= criterion.target;
        case 'alignment':
          if (criterion.target < 0) return player.alignment <= criterion.target; // Evil (e.g. <= -8)
          return player.alignment >= criterion.target; // Good (e.g. >= 8)
        default:
          return false;
      }
    });

    return allCriteriaMet ? { ...quest, isCompleted: true } : quest;
  });

  // Only update if something changed to avoid unnecessary re-renders
  const hasChanges = updatedQuests.some((q, i) => q.isCompleted !== player.quests[i].isCompleted);
  
  if (hasChanges) {
      return { ...player, quests: updatedQuests };
  }
  
  return player;
};

export const getCriteriaProgress = (player: PlayerState, criterion: QuestCriteria): number => {
   switch (criterion.type) {
        case 'resource':
          return player.resources[criterion.subject as keyof typeof player.resources];
        case 'stat':
          if (criterion.subject === 'level') return player.stats.level;
          return player.stats[criterion.subject as keyof typeof player.stats];
        case 'scoring':
          return player.scoring[criterion.subject as keyof typeof player.scoring];
        case 'item_count':
          return player.items.length;
        case 'location_cleared':
          return player.locationsCleared;
        case 'alignment':
          return player.alignment;
        default:
          return 0;
      }
};
