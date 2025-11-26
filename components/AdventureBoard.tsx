
import React, { useState, useEffect } from 'react';
import { AdventureLocation, Card, NodeModifier, Reward, PlayerState, HandCombo } from '../types';
import { Map, Castle, Trees, Mountain, Tent, Sword, ShieldAlert, EyeOff, Minimize, Info, Gift, Compass, Flag, PlusCircle, Split, Crown, Coins, Star, Zap, Sparkles, Leaf, Shield, Skull } from 'lucide-react';
import { getSuitSymbol } from '../utils/deck';

interface AdventureBoardProps {
  locations: AdventureLocation[];
  selectedCards: Card[];
  player: PlayerState;
  combo?: HandCombo;
  onLocationAction: (locationId: string) => void;
  onExploreNewLand: () => void;
}

const LocationIcon = ({ icon, id }: { icon?: string; id: string }) => {
  // Legacy support by ID
  if (!icon) {
    switch(id) {
      case 'forest': return <Trees className="w-5 h-5" />;
      case 'dungeon': return <Castle className="w-5 h-5" />;
      case 'tower': return <Mountain className="w-5 h-5" />;
      case 'city': return <Tent className="w-5 h-5" />;
    }
  }

  switch(icon) {
    case 'tree': return <Trees className="w-5 h-5" />;
    case 'castle': return <Castle className="w-5 h-5" />;
    case 'mountain': return <Mountain className="w-5 h-5" />;
    case 'city': return <Tent className="w-5 h-5" />;
    case 'flag': return <Flag className="w-5 h-5" />;
    case 'compass': return <Compass className="w-5 h-5" />;
    case 'sword': return <Sword className="w-5 h-5" />; 
    case 'coins': return <Coins className="w-5 h-5" />;
    case 'star': return <Star className="w-5 h-5" />;
    case 'sparkles': return <Sparkles className="w-5 h-5" />;
    case 'zap': return <Zap className="w-5 h-5" />;
    default: return <Map className="w-5 h-5" />;
  }
};

const RewardIcon = ({ reward }: { reward: Reward }) => {
    // Check specific icon override first
    if (reward.icon) {
         switch(reward.icon) {
             case 'leaf': return <Leaf className="w-5 h-5 text-green-500" />;
             case 'sword': return <Sword className="w-5 h-5 text-orange-500" />;
             case 'shield': return <Shield className="w-5 h-5 text-zinc-400" />;
             case 'coins': return <Coins className="w-5 h-5 text-yellow-500" />;
             case 'sparkles': return <Sparkles className="w-5 h-5 text-blue-500" />;
             case 'star': return <Star className="w-5 h-5 text-purple-500" />;
             case 'zap': return <Zap className="w-5 h-5 text-green-500" />;
             case 'crown': return <Crown className="w-5 h-5 text-orange-500" />;
         }
    }
    
    // Fallback to type
    switch(reward.type) {
        case 'gold': return <Coins className="w-5 h-5 text-yellow-500" />;
        case 'xp': return <Star className="w-5 h-5 text-purple-500" />;
        case 'mana': return <Sparkles className="w-5 h-5 text-blue-500" />;
        case 'item': return <Crown className="w-5 h-5 text-orange-500" />;
        case 'stat_permanent': return <Zap className="w-5 h-5 text-green-500" />;
        default: return <Gift className="w-5 h-5 text-white" />;
    }
}

const ModifierIcon = ({ mod }: { mod: NodeModifier }) => {
    switch(mod.type) {
        case 'difficulty': return <ShieldAlert size={14} className="text-red-500" />;
        case 'suit_penalty': return <EyeOff size={14} className="text-purple-500" />;
        case 'max_cards': return <Minimize size={14} className="text-orange-500" />;
        case 'elite_mechanic': return <Skull size={14} className="text-red-600 animate-pulse" />;
        default: return <Info size={14} className="text-zinc-500" />;
    }
};

