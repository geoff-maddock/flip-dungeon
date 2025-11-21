
import React, { useState } from 'react';
import { PlayerState, Card, StatAttribute } from '../types';
import { Heart, Coins, Star, Sparkles, User, Shield, Zap, Scroll, Brain, Trophy, Map as MapIcon, Crosshair, Gem, ArrowUpCircle, ShoppingBag, RefreshCw, Skull, Sun } from 'lucide-react';
import { getSuitSymbol } from '../utils/deck';
import { EVIL_THRESHOLD, GOOD_THRESHOLD, MIN_ALIGNMENT, MAX_ALIGNMENT } from '../constants';
import { playSFX } from '../utils/sound';

interface PlayerDashboardProps {
  player: PlayerState;
  selectedCards: Card[];
  onSelfAction: (actionType: 'rest' | 'train' | 'loot' | 'study' | 'dark_pact' | 'purify') => void;
  onLevelUp: (stat: StatAttribute | 'PLAYER_LEVEL') => void;
  onBuyItem: (item: string, cost: number, statBuff?: StatAttribute, amount?: number) => void;
  onMulligan: () => void;
}

const StatRow = ({ 
  label, 
  value, 
  icon, 
  statKey, 
  xp, 
  onLevelUp,
  buff 
}: { 
  label: string; 
  value: number; 
  icon: React.ReactNode; 
  statKey: StatAttribute;
  xp: number;
  onLevelUp: (s: StatAttribute) => void;
  buff?: number;
}) => {
  const cost = value + 1;
  const canUpgrade = xp >= cost && statKey !== 'level';

  return (
    <div className="flex items-center justify-between bg-zinc-900/50 p-2 rounded border border-zinc-800 relative group hover:border-zinc-700 transition-colors">
      <div className="flex items-center gap-2 text-zinc-400 text-xs md:text-sm font-medium">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
         {buff ? <span className="text-xs font-bold text-green-400 animate-pulse">+{buff}</span> : null}
         <span className={`font-mono text-lg font-bold ${buff ? 'text-green-400' : 'text-zinc-100'}`}>
            {value + (buff || 0)}
         </span>
         {canUpgrade && (
            <button 
              onClick={() => { playSFX('click'); onLevelUp(statKey); }}
              className="ml-2 p-1 bg-zinc-800 hover:bg-green-900/50 text-green-500 hover:text-green-400 rounded transition-colors border border-transparent hover:border-green-800"
              title={`Upgrade ${label} for ${cost} XP`}
            >
               <ArrowUpCircle size={14} />
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
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
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
  variant = 'neutral'
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
    <div className="flex items-center justify-between w-full mb-1 relative z-10">
      <div className={`flex items-center gap-2 font-black ${variant === 'evil' ? 'text-red-400' : variant === 'good' ? 'text-indigo-300' : 'text-zinc-200'} group-hover:text-white`}>
        {icon}
        <span>{label}</span>
      </div>
      {suit && <span className="text-xs font-mono opacity-50">{suit}</span>}
    </div>
    <div className="text-xs text-zinc-500 group-hover:text-zinc-400 relative z-10 leading-tight">{subtext}</div>
    
    {/* Mana Cost Indicator */}
    {manaCost > 0 && !disabled && (
        <div className="absolute top-0 right-0 bg-blue-900/80 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg border-l border-b border-blue-800">
            -{manaCost} Mana
        </div>
    )}
  </button>
);

const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ player, selectedCards, onSelfAction, onLevelUp, onBuyItem, onMulligan }) => {
  const [showShop, setShowShop] = useState(false);
  const manaCost = Math.max(0, selectedCards.length - 1);
  const canAfford = player.resources.mana >= manaCost;

  // Level Up Calculation
  const levelUpCost = player.stats.level * 5;
  const canLevelUp = player.resources.xp >= levelUpCost;

  // Alignment Colors
  const alignmentPercent = ((player.alignment - MIN_ALIGNMENT) / (MAX_ALIGNMENT - MIN_ALIGNMENT)) * 100;
  const isEvil = player.alignment <= EVIL_THRESHOLD;
  const isGood = player.alignment >= GOOD_THRESHOLD;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-zinc-950/80 backdrop-blur-md p-4 md:p-6 rounded-xl shadow-2xl border border-zinc-800/50">
      
      {/* Left: Character Stats */}
      <div className="lg:col-span-3 space-y-4 border-r border-zinc-800/50 pr-0 lg:pr-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-indigo-950 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
             <User className="text-indigo-300" />
          </div>
          <div className="flex-1">
            <h2 className="font-black text-xl text-white tracking-tight">{player.class}</h2>
            <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500 font-medium">Lvl {player.stats.level}</p>
                
                <button
                    onClick={() => onLevelUp('PLAYER_LEVEL')}
                    disabled={!canLevelUp}
                    className={`
                        text-[9px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 transition-all
                        ${canLevelUp 
                            ? 'bg-purple-900/50 text-purple-300 border-purple-500 hover:bg-purple-800 hover:shadow-[0_0_10px_rgba(168,85,247,0.4)]' 
                            : 'bg-zinc-900 text-zinc-600 border-zinc-800 opacity-50 cursor-not-allowed'}
                    `}
                    title={`Cost: ${levelUpCost} XP. Benefit: +2 Max HP & Full Heal.`}
                >
                    <ArrowUpCircle size={10} />
                    <span>UP ({levelUpCost} XP)</span>
                </button>
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <StatRow label="Might" value={player.stats.might} buff={player.activeBuffs.might} icon={<Shield size={14} />} statKey="might" xp={player.resources.xp} onLevelUp={onLevelUp} />
          <StatRow label="Agility" value={player.stats.agility} buff={player.activeBuffs.agility} icon={<Zap size={14} />} statKey="agility" xp={player.resources.xp} onLevelUp={onLevelUp} />
          <StatRow label="Wisdom" value={player.stats.wisdom} buff={player.activeBuffs.wisdom} icon={<Scroll size={14} />} statKey="wisdom" xp={player.resources.xp} onLevelUp={onLevelUp} />
          <StatRow label="Spirit" value={player.stats.spirit} buff={player.activeBuffs.spirit} icon={<Brain size={14} />} statKey="spirit" xp={player.resources.xp} onLevelUp={onLevelUp} />
        </div>

        {/* Alignment Meter */}
        <div className="pt-4 border-t border-zinc-800/50">
            <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                <span className={player.alignment < 0 ? "text-red-500" : "text-zinc-600"}>Vice</span>
                <span className="text-zinc-400">Alignment</span>
                <span className={player.alignment > 0 ? "text-indigo-400" : "text-zinc-600"}>Virtue</span>
            </div>
            <div className="h-3 bg-zinc-900 rounded-full border border-zinc-800 relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/50 via-zinc-900 to-indigo-900/50" />
                
                {/* Threshold Markers */}
                <div className="absolute left-1/4 top-0 bottom-0 w-px bg-red-500/30" title="Evil Threshold" />
                <div className="absolute right-1/4 top-0 bottom-0 w-px bg-indigo-500/30" title="Good Threshold" />
                
                {/* Indicator */}
                <div 
                    className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_10px_white] transition-all duration-500"
                    style={{ left: `calc(${alignmentPercent}% - 4px)` }}
                />
            </div>
            <div className="flex justify-between text-[9px] text-zinc-600 mt-1 font-mono">
                <span>{isEvil ? "Dark Pact Active (-1 HP/Turn)" : ""}</span>
                <span>{isGood ? "Divine Favor Active (+Diff / +Score)" : ""}</span>
            </div>
        </div>

        <div className="pt-4 border-t border-zinc-800/50 space-y-3">
          <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Scoring</h3>
          <ScoreTrack label="Explore" value={player.scoring.explore} icon={<MapIcon size={12} />} color="text-emerald-500" />
          <ScoreTrack label="Champion" value={player.scoring.champion} icon={<Crosshair size={12} />} color="text-red-500" />
          <ScoreTrack label="Fortune" value={player.scoring.fortune} icon={<Gem size={12} />} color="text-yellow-500" />
          <ScoreTrack label="Spirit" value={player.scoring.spirit} icon={<Sparkles size={12} />} color="text-blue-500" />
        </div>
      </div>

      {/* Right: Actions & Resources */}
      <div className="lg:col-span-9 flex flex-col gap-6">
        
        {/* Resources Top Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 flex flex-col items-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors" />
              <span className="text-[10px] text-zinc-500 uppercase font-bold mb-1 relative z-10">Health</span>
              <div className="flex items-center gap-2 text-red-500 font-black text-xl relative z-10">
                 <Heart className="fill-current w-5 h-5" />
                 <span>{player.resources.health}<span className="text-zinc-700 text-sm">/{player.resources.maxHealth}</span></span>
              </div>
           </div>
           <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 flex flex-col items-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors" />
              <span className="text-[10px] text-zinc-500 uppercase font-bold mb-1 relative z-10">Gold</span>
              <div className="flex items-center gap-2 text-yellow-500 font-black text-xl relative z-10">
                 <Coins className="fill-current w-5 h-5" />
                 <span>{player.resources.gold}</span>
              </div>
           </div>
           <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 flex flex-col items-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
              <span className="text-[10px] text-zinc-500 uppercase font-bold mb-1 relative z-10">Mana</span>
              <div className="flex items-center gap-2 text-blue-400 font-black text-xl relative z-10">
                 <Sparkles className="fill-current w-5 h-5" />
                 <span>{player.resources.mana}</span>
              </div>
           </div>
           <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 flex flex-col items-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />
              <span className="text-[10px] text-zinc-500 uppercase font-bold mb-1 relative z-10">XP</span>
              <div className="flex items-center gap-2 text-purple-400 font-black text-xl relative z-10">
                 <Star className="fill-current w-5 h-5" />
                 <span>{player.resources.xp}</span>
              </div>
           </div>
        </div>

        {/* Middle Tools: Shop & Mana Actions */}
        <div className="flex gap-4">
             <button 
                onClick={() => { playSFX('click'); setShowShop(!showShop); }}
                className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-all font-bold uppercase text-xs tracking-wider
                    ${showShop ? 'bg-yellow-900/20 border-yellow-600 text-yellow-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'}
                `}
             >
                <ShoppingBag size={16} />
                {showShop ? 'Close Shop' : 'Merchant'}
             </button>

             <button 
                onClick={onMulligan}
                disabled={selectedCards.length !== 1 || player.resources.mana < 1}
                className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-all font-bold uppercase text-xs tracking-wider
                    ${selectedCards.length !== 1 || player.resources.mana < 1
                         ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed' 
                         : 'bg-blue-900/20 border-blue-800 text-blue-400 hover:bg-blue-900/40'}
                `}
                title="Spend 1 Mana to discard 1 selected card and draw a new one"
             >
                <RefreshCw size={16} />
                Transmute (1 Mana)
             </button>
        </div>

        {/* Shop Overlay Area */}
        {showShop && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-950 p-4 rounded-lg border border-yellow-900/30 animate-in slide-in-from-top-2">
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
                        className={`p-2 rounded border text-left flex flex-col transition-all
                            ${player.resources.gold < item.cost 
                                ? 'bg-zinc-900 border-zinc-800 opacity-50' 
                                : 'bg-zinc-800 border-zinc-700 hover:border-yellow-500 hover:bg-zinc-750'}
                        `}
                     >
                         <div className="flex justify-between items-center mb-1">
                             <span className="font-bold text-sm text-zinc-200">{item.name}</span>
                             <span className="text-xs text-yellow-500 font-mono">{item.cost}g</span>
                         </div>
                         <span className="text-[10px] text-zinc-500">{item.desc}</span>
                     </button>
                 ))}
            </div>
        )}

        {/* Action Selection Area */}
        <div className="bg-black/40 rounded-lg border border-zinc-800/50 p-4 flex-1 flex flex-col justify-center shadow-inner">
            <h3 className="text-xs font-bold text-zinc-500 mb-3 flex justify-between uppercase tracking-widest">
               <span>Self Actions</span>
               {selectedCards.length > 0 ? (
                 canAfford ? (
                   <span className="text-yellow-500 animate-pulse">
                     Cost: {manaCost} Mana {selectedCards.length > 1 ? '(Multi-cast)' : ''}
                   </span>
                 ) : (
                    <span className="text-red-500">Not enough Mana ({manaCost} needed)</span>
                 )
               ) : (
                  <span className="text-zinc-700">Select cards from hand for basic actions</span>
               )}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
               <ActionButton 
                  label="REST" 
                  subtext="Heal HP (Spirit)" 
                  icon={<Heart size={16} className="text-red-500" />}
                  suit={getSuitSymbol('hearts')}
                  disabled={selectedCards.length === 0 || !canAfford}
                  onClick={() => onSelfAction('rest')}
                  manaCost={manaCost}
                  tooltip="Base: 2 HP. +1 per 5 Margin."
               />
               <ActionButton 
                  label="TRAIN" 
                  subtext="Gain XP (Might)" 
                  icon={<Shield size={16} className="text-slate-400" />}
                  suit={getSuitSymbol('clubs')}
                  disabled={selectedCards.length === 0 || !canAfford}
                  onClick={() => onSelfAction('train')}
                  manaCost={manaCost}
                   tooltip="Base: 1 XP. +1 per 8 Margin."
               />
               <ActionButton 
                  label="LOOT" 
                  subtext="Get Gold (Agility)" 
                  icon={<Coins size={16} className="text-yellow-500" />}
                  suit={getSuitSymbol('spades')}
                  disabled={selectedCards.length === 0 || !canAfford}
                  onClick={() => onSelfAction('loot')}
                  manaCost={manaCost}
                   tooltip="Base: 1 Gold. +1 per 4 Margin."
               />
               <ActionButton 
                  label="STUDY" 
                  subtext="Get Mana (Wisdom)" 
                  icon={<Sparkles size={16} className="text-blue-400" />}
                  suit={getSuitSymbol('diamonds')}
                  disabled={selectedCards.length === 0 || !canAfford}
                  onClick={() => onSelfAction('study')}
                  manaCost={manaCost}
                   tooltip="Base: 1 Mana. +1 per 4 Margin."
               />
            </div>
            
            {/* Alignment Actions */}
            <div className="grid grid-cols-2 gap-3 border-t border-zinc-800/50 pt-4">
                <ActionButton
                    label="DARK PACT"
                    subtext="Gain 5 Mana, Shift Evil"
                    icon={<Skull size={16} />}
                    suit={undefined}
                    disabled={false} // Always available
                    onClick={() => onSelfAction('dark_pact')}
                    manaCost={0}
                    tooltip="Sacrifice goodness for power. Alignment -3."
                    variant="evil"
                />
                <ActionButton
                    label="PURIFY"
                    subtext="Heal 3 HP, Shift Good"
                    icon={<Sun size={16} />}
                    suit={undefined}
                    disabled={player.resources.mana < 2}
                    onClick={() => onSelfAction('purify')}
                    manaCost={2}
                    tooltip="Spend 2 Mana to cleanse the soul. Alignment +2."
                    variant="good"
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;
