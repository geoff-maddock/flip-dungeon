
import React, { useState, useEffect, useRef } from 'react';
import { CharacterClass, GamePhase, PlayerState, Card, AdventureLocation, TurnResult, StatAttribute, HighScore, NodeModifier, Difficulty, TurnRecord, GameSettings, Encounter } from './types';
import { CLASS_DEFAULTS, ADVENTURE_LOCATIONS, DEFAULT_SETTINGS } from './constants';
import { createDeck, shuffleDeck } from './utils/deck';
import { getHighScores, saveHighScore } from './utils/storage';
import { generateEncounters, generateRandomLocation } from './utils/modifiers';
import { playSFX, playPCMAudio } from './utils/sound';
import { generateClassIcon, generateAdventureStorySpeech } from './utils/ai';
import { generateQuests, checkQuestCompletion } from './utils/quests';
import PlayingCard from './components/PlayingCard';
import PlayerDashboard from './components/PlayerDashboard';
import AdventureBoard from './components/AdventureBoard';
import Scoreboard from './components/Scoreboard';
import GameRules from './components/GameRules';
import AdminPanel from './components/AdminPanel';
import { Skull, Trophy, RefreshCcw, Save, TrendingUp, HelpCircle, Settings, Wand2, Loader2, Copy, X, Mic2, Volume2 } from 'lucide-react';

