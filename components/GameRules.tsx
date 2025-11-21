
import React from 'react';
import { X, Shield, Swords, Heart, Sparkles, HelpCircle } from 'lucide-react';
import { getSuitSymbol } from '../utils/deck';

interface GameRulesProps {
  onClose: () => void;
}

const GameRules: React.FC<GameRulesProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="text-yellow-500" />
            <h2 className="text-2xl font-bold text-white">Adventurer's Guide</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
          
          {/* Section 1: Core Mechanic */}
          <section>
            <h3 className="text-xl font-bold text-zinc-200 mb-3 border-l-4 border-yellow-500 pl-3">How to Play</h3>
            <p className="text-zinc-400 mb-4">
              Flip Dungeon is a game of risk management. Each turn, you select cards from your hand to overcome a random 
              <strong> Dungeon Card</strong>.
            </p>
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 text-sm space-y-2">
              <div className="font-mono text-yellow-400 text-center font-bold text-lg mb-2">
                (Card Sum + Stat + Suit Bonus) vs Dungeon Value
              </div>
              <p className="text-center text-zinc-500">If your total is higher, you succeed. If lower, you take damage.</p>
            </div>
          </section>

          {/* Section 2: Suits & Bonuses */}
          <section>
            <h3 className="text-xl font-bold text-zinc-200 mb-3 border-l-4 border-blue-500 pl-3">Card Suits & Bonuses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-800/50 p-3 rounded">
                <div className="flex items-center gap-2 text-red-500 font-bold mb-1">
                   <span>{getSuitSymbol('hearts')} Hearts</span>
                   <span className="text-xs text-zinc-500 font-normal uppercase ml-auto">Healing</span>
                </div>
                <p className="text-xs text-zinc-400">Used for <strong>Rest</strong> actions. Boosts Spirit.</p>
              </div>
              <div className="bg-zinc-800/50 p-3 rounded">
                <div className="flex items-center gap-2 text-blue-400 font-bold mb-1">
                   <span>{getSuitSymbol('diamonds')} Diamonds</span>
                   <span className="text-xs text-zinc-500 font-normal uppercase ml-auto">Magic</span>
                </div>
                <p className="text-xs text-zinc-400">Used for <strong>Study</strong> (Mana) and Tower exploration. Boosts Wisdom.</p>
              </div>
              <div className="bg-zinc-800/50 p-3 rounded">
                <div className="flex items-center gap-2 text-slate-300 font-bold mb-1">
                   <span>{getSuitSymbol('clubs')} Clubs</span>
                   <span className="text-xs text-zinc-500 font-normal uppercase ml-auto">Defense</span>
                </div>
                <p className="text-xs text-zinc-400">Used for <strong>Train</strong> (XP) and Forest exploration. Boosts Might.</p>
              </div>
              <div className="bg-zinc-800/50 p-3 rounded">
                <div className="flex items-center gap-2 text-zinc-100 font-bold mb-1">
                   <span>{getSuitSymbol('spades')} Spades</span>
                   <span className="text-xs text-zinc-500 font-normal uppercase ml-auto">Offense</span>
                </div>
                <p className="text-xs text-zinc-400">Used for <strong>Loot</strong> (Gold) and Dungeon exploration. Boosts Agility.</p>
              </div>
            </div>
            <div className="mt-4 bg-blue-900/20 p-3 rounded border border-blue-800 text-sm text-blue-200">
              <strong>Suit Match Bonus:</strong> If you use a card that matches the action's affinity (e.g., Spades for Dungeon), 
              you get <strong>+2 Power</strong> for that card!
            </div>
          </section>

          {/* Section 3: Margin of Success */}
          <section>
            <h3 className="text-xl font-bold text-zinc-200 mb-3 border-l-4 border-green-500 pl-3">Margin of Success</h3>
            <p className="text-zinc-400 text-sm mb-2">
              Winning barely is good, but winning big is better. The difference between your score and the dungeon card is your <strong>Margin</strong>.
            </p>
            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1 ml-2">
              <li><span className="text-white font-bold">Rest:</span> Heal more HP for every 5 margin.</li>
              <li><span className="text-white font-bold">Loot:</span> Find more Gold for every 4 margin.</li>
              <li><span className="text-white font-bold">Study:</span> Gain more Mana for every 4 margin.</li>
              <li><span className="text-white font-bold">Train:</span> Gain more XP for every 8 margin.</li>
              <li><span className="text-white font-bold">Explore:</span> High margin (5+ or 10+) grants Bonus Gold/XP.</li>
            </ul>
          </section>

           {/* Section 4: Leveling */}
           <section>
            <h3 className="text-xl font-bold text-zinc-200 mb-3 border-l-4 border-purple-500 pl-3">Leveling Up</h3>
            <p className="text-zinc-400 text-sm mb-2">
               Experience Points (XP) can be used to upgrade specific stats (Might, Agility, etc.) OR to increase your character's Level.
            </p>
            <div className="bg-purple-900/20 p-3 rounded border border-purple-800 flex items-center gap-4">
                <div className="bg-purple-900/50 p-2 rounded">
                    <div className="text-[10px] uppercase font-bold text-purple-300">Level Up Benefit</div>
                    <div className="font-bold text-white">+2 Max Health</div>
                    <div className="font-bold text-white">Full HP Restore</div>
                </div>
                <div className="text-sm text-purple-200">
                    Cost = Current Level × 5 XP. <br/>
                    <span className="text-xs opacity-70">Use the button next to your Class Level to upgrade.</span>
                </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default GameRules;
