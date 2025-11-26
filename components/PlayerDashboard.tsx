
import React, { useState } from 'react';
import { PlayerState, Card, StatAttribute, GameSettings } from '../types';
import { Heart, Coins, Star, Sparkles, User, Shield, Zap, Scroll, Brain, Map as MapIcon, Crosshair, Gem, ArrowUpCircle, ShoppingBag, RefreshCw, Skull, Sun, Trash2, ScrollText, Book, Clock } from 'lucide-react';
import { getSuitSymbol } from '../utils/deck';
import { playSFX } from '../utils/sound';
import QuestLog from './QuestLog';

interface PlayerDashboardProps {
  player: PlayerState;
  characterImage?: string;
  selectedCards: Card[];
  onSelfAction: (actionType: 'rest' | 'train' | 'loot' | 'study' | 'dark_pact' | 'purify' | 'time_warp') => void;
  onLevelUp: (stat: StatAttribute | 'PLAYER_LEVEL') => void;
  onBuyItem: (item: string, cost: number, statBuff?: StatAttribute, amount?: number) => void;
  onMulligan: () => void;
  onDiscardHand: () => void;
  settings: GameSettings;
}

const StatRow = ({ 
  label, 
  description,
  value, 
  icon, 
  statKey, 
  xp, 
  onLevelUp,
  buff,
  baseCost
}: { 
  label: string; 
  description: string;
  value: number; 
  icon: React.ReactNode; 
  statKey: StatAttribute;
  xp: number;
  onLevelUp: (s: StatAttribute) => void;
  buff?: number;
  baseCost: number;
}) => {
  const cost = value + baseCost;
  const canUpgrade = xp >= cost && statKey !== 'level';

  return (
    <div className="flex items-center justify-between bg-zinc-900/50 p-2 rounded border border-zinc-800 relative group hover:border-zinc-700 transition-colors cursor-help">
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-zinc-950 border border-zinc-700 text-zinc-300 text-[10px] p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 text-center backdrop-blur-sm transform translate-y-1 group-hover:translate-y-0">
        <p className="font-bold text-white mb-1">{label}</p>
        <p className="leading-relaxed">{description}</p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-700"></div>
      </div>

      <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
        {icon}
        <span className="border-b border-dotted border-zinc-700 group-hover:border-zinc-500 transition-colors">{label}</span>
      </div>
      <div className="flex items-center gap-2">
         {buff ? <span className="text-xs font-bold text-green-400 animate-pulse">+{buff}</span> : null}
         <span className={`font-mono text-lg font-bold ${buff ? 'text-green-400' : 'text-zinc-100'}`}>
            {value + (buff || 0)}
         </span>
         {statKey !== 'level' && (
            <button 
              onClick={(e) => { e.stopPropagation(); playSFX('click'); onLevelUp(statKey); }}
              disabled={!canUpgrade}
              className={`
                ml-2 px-1.5 py-0.5 rounded transition-all border flex items-center gap-1
                ${canUpgrade 
                   ? 'bg-zinc-800 hover:bg-green-900/50 text-green-500 hover:text-green-400 border-zinc-700 hover:border-green-500 shadow-lg shadow-green-900/20 cursor-pointer' 
                   : 'bg-transparent text-zinc-700 border-transparent cursor-default opacity-50'
                }
              `}
              title={`Upgrade ${label} for ${cost} XP`}
            >
               <span className="text-[10px] font-mono font-bold leading-none">{cost}XP</span>
               <ArrowUpCircle size={12} />
            </button>
         )}
      </div>
    </div>
  );
};

