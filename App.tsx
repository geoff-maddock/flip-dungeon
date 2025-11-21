
import React, { useState, useEffect } from 'react';
import { CharacterClass, GamePhase, PlayerState, Card, AdventureLocation, TurnResult, StatAttribute, HighScore, NodeModifier, Difficulty, TurnRecord } from './types';
import { CLASS_DEFAULTS, ADVENTURE_LOCATIONS, INITIAL_HEALTH, HAND_SIZE, EVIL_THRESHOLD, GOOD_THRESHOLD, MIN_ALIGNMENT, MAX_ALIGNMENT } from './constants';
import { createDeck, shuffleDeck, getSuitSymbol } from './utils/deck';
import { getHighScores, saveHighScore } from './utils/storage';
import { generateLocationModifiers } from './utils/modifiers';
import { playSFX } from './utils/sound';
import PlayingCard from './components/PlayingCard';
import PlayerDashboard from './components/PlayerDashboard';
import AdventureBoard from './components/AdventureBoard';
import Scoreboard from './components/Scoreboard';
import GameRules from './components/GameRules';
import { Skull, Trophy, Dices, ArrowRight, Swords, ShieldAlert, RefreshCcw, Save, TrendingUp, BarChart3, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [round, setRound] = useState(1);
  const [turn, setTurn] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>('Normal');
  const [gameHistory, setGameHistory] = useState<TurnRecord[]>([]);
  
  // Decks & Hand
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
  const [dungeonDeck, setDungeonDeck] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  
  // Selection State
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [turnResult, setTurnResult] = useState<TurnResult | null>(null);

  // Persistence
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [scoreSaved, setScoreSaved] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Game State
  const [locations, setLocations] = useState<AdventureLocation[]>(ADVENTURE_LOCATIONS);
  const [player, setPlayer] = useState<PlayerState>({
    class: 'Druid',
    stats: CLASS_DEFAULTS['Druid'].stats,
    resources: { health: INITIAL_HEALTH, maxHealth: INITIAL_HEALTH, gold: 0, mana: 0, xp: 0 },
    scoring: { explore: 0, champion: 0, fortune: 0, spirit: 0 },
    items: [],
    artifacts: [],
    activeBuffs: {},
    alignment: 0
  });

  useEffect(() => {
    setHighScores(getHighScores());
  }, []);

  // --- Game Logic ---

  const startGame = (selectedClass: CharacterClass) => {
    playSFX('start');
    setPlayer(prev => ({
      ...prev,
      class: selectedClass,
      stats: CLASS_DEFAULTS[selectedClass].stats,
      resources: { health: INITIAL_HEALTH, maxHealth: INITIAL_HEALTH, gold: 0, mana: 0, xp: 0 },
      scoring: { explore: 0, champion: 0, fortune: 0, spirit: 0 },
      activeBuffs: {},
      alignment: 0
    }));
    
    // Initialize Locations with Random Modifiers
    setLocations(ADVENTURE_LOCATIONS.map(l => ({ 
      ...l, 
      progress: 0,
      nodeModifiers: generateLocationModifiers(l.nodes, 0) // Increase scalar for harder difficulties later
    })));
    
    setPhase('playing');
    setRound(1);
    setTurn(1);
    setGameHistory([]);
    setScoreSaved(false);
    setPlayerName('');
    setSelectedCardIds([]);
    
    // Initialize Decks
    const pDeck = shuffleDeck(createDeck());
    const dDeck = shuffleDeck(createDeck());
    setPlayerDeck(pDeck.slice(HAND_SIZE));
    setHand(pDeck.slice(0, HAND_SIZE));
    setDungeonDeck(dDeck);
  };

  const drawCards = (count: number) => {
    let currentDeck = [...playerDeck];
    let drawn: Card[] = [];
    
    if (currentDeck.length < count) {
      currentDeck = shuffleDeck(createDeck()); 
    }
    
    drawn = currentDeck.slice(0, count);
    setPlayerDeck(currentDeck.slice(count));
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
    // Calculate Modifiers
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

    // Good Alignment Penalty (Virtue is hard)
    if (player.alignment >= GOOD_THRESHOLD) {
        effectiveDungeonValue += 1;
        modifierEffect += " (Virtue +1) ";
    }

    // Apply Player Card Logic (Filter out banned suits)
    playerCards.forEach(c => {
        if (modifier?.type === 'suit_penalty' && modifier.targetSuit === c.suit) {
            modifierEffect += ` ${modifier.name} Penalty.`;
            // Value is 0
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
    
    // Process Result
    setPlayer(prev => {
      const newResources = { ...prev.resources };
      const newScoring = { ...prev.scoring };
      let newAlignment = prev.alignment;
      
      if (success) {
        // --- Sound Logic for Success ---
        if (actionType === 'rest') playSFX('heal');
        else if (actionType === 'loot') playSFX('coin');
        else if (actionType === 'study') playSFX('magic');
        else if (actionType === 'train') playSFX('block');
        else playSFX('attack'); // Explore/Default

        message = "SUCCESS!";

        // Good Alignment Reward (Virtue pays off in spirit)
        if (prev.alignment >= GOOD_THRESHOLD) {
            newScoring.spirit += 1; // Bonus points
        }
        
        // Calculate Margin Bonuses
        let extraAmount = 0;
        let extraMsg = "";

        if (actionType === 'rest') {
             // Base 2, +1 per 5 margin
             extraAmount = Math.floor(margin / 5);
             const totalHeal = 2 + extraAmount + (suitBonus > 0 ? 1 : 0);
             newResources.health = Math.min(newResources.maxHealth, newResources.health + totalHeal);
             newScoring.spirit += 1;
             message = `Restored ${totalHeal} Health!`;
             detailsLog = `+${totalHeal} HP`;
             if (extraAmount > 0) extraMsg = ` (+${extraAmount} Critical)`;
        }
        else if (actionType === 'train') {
             // Base 1, +1 per 8 margin (XP is harder)
             extraAmount = Math.floor(margin / 8);
             const totalXP = 1 + extraAmount + (suitBonus > 0 ? 1 : 0);
             newResources.xp += totalXP;
             newScoring.champion += 1;
             message = `Gained ${totalXP} XP!`;
             detailsLog = `+${totalXP} XP`;
             if (extraAmount > 0) extraMsg = ` (+${extraAmount} Critical)`;
        }
        else if (actionType === 'loot') {
             // Base 1, +1 per 4 margin
             extraAmount = Math.floor(margin / 4);
             const totalGold = 1 + extraAmount + (suitBonus > 0 ? 1 : 0);
             newResources.gold += totalGold;
             newScoring.fortune += 1;
             message = `Found ${totalGold} Gold!`;
             detailsLog = `+${totalGold} Gold`;
             if (extraAmount > 0) extraMsg = ` (+${extraAmount} Critical)`;
             // Greed shifts slightly evil? Let's keep it neutral for now unless specified, stick to buttons.
        }
        else if (actionType === 'study') {
             // Base 1, +1 per 4 margin
             extraAmount = Math.floor(margin / 4);
             const totalMana = 1 + extraAmount + (suitBonus > 0 ? 1 : 0);
             newResources.mana += totalMana;
             newScoring.spirit += 1;
             message = `Gained ${totalMana} Mana!`;
             detailsLog = `+${totalMana} Mana`;
             if (extraAmount > 0) extraMsg = ` (+${extraAmount} Critical)`;
        }
        else if (actionType.startsWith('explore:')) {
             newScoring.explore += 1;
             newScoring.champion += 1; 
             message = "Explored Location!";
             detailsLog = "Location Progress";
             
             // Explore Bonuses: Extra Resources for high rolls
             if (margin >= 10) {
                 newResources.xp += 1;
                 message += " Found +1 XP!";
                 detailsLog += ", +1 XP";
             } else if (margin >= 5) {
                 newResources.gold += 1;
                 message += " Found +1 Gold!";
                 detailsLog += ", +1 Gold";
             }
        }
        else if (actionType === 'dark_pact') {
            // handled before resolveTurn typically, but if routed here:
            // logic in handleAction
        }

        if (extraMsg) message += extraMsg;

        // Suit Match Bonus notification (Value already added above)
        if (suitBonus > 0) {
             message += ` (Suit Match!)`;
        }

      } else {
        playSFX('damage'); // FAIL SOUND

        // Failure: Push Your Luck Penalty
        const diffDamage = Math.max(0, effectiveDungeonValue - playerTotal);
        const cardPenalty = playerCards.length; // "lose one health per card"
        damage = diffDamage + cardPenalty;
        damage = Math.max(1, damage); // Minimum 1 damage
        
        newResources.health = Math.max(0, newResources.health - damage);
        message = `FAILED! Took ${damage} Damage.`;
        detailsLog = `Took ${damage} Dmg`;
      }

      return { ...prev, resources: newResources, scoring: newScoring, alignment: newAlignment };
    });

    if (success && actionType.startsWith('explore:')) {
        const locId = actionType.split(':')[1];
        setLocations(prev => prev.map(l => 
            l.id === locId ? { ...l, progress: Math.min(l.nodes, l.progress + 1) } : l
        ));
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
      dungeonCard: { ...dungeonCard, value: effectiveDungeonValue }, // Update card value to reflect effective diff for UI
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
    if (type === 'self' && (target === 'dark_pact' || target === 'purify')) {
        // Handle Special Alignment Actions
        if (target === 'dark_pact') {
             playSFX('evil');
             setPlayer(prev => ({
                 ...prev,
                 resources: { ...prev.resources, mana: prev.resources.mana + 5 },
                 alignment: Math.max(MIN_ALIGNMENT, prev.alignment - 3)
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
                 alignment: Math.min(MAX_ALIGNMENT, prev.alignment + 2)
             }));
             return;
        }
    }


    if (selectedCardIds.length === 0) return;
    
    const selectedCards = hand.filter(c => selectedCardIds.includes(c.id));
    
    // Mana Cost
    const manaCost = Math.max(0, selectedCards.length - 1);
    if (player.resources.mana < manaCost) return;

    // Modifiers Check
    let activeModifier: NodeModifier | null = null;
    if (type === 'location') {
        const loc = locations.find(l => l.id === target);
        if (loc) {
            activeModifier = loc.nodeModifiers[loc.progress];
            // Enforce Hard Constraints
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
    if (dDeck.length === 0) dDeck = shuffleDeck(createDeck());
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

    // Calculate Bonus: +2 for EACH card matching the suit
    suitBonus = selectedCards.filter(c => c.suit === targetSuit).length * 2;

    resolveTurn(selectedCards, dCard, actionKey, baseStat + buff, suitBonus, activeModifier);
  };

  const handleLevelUp = (stat: StatAttribute | 'PLAYER_LEVEL') => {
      playSFX('level_up');
      if (stat === 'PLAYER_LEVEL') {
          const levelCost = player.stats.level * 5;
          if (player.resources.xp >= levelCost) {
              setPlayer(prev => ({
                  ...prev,
                  stats: { ...prev.stats, level: prev.stats.level + 1 },
                  resources: { 
                      ...prev.resources, 
                      xp: prev.resources.xp - levelCost,
                      maxHealth: prev.resources.maxHealth + 2,
                      health: prev.resources.maxHealth + 2 // Full heal to new max
                  }
              }));
          }
      } else {
        const currentVal = player.stats[stat as StatAttribute];
        const cost = currentVal + 1; 

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
              activeBuffs: statBuff ? { ...prev.activeBuffs, [statBuff]: (prev.activeBuffs[statBuff] || 0) + 2 } : prev.activeBuffs
          }));
      }
  };

  const handleMulligan = () => {
      if (selectedCardIds.length !== 1 || player.resources.mana < 1) return;
      playSFX('flip');
      
      const cardIdToDiscard = selectedCardIds[0];
      const newCard = drawCards(1)[0];
      setHand(prev => prev.map(c => c.id === cardIdToDiscard ? newCard : c));
      
      setPlayer(prev => ({
          ...prev,
          resources: { ...prev.resources, mana: prev.resources.mana - 1 }
      }));
      setSelectedCardIds([]);
  };

  const handleRewindFate = () => {
      if (!turnResult || player.resources.mana < 2) return;
      playSFX('magic');

      // Spend Mana
      setPlayer(prev => ({ ...prev, resources: { ...prev.resources, mana: prev.resources.mana - 2 }}));

      // Reroll Dungeon Card
      let dDeck = [...dungeonDeck];
      if (dDeck.length === 0) dDeck = shuffleDeck(createDeck());
      const newDCard = dDeck[0]; 
      setDungeonDeck(dDeck.slice(1));

      // Recalculate Outcome
      const cardTotal = turnResult.playerCards.reduce((sum, c) => sum + c.value, 0);
      const playerTotal = cardTotal + turnResult.statBonus + turnResult.suitBonus;
      // Note: We can't easily access the original raw value to apply difficulty cleanly without storing it.
      // Simplification: Just apply difficulty directly to new card.
      let dungeonTotal = newDCard.value;
      
      if (difficulty === 'Easy') dungeonTotal = Math.max(1, dungeonTotal - 2);
      else if (difficulty === 'Hard') dungeonTotal += 2;
      
      const success = playerTotal >= dungeonTotal;
      const margin = Math.max(0, playerTotal - dungeonTotal);
      
      let message = success ? "FATE REWRITTEN: SUCCESS!" : `FATE RESISTED!`;
      
      // Revert previous damage if it happened
      setPlayer(prev => {
          const r = { ...prev.resources };
          if (!turnResult.success && turnResult.damage) {
              r.health = Math.min(r.maxHealth, r.health + turnResult.damage);
          }
          return { ...prev, resources: r };
      });

      let newDamage = 0;
      if (!success) {
           const diffDamage = Math.max(0, dungeonTotal - playerTotal);
           const cardPenalty = turnResult.playerCards.length;
           newDamage = Math.max(1, diffDamage + cardPenalty);
           
           // Apply new damage
           setPlayer(prev => ({ 
               ...prev, 
               resources: { ...prev.resources, health: Math.max(0, prev.resources.health - newDamage) } 
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
          modifierEffect: "Fate Rewound (Active Node Modifiers Cleared)",
          margin,
          pendingRecord: newRecord
      });
  };

  const endTurn = () => {
    setPhase('playing');
    
    // Commit history
    if (turnResult?.pendingRecord) {
        setGameHistory(prev => [...prev, turnResult.pendingRecord]);
    }

    setTurnResult(null);
    setSelectedCardIds([]);
    playSFX('flip');

    // Draw back up to HAND_SIZE
    const cardsNeeded = HAND_SIZE - (hand.length - selectedCardIds.length); // Actually selected cards are discarded
    // Remove used cards from hand
    const remainingHand = hand.filter(c => !selectedCardIds.includes(c.id));
    const newCards = drawCards(selectedCardIds.length); 
    setHand([...remainingHand, ...newCards]);

    // Apply Alignment Passive (Evil Decay)
    if (player.alignment <= EVIL_THRESHOLD) {
        setPlayer(prev => ({
            ...prev,
            resources: { ...prev.resources, health: Math.max(0, prev.resources.health - 1) }
        }));
    }

    // Check End of Round
    if (turn >= 5) {
      if (round >= 3) {
        setPhase('game_over');
      } else {
        setRound(r => r + 1);
        setTurn(1);
        // Clear temp buffs
        setPlayer(prev => ({ ...prev, activeBuffs: {} }));
        // Increase location difficulty slightly
        setLocations(prev => prev.map(l => ({ 
            ...l, 
            nodeModifiers: generateLocationModifiers(l.nodes, round * 2) 
        })));
      }
    } else {
      setTurn(t => t + 1);
    }
  };

  // Check for Death
  useEffect(() => {
      if (player.resources.health <= 0 && phase !== 'game_over' && phase !== 'setup') {
          setPhase('game_over');
      }
  }, [player.resources.health, phase]);
  
  // Sound effect for Game Over
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
      const { scoring, stats, resources, items, artifacts } = player;
      
      let total = 0;
      total += scoring.explore * 2;
      total += scoring.champion * 3;
      total += scoring.fortune * 2;
      total += scoring.spirit * 2;
      
      total += (stats.level + stats.might + stats.agility + stats.wisdom + stats.spirit) * 5;
      total += Math.floor(resources.gold / 2);
      total += resources.mana;
      total += items.length * 5;
      total += artifacts.length * 10;
      
      // Difficulty Multiplier
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
                
                {/* Difficulty Selector */}
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
                    <p className="text-xs text-zinc-500">
                        {difficulty === 'Easy' && "Enemies are weaker (-2). Score Multiplier x0.75"}
                        {difficulty === 'Normal' && "Standard experience."}
                        {difficulty === 'Hard' && "Enemies are stronger (+2). Score Multiplier x1.25"}
                    </p>
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
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 h-[600px] overflow-y-auto scrollbar-thin pr-2">
                {Object.entries(CLASS_DEFAULTS).map(([className, details]) => (
                    <button
                        key={className}
                        onClick={() => startGame(className as CharacterClass)}
                        className="group relative h-32 w-full rounded-2xl overflow-hidden border border-zinc-800 transition-all hover:scale-[1.02] hover:border-zinc-500 hover:shadow-2xl text-left"
                    >
                        <div className="absolute inset-0">
                            <img src={details.image} alt={className} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                        </div>
                        <div className="relative z-10 p-6 flex flex-col justify-center h-full">
                            <h3 className="text-3xl font-black text-white mb-1 group-hover:text-yellow-400 transition-colors">{className}</h3>
                            <p className="text-zinc-400 text-sm group-hover:text-zinc-200 transition-colors">{details.description}</p>
                        </div>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                            <ArrowRight className="w-8 h-8 text-white" />
                        </div>
                    </button>
                ))}
            </div>
        </div>

        {showScoreboard && (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                <Scoreboard scores={highScores} onClose={() => setShowScoreboard(false)} />
            </div>
        )}

        {showRules && (
             <GameRules onClose={() => setShowRules(false)} />
        )}
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
                      
                      {!scoreSaved ? (
                          <div className="flex gap-2">
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
                          <div className="text-green-500 font-bold flex items-center justify-center gap-2">
                              <span>Score Saved!</span>
                          </div>
                      )}
                  </div>

                  <button 
                    onClick={() => setPhase('setup')}
                    className="w-full py-3 bg-zinc-100 hover:bg-white text-black font-black rounded-lg transition-colors"
                  >
                      PLAY AGAIN
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Top Bar */}
      <header className="flex justify-between items-center bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/5">
         <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center font-black text-zinc-500 border border-zinc-700">
                 FD
             </div>
             <div>
                 <h1 className="font-bold text-zinc-200 leading-none">Flip Dungeon</h1>
                 <div className="flex gap-2 text-xs text-zinc-500 font-mono items-center mt-1">
                    <span>Round {round}/3</span>
                    <span>•</span>
                    <span>Turn {turn}/5</span>
                    <span>•</span>
                    <span className={`${difficulty === 'Hard' ? 'text-red-500' : difficulty === 'Easy' ? 'text-green-500' : 'text-zinc-500'}`}>{difficulty}</span>
                 </div>
             </div>
         </div>
         <button 
            onClick={() => setShowRules(true)}
            className="text-zinc-500 hover:text-white transition-colors p-2"
            title="Game Rules"
         >
            <HelpCircle size={24} />
         </button>
      </header>

      <PlayerDashboard 
        player={player} 
        selectedCards={hand.filter(c => selectedCardIds.includes(c.id))}
        onSelfAction={(type) => handleAction('self', type)}
        onLevelUp={handleLevelUp}
        onBuyItem={handleBuyItem}
        onMulligan={handleMulligan}
      />

      <AdventureBoard 
        locations={locations} 
        selectedCards={hand.filter(c => selectedCardIds.includes(c.id))}
        playerMana={player.resources.mana}
        onLocationAction={(locId) => handleAction('location', locId)}
      />

      {/* Hand */}
      <div className="flex-1 flex items-end justify-center pb-8 min-h-[240px]">
          <div className="flex -space-x-8 md:-space-x-4 hover:space-x-2 transition-all duration-300 p-4">
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
      </div>

      {/* Resolution Overlay */}
      {phase === 'resolving' && turnResult && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative overflow-hidden">
                  {/* Result Header */}
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
                      {/* Player Side */}
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

                      {/* Dungeon Side */}
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

      {showRules && (
         <GameRules onClose={() => setShowRules(false)} />
      )}
    </div>
  );
};

export default App;