const AdventureBoard: React.FC<AdventureBoardProps> = ({ locations, selectedCards, player, combo, onLocationAction, onExploreNewLand }) => {
  const [activeTab, setActiveTab] = useState(locations[0].id);
  const [hoveredReward, setHoveredReward] = useState<Reward | null>(null);
  
  useEffect(() => {
    if (!locations.find(l => l.id === activeTab) && locations.length > 0) {
      setActiveTab(locations[0].id);
    }
  }, [locations, activeTab]);

  const currentLocation = locations.find(l => l.id === activeTab);
  const playerMana = player.resources.mana;
  const playerXp = player.resources.xp;

  const manaCost = Math.max(0, selectedCards.length - 1);
  const canAfford = playerMana >= manaCost;
  
  if (!currentLocation) return null;

  const currentIndex = currentLocation.currentEncounterIndex;
  const totalEncounters = currentLocation.encounters.length;
  
  // Current Encounter
  const currentEncounter = currentLocation.encounters[currentIndex];
  const activeModifier = currentEncounter?.modifier;
  const isBlocked = activeModifier?.type === 'max_cards' && selectedCards.length > activeModifier.value;
  
  // Check branch prediction
  let nextPathColor: 'red' | 'black' | null = null;
  if (currentEncounter?.branch && selectedCards.length > 0) {
      const firstCard = selectedCards[0];
      if (['hearts', 'diamonds'].includes(firstCard.suit)) nextPathColor = 'red';
      else nextPathColor = 'black';
  }

  // Calculate Predicted Power
  const calculateAdventurePower = () => {
    if (selectedCards.length === 0) return 0;
    
    // Base Card
    let cardTotal = selectedCards.reduce((acc, c) => acc + c.value, 0);

    // Combo
    if (combo) {
        if (combo.multiplier > 0) cardTotal = Math.floor(cardTotal * combo.multiplier);
        cardTotal += combo.bonusPower;
    }

    const statKey = currentLocation.statAttribute;
    const statVal = player.stats[statKey] + (player.activeBuffs[statKey] || 0);
    const suitBonus = selectedCards.filter(c => c.suit === currentLocation.preferredSuit).length * 2;
    
    return cardTotal + statVal + suitBonus;
  };

  const predictedPower = calculateAdventurePower();

  return (
    <div className="h-full flex flex-col md:flex-row bg-black/20 md:backdrop-blur-none overflow-hidden relative">
      
      {/* Sidebar Tabs */}
      <div className="md:w-64 bg-zinc-950/80 md:bg-black/40 border-b md:border-b-0 md:border-r border-zinc-800/50 flex flex-row md:flex-col shrink-0 overflow-x-auto md:overflow-y-auto scrollbar-thin">
        
        {/* Location List */}
        <div className="flex-1 flex flex-row md:flex-col p-2 gap-2">
          {locations.map(loc => (
            <button
              key={loc.id}
              onClick={() => setActiveTab(loc.id)}
              className={`
                flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-lg whitespace-nowrap md:whitespace-normal text-left relative flex-shrink-0 border border-transparent
                ${activeTab === loc.id 
                    ? 'bg-zinc-800 text-white border-zinc-700 shadow-lg' 
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}
              `}
            >
              <div className={`p-2 rounded-md ${activeTab === loc.id ? 'bg-black/40 text-yellow-500' : 'bg-zinc-900 text-zinc-500'}`}>
                 <LocationIcon id={loc.id} icon={loc.icon} />
              </div>
              <div className="flex flex-col">
                  <span className="font-bold tracking-tight leading-tight">{loc.name}</span>
                  <span className="text-[10px] text-zinc-600 uppercase">{loc.currentEncounterIndex}/{loc.encounters.length} Steps</span>
              </div>
              {loc.currentEncounterIndex >= loc.encounters.length && <span className="absolute top-2 right-2 text-yellow-500">★</span>}
            </button>
          ))}
        </div>

        {/* Explore New Land Button */}
        <div className="p-4 border-t border-zinc-800/50 md:w-full flex-shrink-0 bg-zinc-900/50 backdrop-blur-sm sticky bottom-0">
            <button
                onClick={onExploreNewLand}
                disabled={playerXp < 1}
                className={`
                    w-full flex items-center justify-center gap-2 px-3 py-3 rounded text-xs font-bold uppercase tracking-wider border transition-all
                    ${playerXp >= 1 
                        ? 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-500' 
                        : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'
                    }
                `}
                title="Discover a new random location (Cost: 1 XP)"
            >
                <PlusCircle size={14} className={playerXp >= 1 ? 'text-yellow-500' : 'text-zinc-600'} />
                <div className="flex flex-col items-start leading-none">
                    <span>New Land</span>
                    <span className="text-[9px] font-normal opacity-70">1 XP</span>
                </div>
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col relative overflow-y-auto scrollbar-thin p-6 md:p-8 lg:p-12 pb-32">
        <div className="max-w-4xl mx-auto w-full">
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
                <div>
                    <h3 className="text-4xl font-black text-zinc-100 mb-2 flex items-center gap-3">
                        <LocationIcon id={currentLocation.id} icon={currentLocation.icon} />
                        {currentLocation.name}
                    </h3>
                    <p className="text-zinc-400 text-lg font-medium max-w-2xl leading-relaxed">{currentLocation.description}</p>
                </div>
                
                {/* Active Modifier Panel */}
                {currentIndex < totalEncounters && currentEncounter && (
                    <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-700/50 w-full md:w-72 shadow-xl backdrop-blur-md">
                        <div className="text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-wider">
                            Current Encounter
                        </div>
                        <div className="font-bold text-zinc-200 text-lg mb-1">{currentEncounter.name}</div>
                        {activeModifier ? (
                            <div className="flex items-start gap-3 text-sm bg-black/30 p-2 rounded-lg border border-white/5">
                                <div className="mt-1"><ModifierIcon mod={activeModifier} /></div>
                                <div>
                                    <div className={`font-bold ${activeModifier.type === 'elite_mechanic' ? 'text-red-500' : 'text-red-300'}`}>{activeModifier.name}</div>
                                    <div className="text-xs text-zinc-400 leading-tight">{activeModifier.description}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs text-zinc-500 italic">No active modifiers.</div>
                        )}
                        
                        {/* Card Limit Warning */}
                        {isBlocked && (
                            <div className="mt-3 text-xs font-bold text-red-500 bg-red-950/50 border border-red-900/50 px-2 py-1 rounded animate-pulse">
                                Cannot play more than {activeModifier?.value} cards!
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Branch Visualization */}
            {currentEncounter?.branch && currentIndex < totalEncounters && (
                <div className="mb-8 bg-zinc-900/40 p-6 rounded-2xl border border-indigo-900/30 shadow-lg">
                    <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold uppercase mb-4 tracking-wider">
                        <Split size={16} /> Fork in the Road
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Red Path */}
                        <div className={`
                            p-4 rounded-xl border-2 transition-all relative overflow-hidden group
                            ${nextPathColor === 'red' ? 'bg-red-950/40 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-zinc-900/50 border-zinc-800'}
                        `}>
                            {nextPathColor === 'red' && <div className="absolute top-0 right-0 px-3 py-1 bg-red-600 text-[10px] font-bold text-white rounded-bl-xl shadow-lg">SELECTED</div>}
                            <div className="text-xs font-bold text-red-400 mb-2 uppercase tracking-widest">High Road</div>
                            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-3">
                                <span>Requires:</span>
                                <span className="text-red-500 font-bold flex items-center bg-black/30 px-2 py-0.5 rounded gap-1"><CardSuitIcon suit="hearts"/> / <CardSuitIcon suit="diamonds"/></span>
                            </div>
                            <div className="font-bold text-lg text-zinc-200 border-t border-white/5 pt-3">{currentEncounter.branch.paths.red[0].name}</div>
                            {currentEncounter.branch.paths.red[0].modifier && (
                                <div className="text-xs text-zinc-500 mt-2 flex items-center gap-2">
                                    <ModifierIcon mod={currentEncounter.branch.paths.red[0].modifier} />
                                    {currentEncounter.branch.paths.red[0].modifier.name}
                                </div>
                            )}
                        </div>

                        {/* Black Path */}
                        <div className={`
                            p-4 rounded-xl border-2 transition-all relative overflow-hidden group
                            ${nextPathColor === 'black' ? 'bg-slate-950/40 border-slate-500 shadow-[0_0_20px_rgba(100,116,139,0.2)]' : 'bg-zinc-900/50 border-zinc-800'}
                        `}>
                            {nextPathColor === 'black' && <div className="absolute top-0 right-0 px-3 py-1 bg-slate-600 text-[10px] font-bold text-white rounded-bl-xl shadow-lg">SELECTED</div>}
                            <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Low Road</div>
                            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-3">
                                <span>Requires:</span>
                                <span className="text-slate-400 font-bold flex items-center bg-black/30 px-2 py-0.5 rounded gap-1"><CardSuitIcon suit="spades"/> / <CardSuitIcon suit="clubs"/></span>
                            </div>
                            <div className="font-bold text-lg text-zinc-200 border-t border-white/5 pt-3">{currentEncounter.branch.paths.black[0].name}</div>
                            {currentEncounter.branch.paths.black[0].modifier && (
                                <div className="text-xs text-zinc-500 mt-2 flex items-center gap-2">
                                    <ModifierIcon mod={currentEncounter.branch.paths.black[0].modifier} />
                                    {currentEncounter.branch.paths.black[0].modifier.name}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-4 mb-8">
                <div className="bg-zinc-900/50 px-4 py-3 rounded-lg border border-zinc-800/50 flex flex-col">
                    <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Key Stat</span>
                    <div className="text-zinc-200 font-bold capitalize text-lg">{currentLocation.statAttribute}</div>
                </div>
                <div className="bg-zinc-900/50 px-4 py-3 rounded-lg border border-zinc-800/50 flex flex-col">
                    <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Affinity</span>
                    <div className="text-zinc-200 font-bold flex items-center gap-2 text-lg">
                        <span className="leading-none">{getSuitSymbol(currentLocation.preferredSuit)}</span>
                        <span className="capitalize">{currentLocation.preferredSuit}</span>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end mb-12">
                <div className="flex flex-col items-end gap-2">
                    <button
                        disabled={selectedCards.length === 0 || !canAfford || currentIndex >= totalEncounters || isBlocked}
                        onClick={() => onLocationAction(currentLocation.id)}
                        className={`
                            flex flex-col items-center justify-center gap-1 px-8 py-3 rounded-xl font-black text-lg transition-all shadow-xl border-2 h-20 min-w-[200px]
                            ${selectedCards.length === 0 || !canAfford || isBlocked
                                ? 'bg-zinc-800/50 text-zinc-600 border-zinc-800 cursor-not-allowed'
                                : currentIndex >= totalEncounters
                                    ? 'bg-green-900/20 text-green-400 border-green-900/50 cursor-default'
                                    : 'bg-red-900/90 text-red-100 hover:bg-red-800 border-red-600 hover:scale-105 hover:shadow-red-900/50'
                            }
                        `}
                    >
                    {currentIndex >= totalEncounters ? (
                        <span>LOCATION CLEARED</span>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <Sword size={24} />
                                <span>EXPLORE {nextPathColor ? (nextPathColor === 'red' ? '(Red)' : '(Black)') : ''}</span>
                            </div>
                            {!isBlocked && predictedPower > 0 && (
                                <div className="text-xs font-mono text-yellow-300 bg-black/30 px-2 py-0.5 rounded flex items-center gap-2">
                                    <span>Power: {predictedPower}</span>
                                    {combo && (
                                        <span className="text-[9px] bg-purple-900 text-purple-200 px-1 rounded animate-pulse">
                                            {combo.name}
                                        </span>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                    </button>
                    {manaCost > 0 && currentIndex < totalEncounters && (
                        <span className={`text-xs font-bold ${canAfford ? 'text-blue-400' : 'text-red-500'}`}>
                            Additional Cost: {manaCost} Mana
                        </span>
                    )}
                </div>
            </div>

            {/* Progress Track (Encounters) */}
            <div className="mt-auto bg-black/30 p-6 rounded-2xl border border-white/5">
                <div className="text-xs font-black text-zinc-600 uppercase mb-4 tracking-widest">Progress Map</div>
                <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-thin relative">
                    {currentLocation.encounters.map((encounter, idx) => {
                        const isCompleted = idx < currentIndex;
                        const isNext = idx === currentIndex;
                        const modifier = encounter.modifier;
                        
                        return (
                        <React.Fragment key={idx}>
                            <div className="relative flex-col flex items-center group min-w-[60px]">
                                <div 
                                    className={`
                                        relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all font-mono text-base shadow-lg
                                        ${isCompleted ? 'bg-green-500/10 border-green-500 text-green-500' : ''}
                                        ${isNext ? 'bg-zinc-800 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.15)] scale-110 z-10' : ''}
                                        ${!isCompleted && !isNext ? 'bg-zinc-900 border-zinc-800 text-zinc-700' : ''}
                                    `}
                                >
                                    {isCompleted ? '✓' : idx + 1}
                                    
                                    {/* Modifier Badge */}
                                    {modifier && !isCompleted && (
                                        <div className="absolute -top-2 -right-2 bg-zinc-950 border border-zinc-700 rounded-full p-1 shadow-sm z-10">
                                            <ModifierIcon mod={modifier} />
                                        </div>
                                    )}
                                    
                                    {/* Branch Badge */}
                                    {encounter.branch && !isCompleted && (
                                        <div className="absolute -bottom-2 -right-2 bg-indigo-950 border border-indigo-500 rounded-full p-1 shadow-sm z-10">
                                            <Split size={12} className="text-indigo-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Name Label */}
                                <div className={`
                                    mt-3 text-[10px] font-bold text-center leading-tight
                                    ${isNext ? 'text-zinc-200' : isCompleted ? 'text-zinc-500' : 'text-zinc-600'}
                                `}>
                                    {encounter.name}
                                </div>

                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-zinc-950 border border-zinc-700 p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
                                    <div className="text-[10px] font-bold text-white mb-0.5">{encounter.name}</div>
                                    {modifier && (
                                        <div className="text-[9px] text-zinc-400 border-t border-zinc-800 pt-1 mt-1">{modifier.name}: {modifier.description}</div>
                                    )}
                                    {encounter.branch && (
                                        <div className="text-[9px] text-indigo-400 border-t border-zinc-800 pt-1 mt-1">Branch: {encounter.branch.text}</div>
                                    )}
                                </div>
                            </div>

                            {/* Connector */}
                            {idx < currentLocation.encounters.length - 1 && (
                                <div className={`flex-shrink-0 w-8 h-1 mb-6 ${isCompleted ? 'bg-green-900' : 'bg-zinc-800'}`} />
                            )}
                        </React.Fragment>
                        );
                    })}
                    
                    {/* Goal / Completion Loot */}
                    <div className="w-8 h-1 mb-6 bg-zinc-800" />
                    <div 
                        onMouseEnter={() => setHoveredReward(currentLocation.completionReward)}
                        onMouseLeave={() => setHoveredReward(null)}
                        className={`
                        relative flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center border-4 ml-2 mb-6 shadow-xl cursor-help transition-all group
                        ${currentIndex >= totalEncounters ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500 shadow-yellow-500/20 scale-110' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-yellow-500/50 hover:text-yellow-500/50'}
                    `}>
                        <div className="scale-125"><RewardIcon reward={currentLocation.completionReward} /></div>
                        <div className="absolute -bottom-6 text-[9px] font-bold text-zinc-600 uppercase tracking-widest group-hover:text-yellow-500/50">Reward</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Hovered Reward Overlay */}
        {hoveredReward && (
            <div className="absolute bottom-24 right-8 z-50 pointer-events-none">
                <div className="bg-zinc-950 border border-yellow-500/50 p-5 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.2)] max-w-sm animate-in slide-in-from-bottom-2 fade-in">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                           <div className="scale-150"><RewardIcon reward={hoveredReward} /></div>
                        </div>
                        <div>
                            <div className="text-xs font-black text-yellow-500 uppercase tracking-wider mb-1">Completion Reward</div>
                            <div className="text-base font-bold text-white leading-tight">{hoveredReward.description}</div>
                        </div>
                    </div>
                    <div className="text-[10px] text-zinc-400 border-t border-zinc-800 pt-3 mt-2 leading-relaxed">
                        Defeat all encounters in this location to claim this reward.
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

// Helper for inline suit icons in Map
const CardSuitIcon = ({ suit }: { suit: string }) => {
    switch(suit) {
        case 'hearts': return <span className="text-red-500">♥</span>;
        case 'diamonds': return <span className="text-red-500">♦</span>;
        case 'spades': return <span className="text-zinc-400">♠</span>;
        case 'clubs': return <span className="text-zinc-400">♣</span>;
        default: return null;
    }
}

export default AdventureBoard;