const App: React.FC = () => {
  // Settings State
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [showAdmin, setShowAdmin] = useState(false);

  const [phase, setPhase] = useState<GamePhase>('setup');
  const [round, setRound] = useState(1);
  const [turn, setTurn] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>('Normal');
  const [gameHistory, setGameHistory] = useState<TurnRecord[]>([]);
  
  // Decks & Hand
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
  const [playerDiscard, setPlayerDiscard] = useState<Card[]>([]);
  const [dungeonDeck, setDungeonDeck] = useState<Card[]>([]);
  const [dungeonDiscard, setDungeonDiscard] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [viewingDiscard, setViewingDiscard] = useState<'player' | 'dungeon' | null>(null);
  
  // Selection State
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [turnResult, setTurnResult] = useState<TurnResult | null>(null);

  // Persistence
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [scoreSaved, setScoreSaved] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // AI Art & Audio State
  const [customClassImages, setCustomClassImages] = useState<Record<string, string>>({});
  const [generatingImages, setGeneratingImages] = useState<string[]>([]);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const generationStarted = useRef(false);

  // Game State
  const [locations, setLocations] = useState<AdventureLocation[]>(ADVENTURE_LOCATIONS);
  const [player, setPlayer] = useState<PlayerState>({
    class: 'Druid',
    stats: CLASS_DEFAULTS['Druid'].stats,
    resources: { health: settings.initialHealth, maxHealth: settings.initialHealth, gold: 0, mana: 0, xp: 0 },
    scoring: { explore: 0, champion: 0, fortune: 0, soul: 0 },
    items: [],
    artifacts: [],
    activeBuffs: {},
    alignment: 0,
    quests: [],
    locationsCleared: 0,
    damageTaken: 0,
    extraTurnsBought: 0
  });

  // Load Settings from LocalStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('flip_dungeon_settings');
    if (savedSettings) {
        try {
            setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
        } catch (e) {
            console.error("Failed to load settings", e);
        }
    }
    setHighScores(getHighScores());
  }, []);

  // Auto-generate class icons on mount
  useEffect(() => {
      if (generationStarted.current) return;
      generationStarted.current = true;

      const generateAllIcons = async () => {
          const classes = Object.keys(CLASS_DEFAULTS) as CharacterClass[];
          for (const className of classes) {
              // Stagger slightly to avoid rate limits and allow UI updates
              await new Promise(resolve => setTimeout(resolve, 200));
              
              setGeneratingImages(prev => [...prev, className]);
              try {
                  const image = await generateClassIcon(className, CLASS_DEFAULTS[className].description);
                  if (image) {
                      setCustomClassImages(prev => ({ ...prev, [className]: image }));
                  }
              } catch (e) {
                  console.error("Auto-generation failed for", className, e);
              } finally {
                  setGeneratingImages(prev => prev.filter(c => c !== className));
              }
          }
      };

      generateAllIcons();
  }, []);

  // Monitor Quest Progress whenever player state changes
  useEffect(() => {
     if (phase === 'playing') {
         setPlayer(prev => checkQuestCompletion(prev));
     }
  }, [player.resources, player.stats, player.scoring, player.items, player.locationsCleared, player.alignment, phase]);

  const handleSaveSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    localStorage.setItem('flip_dungeon_settings', JSON.stringify(newSettings));
    // If in setup, update player health immediately to reflect visual change
    if (phase === 'setup') {
        setPlayer(prev => ({
            ...prev,
            resources: { ...prev.resources, health: newSettings.initialHealth, maxHealth: newSettings.initialHealth }
        }));
    }
  };

  // --- Game Logic ---

  const startGame = (selectedClass: CharacterClass) => {
    playSFX('start');
    setPlayer(prev => ({
      ...prev,
      class: selectedClass,
      stats: CLASS_DEFAULTS[selectedClass].stats,
      resources: { health: settings.initialHealth, maxHealth: settings.initialHealth, gold: 0, mana: 0, xp: 0 },
      scoring: { explore: 0, champion: 0, fortune: 0, soul: 0 },
      activeBuffs: {},
      alignment: 0,
      quests: generateQuests(4),
      locationsCleared: 0,
      damageTaken: 0,
      extraTurnsBought: 0
    }));
    
    // Initialize Locations
    setLocations(ADVENTURE_LOCATIONS.map(l => ({ 
      ...l, 
      currentEncounterIndex: 0,
      encounters: JSON.parse(JSON.stringify(l.encounters))
    })));
    
    setPhase('playing');
    setRound(1);
    setTurn(1);
    setGameHistory([]);
    setScoreSaved(false);
    setPlayerName('');
    setSelectedCardIds([]);
    setPlayerDiscard([]);
    setDungeonDiscard([]);
    setIsGeneratingStory(false);
    
    // Initialize Decks
    const pDeck = shuffleDeck(createDeck());
    const dDeck = shuffleDeck(createDeck());
    setPlayerDeck(pDeck.slice(settings.handSize));
    setHand(pDeck.slice(0, settings.handSize));
    setDungeonDeck(dDeck);
  };

  const drawCards = (count: number) => {
    let currentDeck = [...playerDeck];
    let currentDiscard = [...playerDiscard];
    let drawn: Card[] = [];
    
    if (currentDeck.length >= count) {
        drawn = currentDeck.slice(0, count);
        setPlayerDeck(currentDeck.slice(count));
    } else {
        // Draw remaining from deck
        drawn = [...currentDeck];
        const needed = count - currentDeck.length;
        
        if (currentDiscard.length > 0) {
            // Reshuffle discard
            const newDeck = shuffleDeck(currentDiscard);
            setPlayerDiscard([]);
            
            // Draw rest
            const additional = newDeck.slice(0, needed);
            drawn = [...drawn, ...additional];
            setPlayerDeck(newDeck.slice(needed));
        } else {
            // Emergency: New deck (if user burns through 52 cards without discarding?)
            const emergencyDeck = shuffleDeck(createDeck());
            const additional = emergencyDeck.slice(0, needed);
            drawn = [...drawn, ...additional];
            setPlayerDeck(emergencyDeck.slice(needed));
        }
    }
    return drawn;
  };

  const toggleCardSelection = (cardId: string) => {
      playSFX('click');
      if (selectedCardIds.includes(cardId)) {
          setSelectedCardIds(prev => prev.filter(id => id !== cardId));
      } else {
          setSelectedCardIds(prev => [...prev, cardId]);
      }
  };

  const resolveTurn = (
      playerCards: Card[], 
      dungeonCard: Card, 
      actionType: string, 
      statBonus: number, 
      suitBonus: number, 
      modifier: NodeModifier | null
  ) => {
    let modifierEffect = "";
    let effectiveCardTotal = 0;
    let effectiveDungeonValue = dungeonCard.value;

    // Apply Difficulty Setting Modifier
    if (difficulty === 'Easy') {
        effectiveDungeonValue = Math.max(1, effectiveDungeonValue - 2);
        modifierEffect = "(Easy -2) ";
    } else if (difficulty === 'Hard') {
        effectiveDungeonValue += 2;
        modifierEffect = "(Hard +2) ";
    }

    // Good Alignment Penalty
    if (player.alignment >= settings.goodThreshold) {
        effectiveDungeonValue += 1;
        modifierEffect += " (Virtue +1) ";
    }

    // Apply Player Card Logic
    playerCards.forEach(c => {
        if (modifier?.type === 'suit_penalty' && modifier.targetSuit === c.suit) {
            modifierEffect += ` ${modifier.name} Penalty.`;
        } else {
            effectiveCardTotal += c.value;
        }
    });

    // Apply Node Modifier
    if (modifier?.type === 'difficulty') {
        effectiveDungeonValue += modifier.value;
        modifierEffect += ` ${modifier.name} +${modifier.value}`;
    }

    const playerTotal = effectiveCardTotal + statBonus + suitBonus;
    const success = playerTotal >= effectiveDungeonValue;
    const margin = Math.max(0, playerTotal - effectiveDungeonValue);
    
    let message = "";
    let detailsLog = "";
    let damage = 0;
    
    // Store reference to updated player state to return
    let updatedPlayerState = { ...player };

    setPlayer(prev => {
      const newResources = { ...prev.resources };
      const newScoring = { ...prev.scoring };
      const newItems = [...prev.items];
      const newStats = { ...prev.stats };
      const newAlignment = prev.alignment;
      let locationsCleared = prev.locationsCleared;
      let damageTaken = prev.damageTaken;
      
      if (success) {
        if (actionType === 'rest') playSFX('heal');
        else if (actionType === 'loot') playSFX('coin');
        else if (actionType === 'study') playSFX('magic');
        else if (actionType === 'train') playSFX('block');
        else playSFX('attack');

        message = "SUCCESS!";

        // Good Alignment Reward
        if (prev.alignment >= settings.goodThreshold) {
            newScoring.soul += 1;
        }
        
        let extraAmount = 0;
        let extraMsg = "";

        if (actionType === 'rest') {
             extraAmount = Math.floor(margin / 5);
             const totalHeal = 2 + extraAmount + (suitBonus > 0 ? 1 : 0);
             newResources.health = Math.min(newResources.maxHealth, newResources.health + totalHeal);
             newScoring.soul += 1;
             message = `Restored ${totalHeal} Health!`;
             detailsLog = `+${totalHeal} HP`;
             if (extraAmount > 0) extraMsg = ` (+${extraAmount} Critical)`;
        }
        else if (actionType === 'train') {
             extraAmount = Math.floor(margin / 8);
             const totalXP = 1 + extraAmount + (suitBonus > 0 ? 1 : 0);
             newResources.xp += totalXP;
             newScoring.champion += 1;
             message = `Gained ${totalXP} XP!`;
             detailsLog = `+${totalXP} XP`;
             if (extraAmount > 0) extraMsg = ` (+${extraAmount} Critical)`;
        }
        else if (actionType === 'loot') {
             extraAmount = Math.floor(margin / 4);
             const totalGold = 1 + extraAmount + (suitBonus > 0 ? 1 : 0);
             newResources.gold += totalGold;
             newScoring.fortune += 1;
             message = `Found ${totalGold} Gold!`;
             detailsLog = `+${totalGold} Gold`;
             if (extraAmount > 0) extraMsg = ` (+${extraAmount} Critical)`;
        }
        else if (actionType === 'study') {
             extraAmount = Math.floor(margin / 4);
             const totalMana = 1 + extraAmount + (suitBonus > 0 ? 1 : 0);
             newResources.mana += totalMana;
             newScoring.soul += 1;
             message = `Gained ${totalMana} Mana!`;
             detailsLog = `+${totalMana} Mana`;
             if (extraAmount > 0) extraMsg = ` (+${extraAmount} Critical)`;
        }
        else if (actionType.startsWith('explore:')) {
             newScoring.explore += 1;
             newScoring.champion += 1; 
             message = "Explored Location!";
             detailsLog = "Location Progress";
             
             if (margin >= 10) {
                 newResources.xp += 1;
                 message += " Found +1 XP & Double Move!";
                 detailsLog += ", +1 XP, +2 Nodes";
             } else if (margin >= 5) {
                 newResources.gold += 1;
                 message += " Found +1 Gold!";
                 detailsLog += ", +1 Gold";
             } else {
                 detailsLog += ", +1 Node";
             }
        }

        if (extraMsg) message += extraMsg;
        if (suitBonus > 0) message += ` (Suit Match!)`;

      } else {
        playSFX('damage');
        const diffDamage = Math.max(0, effectiveDungeonValue - playerTotal);
        const cardPenalty = playerCards.length;
        damage = diffDamage + cardPenalty;
        damage = Math.max(1, damage);
        
        newResources.health = Math.max(0, newResources.health - damage);
        damageTaken += damage;
        message = `FAILED! Took ${damage} Damage.`;
        detailsLog = `Took ${damage} Dmg`;
      }

      updatedPlayerState = { ...prev, resources: newResources, scoring: newScoring, alignment: newAlignment, locationsCleared, damageTaken, items: newItems, stats: newStats };
      return updatedPlayerState;
    });

    if (success && actionType.startsWith('explore:')) {
        const locId = actionType.split(':')[1];
        const progressAmount = margin >= 10 ? 2 : 1;
        const location = locations.find(l => l.id === locId);

        let completed = false;
        
        setLocations(prev => prev.map(l => {
            if (l.id !== locId) return l;

            let newEncounters = [...l.encounters];
            const currentEncounter = l.encounters[l.currentEncounterIndex];
            
            // Determine if branch logic applies
            if (currentEncounter.branch && playerCards.length > 0) {
                const firstCard = playerCards[0];
                const isRed = ['hearts', 'diamonds'].includes(firstCard.suit);
                const branchPath = isRed ? currentEncounter.branch.paths.red : currentEncounter.branch.paths.black;
                
                if (branchPath) {
                    const remaining = newEncounters.slice(0, l.currentEncounterIndex + 1);
                    newEncounters = [...remaining, ...branchPath];
                    message += isRed ? " (Path: Red)" : " (Path: Black)";
                }
            }

            const nextIndex = l.currentEncounterIndex + progressAmount;
            const maxIndex = newEncounters.length;

            // Check if location cleared
            if (l.currentEncounterIndex < maxIndex && nextIndex >= maxIndex) {
                completed = true;
            }

            return { 
                ...l, 
                encounters: newEncounters,
                currentEncounterIndex: Math.min(maxIndex, nextIndex) 
            };
        }));

        if (completed && location) {
            // Apply Completion Reward
            setPlayer(p => {
                const r = { ...p.resources };
                const s = { ...p.stats };
                const i = [...p.items];
                const reward = location.completionReward;
                let rewardMsg = "";

                if (reward.type === 'gold') {
                    r.gold += reward.value;
                    rewardMsg = `+${reward.value} Gold`;
                } else if (reward.type === 'xp') {
                    r.xp += reward.value;
                    rewardMsg = `+${reward.value} XP`;
                } else if (reward.type === 'mana') {
                    r.mana += reward.value;
                    rewardMsg = `+${reward.value} Mana`;
                } else if (reward.type === 'item') {
                    const itemName = reward.target || 'Treasure';
                    i.push(itemName);
                    rewardMsg = `Obtained ${itemName}`;
                } else if (reward.type === 'stat_permanent' && reward.target) {
                    s[reward.target as StatAttribute] = (s[reward.target as StatAttribute] || 0) + reward.value;
                    rewardMsg = `+${reward.value} ${reward.target}`;
                }

                message += ` LOCATION CLEARED! Reward: ${rewardMsg}`;
                return { ...p, resources: r, stats: s, items: i, locationsCleared: p.locationsCleared + 1 };
            });
            playSFX('level_up');
        }
    }

    const pendingRecord: TurnRecord = {
        round,
        turn,
        actionName: actionType.startsWith('explore:') ? `Explore ${actionType.split(':')[1]}` : actionType.toUpperCase(),
        playerTotal,
        dungeonTotal: effectiveDungeonValue,
        success,
        details: detailsLog,
        cardCount: playerCards.length
    };

    setTurnResult({
      playerCards,
      dungeonCard: { ...dungeonCard, value: effectiveDungeonValue },
      success,
      message,
      damage,
      statBonus,
      suitBonus,
      modifierEffect,
      margin,
      pendingRecord
    });
    setPhase('resolving');
  };

  const handleAction = (type: 'self' | 'location', target: string) => {
    // Special Spellbook Actions
    if (type === 'self') {
        if (target === 'dark_pact') {
             playSFX('evil');
             setPlayer(prev => ({
                 ...prev,
                 resources: { ...prev.resources, mana: prev.resources.mana + 5 },
                 alignment: Math.max(settings.alignmentMin, prev.alignment - 3)
             }));
             return; 
        }
        if (target === 'purify') {
             if (player.resources.mana < 2) return;
             playSFX('heal');
             setPlayer(prev => ({
                 ...prev,
                 resources: { 
                     ...prev.resources, 
                     mana: prev.resources.mana - 2,
                     health: Math.min(prev.resources.maxHealth, prev.resources.health + 3)
                 },
                 alignment: Math.min(settings.alignmentMax, prev.alignment + 2)
             }));
             return;
        }
        if (target === 'time_warp') {
             const cost = player.extraTurnsBought + 1;
             if (player.resources.mana < cost) return;
             playSFX('magic');
             setPlayer(prev => ({
                 ...prev,
                 resources: { ...prev.resources, mana: prev.resources.mana - cost },
                 extraTurnsBought: prev.extraTurnsBought + 1
             }));
             // Decrementing turn effectively adds a turn to the current round
             setTurn(t => Math.max(0, t - 1));
             return;
        }
    }

    if (selectedCardIds.length === 0) return;
    const selectedCards = hand.filter(c => selectedCardIds.includes(c.id));
    const manaCost = Math.max(0, (selectedCards.length - 1) * settings.manaCostPerExtraCard);
    
    if (player.resources.mana < manaCost) return;

    // Modifiers Check
    let activeModifier: NodeModifier | null = null;
    if (type === 'location') {
        const loc = locations.find(l => l.id === target);
        if (loc) {
            const encounter = loc.encounters[loc.currentEncounterIndex];
            activeModifier = encounter ? encounter.modifier : null;
            
            if (activeModifier?.type === 'max_cards' && selectedCards.length > activeModifier.value) {
                alert(`This path is too narrow! Max ${activeModifier.value} cards.`);
                return;
            }
        }
    }

    // Deduct Mana
    setPlayer(prev => ({
        ...prev,
        resources: { ...prev.resources, mana: prev.resources.mana - manaCost }
    }));

    // 1. Draw Dungeon Card
    let dDeck = [...dungeonDeck];
    if (dDeck.length === 0) {
        // Reshuffle discard if deck empty
        if (dungeonDiscard.length > 0) {
            dDeck = shuffleDeck(dungeonDiscard);
            setDungeonDiscard([]);
        } else {
             dDeck = shuffleDeck(createDeck());
        }
    }
    const dCard = dDeck[0];
    setDungeonDeck(dDeck.slice(1));

    // 2. Determine Stats & Buffs
    let baseStat = 0;
    let buff = 0;
    let suitBonus = 0;
    let targetSuit = '';
    let actionKey = "";

    if (type === 'self') {
        actionKey = target;
        if (target === 'rest') { 
            baseStat = player.stats.spirit; 
            buff = player.activeBuffs.spirit || 0;
            targetSuit = 'hearts';
        }
        if (target === 'train') { 
            baseStat = player.stats.might; 
            buff = player.activeBuffs.might || 0;
            targetSuit = 'clubs';
        }
        if (target === 'loot') { 
            baseStat = player.stats.agility; 
            buff = player.activeBuffs.agility || 0;
            targetSuit = 'spades';
        }
        if (target === 'study') { 
            baseStat = player.stats.wisdom; 
            buff = player.activeBuffs.wisdom || 0;
            targetSuit = 'diamonds';
        }
    } else {
        const loc = locations.find(l => l.id === target);
        if (loc) {
            actionKey = `explore:${target}`;
            baseStat = player.stats[loc.statAttribute];
            buff = player.activeBuffs[loc.statAttribute] || 0;
            targetSuit = loc.preferredSuit;
        }
    }

    suitBonus = selectedCards.filter(c => c.suit === targetSuit).length * 2;

    resolveTurn(selectedCards, dCard, actionKey, baseStat + buff, suitBonus, activeModifier);
  };

  const handleLevelUp = (stat: StatAttribute | 'PLAYER_LEVEL') => {
      playSFX('level_up');
      if (stat === 'PLAYER_LEVEL') {
          const levelCost = player.stats.level * settings.xpLevelUpMult;
          if (player.resources.xp >= levelCost) {
              setPlayer(prev => ({
                  ...prev,
                  stats: { ...prev.stats, level: prev.stats.level + 1 },
                  resources: { 
                      ...prev.resources, 
                      xp: prev.resources.xp - levelCost,
                      maxHealth: prev.resources.maxHealth + 2,
                      health: prev.resources.maxHealth + 2
                  }
              }));
          }
      } else {
        const currentVal = player.stats[stat as StatAttribute];
        const cost = currentVal + settings.xpBaseCost; 

        if (player.resources.xp >= cost) {
            setPlayer(prev => ({
                ...prev,
                stats: { ...prev.stats, [stat]: currentVal + 1 },
                resources: { ...prev.resources, xp: prev.resources.xp - cost }
            }));
        }
      }
  };

  const handleBuyItem = (name: string, cost: number, statBuff?: StatAttribute, hpAmount?: number) => {
      if (player.resources.gold >= cost) {
          playSFX('coin');
          setPlayer(prev => ({
              ...prev,
              resources: { 
                  ...prev.resources, 
                  gold: prev.resources.gold - cost,
                  health: hpAmount ? Math.min(prev.resources.maxHealth, prev.resources.health + hpAmount) : prev.resources.health
              },
              activeBuffs: statBuff ? { ...prev.activeBuffs, [statBuff]: (prev.activeBuffs[statBuff] || 0) + 2 } : prev.activeBuffs,
              items: [...prev.items, name]
          }));
      }
  };

  const handleMulligan = () => {
      if (selectedCardIds.length !== 1 || player.resources.mana < 1) return;
      playSFX('flip');
      const cardIdToDiscard = selectedCardIds[0];
      const cardToDiscard = hand.find(c => c.id === cardIdToDiscard);
      
      if (cardToDiscard) {
          setPlayerDiscard(prev => [...prev, cardToDiscard]);
      }

      const newCard = drawCards(1)[0];
      setHand(prev => prev.map(c => c.id === cardIdToDiscard ? newCard : c));
      setPlayer(prev => ({
          ...prev,
          resources: { ...prev.resources, mana: prev.resources.mana - 1 }
      }));
      setSelectedCardIds([]);
  };

  const handleDiscardHand = () => {
    if (player.resources.mana < 1) return;
    playSFX('flip');
    setPlayer(prev => ({
        ...prev,
        resources: { ...prev.resources, mana: prev.resources.mana - 1 }
    }));
    setPlayerDiscard(prev => [...prev, ...hand]);
    const newHand = drawCards(settings.handSize);
    setHand(newHand);
    setSelectedCardIds([]);
  };

  const handleRewindFate = () => {
      if (!turnResult || player.resources.mana < 2) return;
      playSFX('magic');

      setPlayer(prev => ({ ...prev, resources: { ...prev.resources, mana: prev.resources.mana - 2 }}));
      
      // Current dungeon card is discarded
      setDungeonDiscard(prev => [...prev, turnResult.dungeonCard]);

      // Draw new dungeon card
      let dDeck = [...dungeonDeck];
      if (dDeck.length === 0) {
          if (dungeonDiscard.length > 0) {
              dDeck = shuffleDeck(dungeonDiscard);
              setDungeonDiscard([]);
          } else {
              dDeck = shuffleDeck(createDeck());
          }
      }
      const newDCard = dDeck[0]; 
      setDungeonDeck(dDeck.slice(1));

      const cardTotal = turnResult.playerCards.reduce((sum, c) => sum + c.value, 0);
      const playerTotal = cardTotal + turnResult.statBonus + turnResult.suitBonus;
      let dungeonTotal = newDCard.value;
      
      if (difficulty === 'Easy') dungeonTotal = Math.max(1, dungeonTotal - 2);
      else if (difficulty === 'Hard') dungeonTotal += 2;
      
      const success = playerTotal >= dungeonTotal;
      const margin = Math.max(0, playerTotal - dungeonTotal);
      let message = success ? "FATE REWRITTEN: SUCCESS!" : `FATE RESISTED!`;
      
      setPlayer(prev => {
          const r = { ...prev.resources };
          let d = prev.damageTaken;
          // Heal back damage taken previously in this turn resolution step (simulated)
          if (!turnResult.success && turnResult.damage) {
              r.health = Math.min(r.maxHealth, r.health + turnResult.damage);
              d = Math.max(0, d - turnResult.damage);
          }
          return { ...prev, resources: r, damageTaken: d };
      });

      let newDamage = 0;
      if (!success) {
           const diffDamage = Math.max(0, dungeonTotal - playerTotal);
           const cardPenalty = turnResult.playerCards.length;
           newDamage = Math.max(1, diffDamage + cardPenalty);
           setPlayer(prev => ({ 
               ...prev, 
               resources: { ...prev.resources, health: Math.max(0, prev.resources.health - newDamage) },
               damageTaken: prev.damageTaken + newDamage
           }));
           message += ` Took ${newDamage} Damage.`;
           playSFX('damage');
      } else {
          message += " (Damage prevented)";
          playSFX('heal');
      }

      const newRecord: TurnRecord = {
          ...turnResult.pendingRecord,
          dungeonTotal,
          success,
          details: success ? "Rewound Fate: Success" : `Rewound Fate: Took ${newDamage} Dmg`
      };

      setTurnResult({
          ...turnResult,
          dungeonCard: { ...newDCard, value: dungeonTotal },
          success,
          message,
          damage: newDamage,
          modifierEffect: "Fate Rewound",
          margin,
          pendingRecord: newRecord
      });
  };

  const handleExploreNewLand = () => {
      if (player.resources.xp < 1) return;
      playSFX('magic');
      setPlayer(prev => ({
          ...prev,
          resources: { ...prev.resources, xp: prev.resources.xp - 1 }
      }));
      const newLocation = generateRandomLocation(round);
      setLocations(prev => [...prev, newLocation]);
  };

  const handleGenerateArt = async (e: React.MouseEvent, className: string, description: string) => {
      e.stopPropagation();
      if (generatingImages.includes(className)) return;
      playSFX('magic');
      
      setGeneratingImages(prev => [...prev, className]);
      const base64Image = await generateClassIcon(className, description);
      
      if (base64Image) {
          setCustomClassImages(prev => ({ ...prev, [className]: base64Image }));
          playSFX('level_up');
      }
      
      setGeneratingImages(prev => prev.filter(c => c !== className));
  };

  const handleTellTale = async () => {
    if (isGeneratingStory) return;
    setIsGeneratingStory(true);
    const score = calculateScore();
    const outcome = player.resources.health > 0 ? 'Victory' : 'Defeat';
    
    const base64Audio = await generateAdventureStorySpeech(
        player.class,
        outcome,
        score,
        round,
        difficulty
    );
    
    if (base64Audio) {
        await playPCMAudio(base64Audio);
    }
    
    setIsGeneratingStory(false);
  };

  const endTurn = () => {
    setPhase('playing');
    if (turnResult) {
        setGameHistory(prev => [...prev, turnResult.pendingRecord]);
        // Move cards to respective discard piles
        setPlayerDiscard(prev => [...prev, ...turnResult.playerCards]);
        setDungeonDiscard(prev => [...prev, turnResult.dungeonCard]);
    }
    setTurnResult(null);
    setSelectedCardIds([]);
    playSFX('flip');

    const remainingHand = hand.filter(c => !selectedCardIds.includes(c.id));
    const newCards = drawCards(settings.handSize - remainingHand.length); 
    setHand([...remainingHand, ...newCards]);

    if (player.alignment <= settings.evilThreshold) {
        setPlayer(prev => ({
            ...prev,
            resources: { ...prev.resources, health: Math.max(0, prev.resources.health - 1) }
        }));
    }

    if (turn >= settings.turnsPerRound) {
      if (round >= settings.maxRounds) {
        setPhase('game_over');
      } else {
        setRound(r => r + 1);
        setTurn(1);
        setPlayer(prev => ({ ...prev, activeBuffs: {} }));
      }
    } else {
      setTurn(t => t + 1);
    }
  };

  useEffect(() => {
      if (player.resources.health <= 0 && phase !== 'game_over' && phase !== 'setup') {
          setPhase('game_over');
      }
  }, [player.resources.health, phase]);
  
  useEffect(() => {
      if (phase === 'game_over') {
          if (player.resources.health > 0) {
              playSFX('game_over_win');
          } else {
              playSFX('game_over_loss');
          }
      }
  }, [phase, player.resources.health]);

  const calculateScore = () => {
      const { scoring, stats, resources, items, artifacts, quests } = player;
      let total = 0;
      total += scoring.explore * 2;
      total += scoring.champion * 3;
      total += scoring.fortune * 2;
      total += scoring.soul * 2;
      total += (stats.level + stats.might + stats.agility + stats.wisdom + stats.spirit) * 5;
      total += Math.floor(resources.gold / 2);
      total += resources.mana;
      total += items.length * 5;
      total += artifacts.length * 10;
      
      // Quest Bonus
      quests.forEach(q => {
          if (q.isCompleted) total += q.bonusPoints;
      });

      if (difficulty === 'Easy') total = Math.floor(total * 0.75);
      if (difficulty === 'Hard') total = Math.floor(total * 1.25);
      return total;
  };

  const handleSaveScore = () => {
      if (!playerName.trim()) return;
      saveHighScore({
          id: Date.now().toString(),
          date: new Date().toISOString(),
          playerName,
          characterClass: player.class,
          difficulty,
          score: calculateScore(),
          outcome: player.resources.health > 0 ? 'Victory' : 'Defeat',
          stats: player.scoring,
          history: gameHistory
      });
      setScoreSaved(true);
      setHighScores(getHighScores());
  };

  // --- Rendering ---

  if (phase === 'setup') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8 animate-in slide-in-from-left duration-700">
                <div>
                    <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-zinc-100 to-zinc-600 tracking-tighter mb-4">
                        FLIP<br/>DUNGEON
                    </h1>
                    <p className="text-zinc-400 text-xl max-w-md leading-relaxed">
                        A flip-and-write adventure. Build your party, manage your deck, and push your luck in the depths.
                    </p>
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Select Difficulty</label>
                    <div className="flex gap-2">
                        {(['Easy', 'Normal', 'Hard'] as Difficulty[]).map(d => (
                            <button
                                key={d}
                                onClick={() => setDifficulty(d)}
                                className={`px-4 py-2 rounded-lg font-bold transition-all border
                                    ${difficulty === d 
                                        ? d === 'Easy' ? 'bg-green-900/30 text-green-400 border-green-500' : 
                                          d === 'Hard' ? 'bg-red-900/30 text-red-400 border-red-500' : 
                                          'bg-zinc-700 text-white border-zinc-500'
                                        : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:bg-zinc-800'
                                    }
                                `}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowScoreboard(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-full font-bold transition-all border border-zinc-700 hover:border-yellow-500/50"
                    >
                        <Trophy size={18} className="text-yellow-500" />
                        Hall of Fame
                    </button>
                    <button 
                        onClick={() => setShowRules(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-full font-bold transition-all border border-zinc-700 hover:border-blue-500/50"
                    >
                        <HelpCircle size={18} className="text-blue-500" />
                        Rules
                    </button>
                    <button 
                        onClick={() => setShowAdmin(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-full font-bold transition-all border border-zinc-800 hover:border-zinc-600"
                        title="Game Settings"
                    >
                        <Settings size={18} className="text-zinc-500" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 overflow-visible content-start">
                {Object.entries(CLASS_DEFAULTS).map(([className, details]) => {
                    const isGenerating = generatingImages.includes(className);
                    const imageSrc = customClassImages[className] || details.image;

                    return (
                        <button
                            key={className}
                            onClick={() => startGame(className as CharacterClass)}
                            className="group relative h-32 w-full rounded-2xl overflow-hidden border border-zinc-800 transition-all hover:scale-[1.02] hover:border-zinc-500 hover:shadow-2xl text-left"
                        >
                            <div className="absolute inset-0">
                                <img src={imageSrc} alt={className} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                                
                                {/* AI Generation Button */}
                                <div 
                                    className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => handleGenerateArt(e, className, details.description)}
                                >
                                    <div className="bg-black/60 hover:bg-indigo-600 p-2 rounded-full backdrop-blur-sm border border-white/10 text-white transition-colors">
                                        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                                    </div>
                                </div>
                            </div>
                            <div className="relative z-10 p-6 flex flex-col justify-center h-full">
                                <h3 className="text-3xl font-black text-white mb-1 group-hover:text-yellow-400 transition-colors">{className}</h3>
                                <p className="text-zinc-400 text-sm group-hover:text-zinc-200 transition-colors">{details.description}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>

        {showScoreboard && (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                <Scoreboard scores={highScores} onClose={() => setShowScoreboard(false)} />
            </div>
        )}

        {showRules && <GameRules onClose={() => setShowRules(false)} settings={settings} />}
        {showAdmin && <AdminPanel currentSettings={settings} onSave={handleSaveSettings} onClose={() => setShowAdmin(false)} />}
      </div>
    );
  }

  if (phase === 'game_over') {
      const finalScore = calculateScore();
      const isVictory = player.resources.health > 0;

      return (
          <div className="min-h-screen flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-700 p-8 rounded-2xl shadow-2xl text-center space-y-6 animate-in zoom-in duration-500">
                  <div className="flex justify-center mb-4">
                      {isVictory ? <Trophy size={64} className="text-yellow-500" /> : <Skull size={64} className="text-red-500" />}
                  </div>
                  
                  <div>
                      <h2 className={`text-4xl font-black mb-2 ${isVictory ? 'text-yellow-500' : 'text-red-500'}`}>
                          {isVictory ? 'VICTORY' : 'DEFEATED'}
                      </h2>
                      <div className="flex items-center justify-center gap-2 text-zinc-400">
                        <span>{difficulty} Mode</span>
                        <span>•</span>
                        <span>Your journey has ended.</span>
                      </div>
                  </div>

                  <div className="bg-black/40 p-6 rounded-xl border border-zinc-800">
                      <div className="text-sm text-zinc-500 uppercase font-bold mb-2">Final Score</div>
                      <div className="text-6xl font-mono font-black text-white mb-4">{finalScore}</div>
                      
                      <div className="flex flex-wrap gap-2 justify-center">
                        {player.quests.filter(q => q.isCompleted).map(q => (
                            <span key={q.id} className="text-[10px] bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded">
                                {q.name} (+{q.bonusPoints})
                            </span>
                        ))}
                      </div>

                      {!scoreSaved ? (
                          <div className="flex gap-2 mt-4">
                              <input 
                                  type="text" 
                                  value={playerName}
                                  onChange={(e) => setPlayerName(e.target.value)}
                                  placeholder="Enter Name"
                                  className="bg-zinc-800 border-zinc-700 rounded px-3 py-2 w-full text-white focus:outline-none focus:border-yellow-500"
                                  maxLength={15}
                              />
                              <button 
                                  onClick={handleSaveScore}
                                  disabled={!playerName.trim()}
                                  className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded font-bold disabled:opacity-50"
                              >
                                  <Save size={18} />
                              </button>
                          </div>
                      ) : (
                          <div className="text-green-500 font-bold flex items-center justify-center gap-2 mt-4">
                              <span>Score Saved!</span>
                          </div>
                      )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={handleTellTale}
                        disabled={isGeneratingStory}
                        className="py-3 bg-indigo-900/50 hover:bg-indigo-900 text-indigo-200 border border-indigo-700 font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                        {isGeneratingStory ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                        Listen to Legend
                    </button>
                    <button 
                        onClick={() => setPhase('setup')}
                        className="py-3 bg-zinc-100 hover:bg-white text-black font-black rounded-lg transition-colors border border-white"
                    >
                        PLAY AGAIN
                    </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto flex flex-col gap-6">
      <header className="flex justify-between items-center bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/5">
         <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center font-black text-zinc-500 border border-zinc-700">
                 FD
             </div>
             <div>
                 <h1 className="font-bold text-zinc-200 leading-none">Flip Dungeon</h1>
                 <div className="flex gap-2 text-xs text-zinc-500 font-mono items-center mt-1">
                    <span>Round {round}/{settings.maxRounds}</span>
                    <span>•</span>
                    <span>Turn {turn}/{settings.turnsPerRound}</span>
                    <span>•</span>
                    <span className={`${difficulty === 'Hard' ? 'text-red-500' : difficulty === 'Easy' ? 'text-green-500' : 'text-zinc-500'}`}>{difficulty}</span>
                 </div>
             </div>
         </div>
         <div className="flex gap-2">
            <button 
                onClick={() => setShowRules(true)}
                className="text-zinc-500 hover:text-white transition-colors p-2"
                title="Game Rules"
            >
                <HelpCircle size={24} />
            </button>
            <button 
                onClick={() => setShowAdmin(true)}
                className="text-zinc-600 hover:text-zinc-300 transition-colors p-2"
                title="Settings"
            >
                <Settings size={24} />
            </button>
         </div>
      </header>

      <PlayerDashboard 
        player={player} 
        characterImage={customClassImages[player.class] || CLASS_DEFAULTS[player.class].image}
        selectedCards={hand.filter(c => selectedCardIds.includes(c.id))}
        onSelfAction={(type) => handleAction('self', type)}
        onLevelUp={handleLevelUp}
        onBuyItem={handleBuyItem}
        onMulligan={handleMulligan}
        onDiscardHand={handleDiscardHand}
        settings={settings}
      />

      <AdventureBoard 
        locations={locations} 
        selectedCards={hand.filter(c => selectedCardIds.includes(c.id))}
        playerMana={player.resources.mana}
        playerXp={player.resources.xp}
        onLocationAction={(locId) => handleAction('location', locId)}
        onExploreNewLand={handleExploreNewLand}
      />

      <div className="flex-1 flex flex-col md:flex-row items-end justify-between pb-8 min-h-[240px] gap-8">
          
          {/* Player Discard Pile Visual */}
          <div className="relative hidden md:block group cursor-pointer" onClick={() => playerDiscard.length > 0 && setViewingDiscard('player')}>
              <div className="w-28 h-44 border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center bg-black/20 text-zinc-700 font-bold uppercase text-xs tracking-widest">
                  Discard
              </div>
              {playerDiscard.length > 0 && (
                  <>
                    <div className="absolute inset-0 transform rotate-6 translate-x-1">
                        <PlayingCard card={playerDiscard[playerDiscard.length - 1]} />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-zinc-800 text-zinc-300 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border border-zinc-600 z-10">
                        {playerDiscard.length}
                    </div>
                  </>
              )}
          </div>

          <div className="flex -space-x-8 md:-space-x-4 hover:space-x-2 transition-all duration-300 p-4 justify-center w-full md:w-auto">
              {hand.map((card) => {
                  const selectedIndex = selectedCardIds.indexOf(card.id);
                  const isSelected = selectedIndex >= 0;
                  return (
                    <PlayingCard 
                        key={card.id} 
                        card={card} 
                        selected={isSelected}
                        selectionIndex={isSelected ? selectedIndex : undefined}
                        onClick={() => toggleCardSelection(card.id)}
                    />
                  );
              })}
          </div>
          
           {/* Dungeon Discard Pile Visual (Placeholder to balance layout) */}
           <div className="relative hidden md:block group cursor-pointer" onClick={() => dungeonDiscard.length > 0 && setViewingDiscard('dungeon')}>
              <div className="w-28 h-44 border-2 border-dashed border-red-900/30 rounded-xl flex items-center justify-center bg-black/20 text-red-900/50 font-bold uppercase text-xs tracking-widest text-center">
                  Dungeon<br/>Discard
              </div>
              {dungeonDiscard.length > 0 && (
                  <>
                    <div className="absolute inset-0 transform -rotate-3 -translate-x-1">
                        <PlayingCard card={dungeonDiscard[dungeonDiscard.length - 1]} />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-red-900 text-red-200 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border border-red-700 z-10">
                        {dungeonDiscard.length}
                    </div>
                  </>
              )}
          </div>

      </div>
      
      {/* Viewing Discard Modal */}
      {viewingDiscard && (
        <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur flex items-center justify-center p-8 animate-in fade-in" onClick={() => setViewingDiscard(null)}>
            <div className="relative w-full max-w-5xl bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-h-[80vh] overflow-y-auto scrollbar-thin" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Copy /> {viewingDiscard === 'player' ? 'Player Discard Pile' : 'Dungeon Discard Pile'}
                    </h2>
                    <button onClick={() => setViewingDiscard(null)} className="text-zinc-500 hover:text-white"><X size={24}/></button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {(viewingDiscard === 'player' ? playerDiscard : dungeonDiscard).map((card, i) => (
                        <div key={i} className="transform scale-90 origin-top-left">
                            <PlayingCard card={card} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Resolution Overlay */}
      {phase === 'resolving' && turnResult && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-2 ${turnResult.success ? 'bg-green-500' : 'bg-red-500'}`} />
                  
                  <h2 className="text-3xl font-black text-center mb-8 tracking-tight flex flex-col items-center gap-2">
                      {turnResult.success ? (
                          <span className="text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">SUCCESS</span>
                      ) : (
                          <span className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">FAILURE</span>
                      )}
                      <span className="text-lg text-zinc-400 font-medium font-mono text-center">{turnResult.message}</span>
                  </h2>

                  <div className="flex items-center justify-center gap-8 md:gap-16 mb-8">
                      <div className="flex flex-col items-center gap-2">
                          <div className="flex -space-x-12 scale-75">
                            {turnResult.playerCards.map((c, i) => (
                                <div key={i} className="transform hover:scale-110 transition-transform relative z-10">
                                    <PlayingCard card={c} />
                                </div>
                            ))}
                          </div>
                          <div className="text-center mt-2">
                              <div className="font-bold text-xl text-white">
                                  {turnResult.playerCards.reduce((a, b) => a + b.value, 0) + turnResult.statBonus + turnResult.suitBonus}
                              </div>
                              <div className="text-xs text-zinc-500 uppercase font-bold">Your Power</div>
                              <div className="text-[10px] text-zinc-600">
                                Cards: {turnResult.playerCards.reduce((a, b) => a + b.value, 0)} + Stat: {turnResult.statBonus} + Bonus: {turnResult.suitBonus}
                              </div>
                          </div>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <div className="font-black text-4xl text-zinc-600">VS</div>
                        {turnResult.margin !== undefined && (
                           <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${turnResult.success ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                               {turnResult.success ? <TrendingUp size={12}/> : null}
                               Margin: {turnResult.margin}
                           </div>
                        )}
                      </div>

                      <div className="flex flex-col items-center gap-2">
                          <div className="scale-75">
                             <PlayingCard card={turnResult.dungeonCard} />
                          </div>
                          <div className="text-center mt-2">
                              <div className="font-bold text-xl text-red-400">{turnResult.dungeonCard.value}</div>
                              <div className="text-xs text-zinc-500 uppercase font-bold">Difficulty</div>
                              {turnResult.modifierEffect && (
                                <div className="text-[10px] text-red-400 font-medium max-w-[120px] leading-tight mt-1">
                                    {turnResult.modifierEffect}
                                </div>
                              )}
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-3 justify-center">
                    {!turnResult.success && player.resources.mana >= 2 && (
                        <button 
                            onClick={handleRewindFate}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-900/50 hover:bg-blue-900 text-blue-200 rounded-lg font-bold transition-colors border border-blue-800"
                        >
                            <RefreshCcw size={18} />
                            Rewind Fate (2 Mana)
                        </button>
                    )}
                    
                    <button 
                        onClick={endTurn}
                        className="px-8 py-3 bg-zinc-100 hover:bg-white text-black font-black rounded-lg transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        CONTINUE
                    </button>
                  </div>
              </div>
          </div>
      )}

      {showRules && <GameRules onClose={() => setShowRules(false)} settings={settings} />}
      {showAdmin && <AdminPanel currentSettings={settings} onSave={handleSaveSettings} onClose={() => setShowAdmin(false)} />}
    </div>
  );
};

export default App;