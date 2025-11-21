
import React, { useState } from 'react';
import { AdventureLocation, Card, NodeModifier } from '../types';
import { Map, Castle, Trees, Mountain, Tent, Sword, ShieldAlert, EyeOff, Minimize, Info, Gift } from 'lucide-react';
import { getSuitSymbol } from '../utils/deck';

interface AdventureBoardProps {
  locations: AdventureLocation[];
  selectedCards: Card[];
  playerMana: number;
  onLocationAction: (locationId: string) => void;
}

const LocationIcon = ({ id }: { id: string }) => {
  switch(id) {
    case 'forest': return <Trees className="w-5 h-5" />;
    case 'dungeon': return <Castle className="w-5 h-5" />;
    case 'tower': return <Mountain className="w-5 h-5" />;
    case 'city': return <Tent className="w-5 h-5" />;
    default: return <Map className="w-5 h-5" />;
  }
};

const ModifierIcon = ({ mod }: { mod: NodeModifier }) => {
    switch(mod.type) {
        case 'difficulty': return <ShieldAlert size={14} className="text-red-500" />;
        case 'suit_penalty': return <EyeOff size={14} className="text-purple-500" />;
        case 'max_cards': return <Minimize size={14} className="text-orange-500" />;
        default: return <Info size={14} className="text-zinc-500" />;
    }
};

