import React from 'react';
import { Card } from '../types';
import { getSuitSymbol } from '../utils/deck';
import { Shield, Sword, Heart, Sparkles } from 'lucide-react';

interface PlayingCardProps {
  card: Card;
  selected?: boolean;
  selectionIndex?: number; // Added to show order
  onClick?: () => void;
}

const PlayingCard: React.FC<PlayingCardProps> = ({ card, selected, selectionIndex, onClick }) => {
  const colorClass = ['hearts', 'diamonds'].includes(card.suit) ? 'text-red-500' : 'text-zinc-800';
  const symbol = getSuitSymbol(card.suit);

  const getActionIcon = () => {
    switch(card.suit) {
        case 'clubs': return <Shield className="w-4 h-4 text-slate-500" />;
        case 'spades': return <Sword className="w-4 h-4 text-zinc-700" />;
        case 'hearts': return <Heart className="w-4 h-4 text-red-500" />;
        case 'diamonds': return <Sparkles className="w-4 h-4 text-blue-500" />;
    }
  };

  const getActionText = () => {
    switch(card.suit) {
        case 'clubs': return 'DEFEND / BUILD';
        case 'spades': return 'ATTACK / MOVE';
        case 'hearts': return 'HEAL / CHARM';
        case 'diamonds': return 'MAGIC / WEALTH';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`
        relative w-28 h-44 lg:w-32 lg:h-48 rounded-xl transition-all duration-300 transform
        ${selected 
            ? 'bg-zinc-100 ring-4 ring-yellow-500/80 shadow-[0_0_20px_rgba(234,179,8,0.3)] scale-105 -translate-y-4 z-10' 
            : 'bg-zinc-200 hover:bg-white hover:scale-105 hover:-translate-y-2 hover:shadow-xl z-0'
        }
        flex flex-col justify-between p-2.5 select-none border border-zinc-300
        group
      `}
    >
      {selected && selectionIndex !== undefined && (
        <div className="absolute -top-3 -right-3 w-7 h-7 bg-yellow-500 text-black font-bold rounded-full flex items-center justify-center shadow-md z-20 border-2 border-white">
            {selectionIndex + 1}
        </div>
      )}

      {/* Top Left */}
      <div className={`text-2xl font-black leading-none ${colorClass} flex flex-col items-center w-6`}>
        <span>{card.rank}</span>
        <span className="text-xl">{symbol}</span>
      </div>

      {/* Center Graphic */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
         <span className={`text-6xl ${colorClass} scale-150 transform rotate-12`}>{symbol}</span>
      </div>
      
      <div className="flex flex-col items-center justify-center space-y-1 z-10">
         {getActionIcon()}
         <span className="text-[9px] font-bold text-zinc-500 text-center leading-tight tracking-tighter">{getActionText()}</span>
      </div>

      {/* Bottom Right (Rotated) */}
      <div className={`text-2xl font-black leading-none ${colorClass} flex flex-col items-center w-6 self-end transform rotate-180`}>
        <span>{card.rank}</span>
        <span className="text-xl">{symbol}</span>
      </div>
    </div>
  );
};

export default PlayingCard;