const ScoreTrack = ({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) => (
  <div className="flex items-center gap-2">
    <div className={`p-1.5 rounded bg-zinc-900 border border-zinc-800 ${color}`}>
      {icon}
    </div>
    <div className="flex-1">
      <div className="text-[10px] uppercase text-zinc-500 font-bold">{label}</div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-0.5">
        <div 
          className={`h-full ${color.replace('text-', 'bg-')}`} 
          style={{ width: `${Math.min((value / 20) * 100, 100)}%` }}
        />
      </div>
    </div>
    <div className="font-mono text-sm font-bold w-6 text-right">{value}</div>
  </div>
);

const ActionButton = ({ 
  label, 
  subtext, 
  icon, 
  suit, 
  onClick, 
  disabled,
  manaCost,
  tooltip,
  variant = 'neutral',
  predictedPower = 0
}: { 
  label: string; 
  subtext: string; 
  icon: React.ReactNode; 
  suit?: string; 
  onClick: () => void; 
  disabled: boolean;
  manaCost: number;
  tooltip: string;
  variant?: 'neutral' | 'evil' | 'good';
  predictedPower?: number;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      relative flex flex-col items-start p-3 rounded-lg border transition-all w-full text-left overflow-hidden
      ${disabled 
        ? 'bg-zinc-900/30 border-zinc-800 opacity-40 cursor-not-allowed' 
        : variant === 'evil' 
            ? 'bg-red-950/30 border-red-900 hover:bg-red-900/50 hover:border-red-500 hover:shadow-red-900/20'
        : variant === 'good'
            ? 'bg-indigo-950/30 border-indigo-900 hover:bg-indigo-900/50 hover:border-indigo-500 hover:shadow-indigo-900/20'
        : 'bg-zinc-800 border-zinc-600 hover:border-yellow-500/50 hover:bg-zinc-750 hover:shadow-[0_0_15px_rgba(0,0,0,0.5)]'
      }
      cursor-pointer group
    `}
    title={tooltip}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="flex items-center justify-between w-full mb-1 relative z-10">
      <div className={`flex items-center gap-2 font-black ${variant === 'evil' ? 'text-red-400' : variant === 'good' ? 'text-indigo-300' : 'text-zinc-200'} group-hover:text-white`}>
        {icon}
        <span>{label}</span>
      </div>
      {suit && <span className="text-2xl font-mono opacity-50">{suit}</span>}
    </div>
    <div className="text-xs text-zinc-500 group-hover:text-zinc-400 relative z-10 leading-tight whitespace-pre-line">{subtext}</div>
    
    {/* Dynamic Power Preview */}
    {!disabled && predictedPower > 0 && (
      <div className="mt-2 w-full bg-black/40 rounded px-2 py-1 flex justify-between items-center border border-white/5">
        <span className="text-[9px] uppercase text-zinc-500 font-bold">Power</span>
        <span className="text-sm font-mono font-bold text-yellow-500">{predictedPower}</span>
      </div>
    )}

    {/* Mana Cost Indicator */}
    {manaCost > 0 && !disabled && (
        <div className="absolute top-0 right-0 bg-blue-900/80 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg border-l border-b border-blue-800 z-20">
            -{manaCost} Mana
        </div>
    )}
  </button>
);

const SpellButton = ({
    label,
    description,
    cost,
    icon,
    onClick,
    disabled,
    color = 'text-blue-400',
    borderColor = 'border-blue-800'
}: {
    label: string;
    description: string;
    cost: number;
    icon: React.ReactNode;
    onClick: () => void;
    disabled: boolean;
    color?: string;
    borderColor?: string;
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`
            relative flex flex-col items-start p-3 rounded-lg border transition-all w-full text-left
            ${disabled 
                ? 'bg-zinc-900/50 border-zinc-800 opacity-50 cursor-not-allowed' 
                : `bg-zinc-900/80 ${borderColor} hover:bg-zinc-800 hover:shadow-[0_0_15px_rgba(0,0,0,0.5)]`
            }
        `}
    >
        <div className="flex justify-between w-full mb-1">
            <div className={`font-bold flex items-center gap-2 ${disabled ? 'text-zinc-500' : color}`}>
                {icon}
                <span>{label}</span>
            </div>
            {cost > 0 && (
                <span className={`text-xs font-mono font-bold ${disabled ? 'text-zinc-600' : 'text-blue-300'}`}>
                    {cost} Mana
                </span>
            )}
        </div>
        <p className="text-[10px] text-zinc-500 leading-tight">{description}</p>
    </button>
);

const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ player, characterImage, selectedCards, onSelfAction, onLevelUp, onBuyItem, onMulligan, onDiscardHand, settings }) => {
  const [showShop, setShowShop] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showSpellbook, setShowSpellbook] = useState(false);

  const manaCost = Math.max(0, (selectedCards.length - 1) * settings.manaCostPerExtraCard);
  const canAfford = player.resources.mana >= manaCost;

  // Level Up Calculation
  const levelUpCost = player.stats.level * settings.xpLevelUpMult;
  const canLevelUp = player.resources.xp >= levelUpCost;

  // Alignment Colors
  const range = settings.alignmentMax - settings.alignmentMin;
  const alignmentPercent = ((player.alignment - settings.alignmentMin) / range) * 100;
  const isEvil = player.alignment <= settings.evilThreshold;
  const isGood = player.alignment >= settings.goodThreshold;

  // Time Warp Cost
  const timeWarpCost = player.extraTurnsBought + 1;

  // Helper to calculate total power for a self action to preview it
  const calculateSelfPower = (stat: StatAttribute, targetSuit: string) => {
    if (selectedCards.length === 0) return 0;
    const cardTotal = selectedCards.reduce((acc, c) => acc + c.value, 0);
    const statVal = player.stats[stat] + (player.activeBuffs[stat] || 0);
    const suitBonus = selectedCards.filter(c => c.suit === targetSuit).length * 2;
    return cardTotal + statVal + suitBonus;
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* 1. Character Header */}
      <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border-2 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)] overflow-hidden shrink-0 relative">
             {characterImage ? (
               <img src={characterImage} alt={player.class} className="w-full h-full object-cover" />
             ) : (
               <User className="text-indigo-300" />
             )}
             <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-2xl text-white tracking-tight truncate">{player.class}</h2>
            <div className="flex items-center gap-2">
                <p className="text-xs text-zinc-500 font-medium whitespace-nowrap">Level {player.stats.level}</p>
                
                <button
                    onClick={() => onLevelUp('PLAYER_LEVEL')}
                    disabled={!canLevelUp}
                    className={`
                        text-[9px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 transition-all whitespace-nowrap
                        ${canLevelUp 
                            ? 'bg-purple-900/50 text-purple-300 border-purple-500 hover:bg-purple-800 hover:shadow-[0_0_10px_rgba(168,85,247,0.4)]' 
                            : 'bg-zinc-900 text-zinc-600 border-zinc-800 opacity-50 cursor-not-allowed'}
                    `}
                    title={`Cost: ${levelUpCost} XP. Benefit: +2 Max HP & Full Heal.`}
                >
                    <ArrowUpCircle size={10} />
                    <span>UP ({levelUpCost})</span>
                </button>
            </div>
          </div>
      </div>

      {/* 2. Stats & Alignment */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <StatRow 
            label="Might" 
            description="Adds to roll when Training (XP) or fighting in the Deep Dungeon."
            value={player.stats.might} 
            buff={player.activeBuffs.might} 
            icon={<Shield size={14} />} 
            statKey="might" 
            xp={player.resources.xp} 
            onLevelUp={onLevelUp} 
            baseCost={settings.xpBaseCost} 
          />
          <StatRow 
            label="Agility" 
            description="Adds to roll when Looting (Gold) or navigating the Capital City."
            value={player.stats.agility} 
            buff={player.activeBuffs.agility} 
            icon={<Zap size={14} />} 
            statKey="agility" 
            xp={player.resources.xp} 
            onLevelUp={onLevelUp} 
            baseCost={settings.xpBaseCost} 
          />
          <StatRow 
            label="Wisdom" 
            description="Adds to roll when Studying (Mana) or exploring the Mage Tower."
            value={player.stats.wisdom} 
            buff={player.activeBuffs.wisdom} 
            icon={<Scroll size={14} />} 
            statKey="wisdom" 
            xp={player.resources.xp} 
            onLevelUp={onLevelUp} 
            baseCost={settings.xpBaseCost} 
          />
          <StatRow 
            label="Spirit" 
            description="Adds to roll when Resting (Health) or traversing the Whispering Forest."
            value={player.stats.spirit} 
            buff={player.activeBuffs.spirit} 
            icon={<Brain size={14} />} 
            statKey="spirit" 
            xp={player.resources.xp} 
            onLevelUp={onLevelUp} 
            baseCost={settings.xpBaseCost} 
          />
        </div>

        {/* Alignment Meter */}
        <div className="bg-zinc-900/30 p-2 rounded border border-zinc-800/50">
            <div className="flex justify-between text-[9px] font-bold uppercase mb-1">
                <span className={player.alignment < 0 ? "text-red-500" : "text-zinc-600"}>Vice</span>
                <span className="text-zinc-400">Alignment</span>
                <span className={player.alignment > 0 ? "text-indigo-400" : "text-zinc-600"}>Virtue</span>
            </div>
            <div className="h-2 bg-zinc-950 rounded-full border border-zinc-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/50 via-zinc-900 to-indigo-900/50" />
                <div className="absolute top-0 bottom-0 w-px bg-red-500/30" style={{ left: `${((settings.evilThreshold - settings.alignmentMin) / range) * 100}%` }} />
                <div className="absolute top-0 bottom-0 w-px bg-indigo-500/30" style={{ left: `${((settings.goodThreshold - settings.alignmentMin) / range) * 100}%` }} />
                <div 
                    className="absolute top-0 bottom-0 w-1.5 bg-white rounded-full shadow-[0_0_10px_white] transition-all duration-500"
                    style={{ left: `calc(${alignmentPercent}% - 3px)` }}
                />
            </div>
            {(isEvil || isGood) && (
                <div className="flex justify-between text-[9px] text-zinc-500 mt-1 font-mono">
                    <span>{isEvil ? "Dark Pact Active" : ""}</span>
                    <span>{isGood ? "Divine Favor Active" : ""}</span>
                </div>
            )}
        </div>
      </div>

      {/* 3. Resources */}
      <div className="grid grid-cols-4 gap-2">
           {[
               { label: 'HP', val: player.resources.health, max: player.resources.maxHealth, icon: <Heart className="w-4 h-4" />, color: 'text-red-500' },
               { label: 'Gold', val: player.resources.gold, icon: <Coins className="w-4 h-4" />, color: 'text-yellow-500' },
               { label: 'Mana', val: player.resources.mana, icon: <Sparkles className="w-4 h-4" />, color: 'text-blue-400' },
               { label: 'XP', val: player.resources.xp, icon: <Star className="w-4 h-4" />, color: 'text-purple-400' },
           ].map((r, i) => (
             <div key={i} className="bg-zinc-900/50 p-2 rounded border border-zinc-800 flex flex-col items-center">
                 <span className={`text-[10px] uppercase font-bold mb-1 opacity-70`}>{r.label}</span>
                 <div className={`flex items-center gap-1 font-black text-lg ${r.color}`}>
                     {r.icon}
                     <span>{r.val}</span>
                 </div>
                 {r.max && <span className="text-[10px] text-zinc-600">/{r.max}</span>}
             </div>
           ))}
      </div>

      {/* 4. Tools (Shop / Quest / Spellbook) */}
      <div className="flex gap-2">
             {[
               { id: 'shop', icon: <ShoppingBag size={14} />, label: 'Shop', active: showShop, set: setShowShop },
               { id: 'quests', icon: <ScrollText size={14} />, label: 'Quests', active: showQuests, set: setShowQuests },
               { id: 'spells', icon: <Book size={14} />, label: 'Spells', active: showSpellbook, set: setShowSpellbook },
             ].map((tool) => (
                 <button 
                    key={tool.id}
                    onClick={() => { 
                        playSFX('click'); 
                        tool.set(!tool.active);
                        if(tool.id !== 'shop') setShowShop(false);
                        if(tool.id !== 'quests') setShowQuests(false);
                        if(tool.id !== 'spells') setShowSpellbook(false);
                    }}
                    className={`flex-1 py-2 px-2 rounded border flex items-center justify-center gap-2 transition-all font-bold uppercase text-[10px] tracking-wider
                        ${tool.active 
                            ? 'bg-zinc-800 border-zinc-600 text-zinc-200' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}
                    `}
                 >
                    {tool.icon} {tool.label}
                 </button>
             ))}
      </div>

      {/* Tool Overlays */}
      {showShop && (
            <div className="grid grid-cols-1 gap-2 bg-zinc-950 p-3 rounded border border-yellow-900/30">
                 {[
                     { name: "Potion", cost: 5, desc: "+3 HP", action: () => onBuyItem("Potion", 5, undefined, 3) },
                     { name: "Whetstone", cost: 3, desc: "+2 Might (1 Rd)", action: () => onBuyItem("Whetstone", 3, 'might', 2) },
                     { name: "Boots", cost: 3, desc: "+2 Agility (1 Rd)", action: () => onBuyItem("Boots", 3, 'agility', 2) },
                     { name: "Scroll", cost: 3, desc: "+2 Wisdom (1 Rd)", action: () => onBuyItem("Scroll", 3, 'wisdom', 2) },
                     { name: "Charm", cost: 3, desc: "+2 Spirit (1 Rd)", action: () => onBuyItem("Charm", 3, 'spirit', 2) },
                 ].map((item) => (
                     <button
                        key={item.name}
                        onClick={item.action}
                        disabled={player.resources.gold < item.cost}
                        className={`p-2 rounded border text-left flex justify-between items-center transition-all
                            ${player.resources.gold < item.cost 
                                ? 'bg-zinc-900 border-zinc-800 opacity-50' 
                                : 'bg-zinc-800 border-zinc-700 hover:border-yellow-500 hover:bg-zinc-750'}
                        `}
                     >
                         <div className="flex flex-col">
                            <span className="font-bold text-xs text-zinc-200">{item.name}</span>
                            <span className="text-[10px] text-zinc-500">{item.desc}</span>
                         </div>
                         <span className="text-xs text-yellow-500 font-mono">{item.cost}g</span>
                     </button>
                 ))}
            </div>
      )}

      {showQuests && <QuestLog player={player} />}

      {showSpellbook && (
            <div className="grid grid-cols-1 gap-2 bg-zinc-950 p-3 rounded border border-blue-900/30">
                <SpellButton
                    label="Transmute"
                    description="Discard 1 card to draw new."
                    cost={1}
                    icon={<RefreshCw size={14} />}
                    onClick={onMulligan}
                    disabled={selectedCards.length !== 1 || player.resources.mana < 1}
                    borderColor="border-blue-800"
                />
                <SpellButton
                    label="Discard Hand"
                    description="Redraw full hand."
                    cost={1}
                    icon={<Trash2 size={14} />}
                    onClick={onDiscardHand}
                    disabled={player.resources.mana < 1}
                    color="text-red-400"
                    borderColor="border-red-800"
                />
                <SpellButton
                    label="Dark Pact"
                    description="Gain 5 Mana, -3 Align."
                    cost={0}
                    icon={<Skull size={14} />}
                    onClick={() => onSelfAction('dark_pact')}
                    disabled={false}
                    color="text-red-500"
                    borderColor="border-red-900"
                />
                <SpellButton
                    label="Purify"
                    description="Heal 3 HP, +2 Align."
                    cost={2}
                    icon={<Sun size={14} />}
                    onClick={() => onSelfAction('purify')}
                    disabled={player.resources.mana < 2}
                    color="text-indigo-400"
                    borderColor="border-indigo-800"
                />
                <SpellButton
                    label="Time Warp"
                    description="Buy extra action."
                    cost={timeWarpCost}
                    icon={<Clock size={14} />}
                    onClick={() => onSelfAction('time_warp')}
                    disabled={player.resources.mana < timeWarpCost}
                    color="text-purple-400"
                    borderColor="border-purple-800"
                />
            </div>
      )}

      {/* 5. Self Actions */}
      <div className="bg-black/20 rounded-lg p-3 border border-zinc-800/50">
            <h3 className="text-[10px] font-bold text-zinc-500 mb-2 flex justify-between uppercase tracking-widest">
               <span>Self Actions</span>
               {selectedCards.length > 0 && canAfford && (
                   <span className="text-blue-400">-{manaCost} Mana</span>
               )}
            </h3>
            <div className="grid grid-cols-2 gap-2">
               <ActionButton 
                  label="REST" 
                  subtext="Heal (Spirit)" 
                  icon={<Heart size={20} className="text-red-500" />}
                  suit={getSuitSymbol('hearts')}
                  disabled={selectedCards.length === 0 || !canAfford}
                  onClick={() => onSelfAction('rest')}
                  manaCost={manaCost}
                  predictedPower={calculateSelfPower('spirit', 'hearts')}
                  tooltip={`Rest: Heal HP based on Spirit + Cards.`}
               />
               <ActionButton 
                  label="TRAIN" 
                  subtext="Gain XP (Might)" 
                  icon={<Shield size={20} className="text-slate-400" />}
                  suit={getSuitSymbol('clubs')}
                  disabled={selectedCards.length === 0 || !canAfford}
                  onClick={() => onSelfAction('train')}
                  manaCost={manaCost}
                  predictedPower={calculateSelfPower('might', 'clubs')}
                  tooltip={`Train: Gain XP based on Might + Cards.`}
               />
               <ActionButton 
                  label="LOOT" 
                  subtext="Gold (Agility)" 
                  icon={<Coins size={20} className="text-yellow-500" />}
                  suit={getSuitSymbol('spades')}
                  disabled={selectedCards.length === 0 || !canAfford}
                  onClick={() => onSelfAction('loot')}
                  manaCost={manaCost}
                  predictedPower={calculateSelfPower('agility', 'spades')}
                  tooltip={`Loot: Find Gold based on Agility + Cards.`}
               />
               <ActionButton 
                  label="STUDY" 
                  subtext="Mana (Wisdom)" 
                  icon={<Sparkles size={20} className="text-blue-400" />}
                  suit={getSuitSymbol('diamonds')}
                  disabled={selectedCards.length === 0 || !canAfford}
                  onClick={() => onSelfAction('study')}
                  manaCost={manaCost}
                  predictedPower={calculateSelfPower('wisdom', 'diamonds')}
                  tooltip={`Study: Gain Mana based on Wisdom + Cards.`}
               />
            </div>
      </div>

      {/* 6. Scoring Summary (Footer of sidebar) */}
      <div className="mt-auto space-y-2 pt-4 border-t border-zinc-800/50">
          <ScoreTrack label="Explore" value={player.scoring.explore} icon={<MapIcon size={12} />} color="text-emerald-500" />
          <ScoreTrack label="Champion" value={player.scoring.champion} icon={<Crosshair size={12} />} color="text-red-500" />
          <ScoreTrack label="Fortune" value={player.scoring.fortune} icon={<Gem size={12} />} color="text-yellow-500" />
          <ScoreTrack label="Soul" value={player.scoring.soul} icon={<Sparkles size={12} />} color="text-blue-500" />
      </div>

    </div>
  );
};

export default PlayerDashboard;