const AdventureBoard: React.FC<AdventureBoardProps> = ({ locations, selectedCards, playerMana, onLocationAction }) => {
  const [activeTab, setActiveTab] = useState(locations[0].id);
  const currentLocation = locations.find(l => l.id === activeTab);

  const manaCost = Math.max(0, selectedCards.length - 1);
  const canAfford = playerMana >= manaCost;
  
  if (!currentLocation) return null;

  const nextNodeIndex = currentLocation.progress;
  const nextModifier = currentLocation.nodeModifiers[nextNodeIndex];
  const isBlocked = nextModifier?.type === 'max_cards' && selectedCards.length > nextModifier.value;

  return (
    <div className="mt-6 bg-zinc-950/80 backdrop-blur-md rounded-xl border border-zinc-800/50 overflow-hidden flex flex-col md:flex-row min-h-[380px] shadow-2xl">
      {/* Sidebar Tabs */}
      <div className="md:w-56 bg-black/40 border-r border-zinc-800/50 flex flex-row md:flex-col overflow-x-auto md:overflow-x-hidden scrollbar-thin">
        {locations.map(loc => (
          <button
            key={loc.id}
            onClick={() => setActiveTab(loc.id)}
            className={`
              flex items-center gap-3 px-4 py-4 text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal text-left relative
              ${activeTab === loc.id ? 'bg-zinc-800/50 text-white border-l-4 border-yellow-500' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 border-l-4 border-transparent'}
            `}
          >
            <LocationIcon id={loc.id} />
            <div className="flex flex-col">
                <span className="font-bold tracking-tight">{loc.name}</span>
                <span className="text-[10px] text-zinc-600 uppercase">{loc.progress}/{loc.nodes} Nodes</span>
            </div>
            {loc.progress >= loc.nodes && <span className="absolute top-2 right-2 text-yellow-500">★</span>}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 flex flex-col relative">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
            <div>
                <h3 className="text-2xl font-black text-zinc-100 mb-1 flex items-center gap-2">
                    <LocationIcon id={currentLocation.id} />
                    {currentLocation.name}
                </h3>
                <p className="text-zinc-400 text-sm font-medium max-w-md">{currentLocation.description}</p>
            </div>
            
            {/* Active Modifier Panel */}
            {currentLocation.progress < currentLocation.nodes && (
                <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-700/50 w-full md:w-auto min-w-[200px]">
                    <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Next Challenge Modifiers</div>
                    {nextModifier ? (
                        <div className="flex items-start gap-2 text-sm">
                            <div className="mt-1"><ModifierIcon mod={nextModifier} /></div>
                            <div>
                                <div className="font-bold text-zinc-200">{nextModifier.name}</div>
                                <div className="text-xs text-zinc-400 leading-tight">{nextModifier.description}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs text-zinc-500 italic">No active modifiers.</div>
                    )}
                    
                    {/* Card Limit Warning */}
                    {isBlocked && (
                        <div className="mt-2 text-xs font-bold text-red-500 bg-red-900/20 px-2 py-1 rounded animate-pulse">
                            Cannot play more than {nextModifier?.value} cards!
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Specific Loot Description */}
        <div className="mb-6 bg-zinc-900/30 p-3 rounded border border-zinc-800/50 flex gap-3">
            <div className="p-2 bg-zinc-800 rounded text-yellow-500 h-fit"><Gift size={16} /></div>
            <div>
                <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Rewards</div>
                <div className="text-xs text-zinc-300 whitespace-pre-line font-mono leading-relaxed">
                    {currentLocation.lootDescription}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800/50">
                <span className="text-[10px] uppercase text-zinc-500 font-bold">Key Stat</span>
                <div className="text-zinc-200 font-bold capitalize">{currentLocation.statAttribute}</div>
             </div>
             <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800/50">
                 <span className="text-[10px] uppercase text-zinc-500 font-bold">Affinity</span>
                 <div className="text-zinc-200 font-bold flex items-center gap-2">
                     <span className="text-lg leading-none">{getSuitSymbol(currentLocation.preferredSuit)}</span>
                     <span className="capitalize">{currentLocation.preferredSuit}</span>
                 </div>
             </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end mb-6">
            <div className="flex flex-col items-end gap-1">
                <button
                    disabled={selectedCards.length === 0 || !canAfford || currentLocation.progress >= currentLocation.nodes || isBlocked}
                    onClick={() => onLocationAction(currentLocation.id)}
                    className={`
                        flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all shadow-lg border
                        ${selectedCards.length === 0 || !canAfford || isBlocked
                            ? 'bg-zinc-800/50 text-zinc-600 border-zinc-800 cursor-not-allowed'
                            : currentLocation.progress >= currentLocation.nodes
                                ? 'bg-green-900/20 text-green-400 border-green-900/50 cursor-default'
                                : 'bg-red-900/80 text-red-100 hover:bg-red-800 border-red-700 hover:scale-105 hover:shadow-red-900/50'
                        }
                    `}
                >
                {currentLocation.progress >= currentLocation.nodes ? (
                    <span>CLEARED</span>
                ) : (
                    <>
                        <Sword size={18} />
                        <span>EXPLORE</span>
                    </>
                )}
                </button>
                {manaCost > 0 && currentLocation.progress < currentLocation.nodes && (
                    <span className={`text-[10px] font-bold ${canAfford ? 'text-blue-400' : 'text-red-500'}`}>
                        Cost: {manaCost} Mana
                    </span>
                )}
            </div>
        </div>

        {/* Progress Track */}
        <div className="mt-auto">
            <div className="text-xs font-black text-zinc-600 uppercase mb-3 tracking-widest">Location Progress</div>
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-thin">
                {Array.from({ length: currentLocation.nodes }).map((_, idx) => {
                    const isCompleted = idx < currentLocation.progress;
                    const isNext = idx === currentLocation.progress;
                    const modifier = currentLocation.nodeModifiers[idx];
                    
                    return (
                    <React.Fragment key={idx}>
                        <div 
                            className={`
                                relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all font-mono text-sm group
                                ${isCompleted ? 'bg-green-500/10 border-green-500 text-green-500' : ''}
                                ${isNext ? 'bg-zinc-800 border-zinc-500 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' : ''}
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

                            {/* Tooltip */}
                            {modifier && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-40 bg-zinc-950 border border-zinc-700 p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
                                    <div className="text-[10px] font-bold text-white mb-0.5">{modifier.name}</div>
                                    <div className="text-[9px] text-zinc-400">{modifier.description}</div>
                                </div>
                            )}
                        </div>
                        {idx < currentLocation.nodes - 1 && (
                            <div className={`flex-shrink-0 w-6 h-1 ${isCompleted ? 'bg-green-900' : 'bg-zinc-800'}`} />
                        )}
                    </React.Fragment>
                    );
                })}
                
                {/* Goal */}
                <div className="w-6 h-1 bg-zinc-800" />
                <div className={`
                flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center border-2 rotate-45 ml-2 shadow-lg
                ${currentLocation.progress >= currentLocation.nodes ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500 shadow-yellow-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-700'}
                `}>
                    <div className="-rotate-45 font-bold text-xs">LOOT</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdventureBoard;
