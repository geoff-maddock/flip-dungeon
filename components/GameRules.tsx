
import React, { useState } from 'react';
import { X, Shield, Swords, Heart, Sparkles, HelpCircle, Book, User, Skull, Coins } from 'lucide-react';
import { getSuitSymbol } from '../utils/deck';
import { GameSettings } from '../types';

interface GameRulesProps {
  onClose: () => void;
  settings: GameSettings;
}

const GameRules: React.FC<GameRulesProps> = ({ onClose, settings }) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'stats' | 'combat' | 'alignment'>('basics');

  const TabButton = ({ id, label, icon }: { id: typeof activeTab; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 font-bold text-sm transition-all border-b-2 ${
        activeTab === id 
          ? 'border-yellow-500 text-yellow-500 bg-zinc-800/50' 
          : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Book className="text-yellow-500" />
            <h2 className="text-2xl font-bold text-white">Adventurer's Guide</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex border-b border-zinc-800 overflow-x-auto">
           <TabButton id="basics" label="Basics & Resources" icon={<HelpCircle size={16} />} />
           <TabButton id="combat" label="Actions & Combat" icon={<Swords size={16} />} />
           <TabButton id="stats" label="Stats & Classes" icon={<User size={16} />} />
           <TabButton id="alignment" label="Alignment & Fate" icon={<Skull size={16} />} />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
          
          {activeTab === 'basics' && (
            <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                <section>
                    <h3 className="text-xl font-bold text-zinc-200 mb-2">Objective</h3>
                    <p className="text-zinc-400">
                        Survive {settings.maxRounds} rounds of dungeon exploration, build your character, and achieve the highest score possible. 
                        The game ends if your Health reaches 0 or you complete all {settings.maxRounds} rounds.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-zinc-200 mb-2">Structure</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-zinc-800/50 p-4 rounded border border-zinc-700">
                            <div className="text-yellow-500 font-black text-lg mb-1">{settings.maxRounds} Rounds</div>
                            <p className="text-xs text-zinc-400">The game length. Locations get harder each round.</p>
                        </div>
                        <div className="bg-zinc-800/50 p-4 rounded border border-zinc-700">
                            <div className="text-blue-500 font-black text-lg mb-1">{settings.turnsPerRound} Turns</div>
                            <p className="text-xs text-zinc-400">Actions per round. At the end of a round, buffs clear.</p>
                        </div>
                        <div className="bg-zinc-800/50 p-4 rounded border border-zinc-700">
                            <div className="text-green-500 font-black text-lg mb-1">{settings.handSize} Cards</div>
                            <p className="text-xs text-zinc-400">Hand size. Refilled at the end of every turn.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-zinc-200 mb-2">Resources</h3>
                    <ul className="space-y-3">
                        <li className="flex gap-3">
                            <div className="bg-red-900/20 p-2 rounded h-fit"><Heart size={16} className="text-red-500" /></div>
                            <div>
                                <strong className="text-red-400">Health</strong>
                                <p className="text-sm text-zinc-400">Your life force. Starts at {settings.initialHealth}. If it hits 0, you lose. Taken as damage when you fail challenges.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <div className="bg-yellow-900/20 p-2 rounded h-fit"><Coins size={16} className="text-yellow-500" /></div>
                            <div>
                                <strong className="text-yellow-400">Gold</strong>
                                <p className="text-sm text-zinc-400">Used to purchase Items from the Merchant. Earned via Loot actions or Exploring.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <div className="bg-blue-900/20 p-2 rounded h-fit"><Sparkles size={16} className="text-blue-500" /></div>
                            <div>
                                <strong className="text-blue-400">Mana</strong>
                                <p className="text-sm text-zinc-400">Magical energy. Used to play more than 1 card per turn ({settings.manaCostPerExtraCard} Mana per extra card), reroll fate (2 Mana), or cast specific spells.</p>
                            </div>
                        </li>
                         <li className="flex gap-3">
                            <div className="bg-purple-900/20 p-2 rounded h-fit"><Shield size={16} className="text-purple-500" /></div>
                            <div>
                                <strong className="text-purple-400">XP (Experience)</strong>
                                <p className="text-sm text-zinc-400">Used to upgrade stats or Character Level. Costs increase as you grow stronger.</p>
                            </div>
                        </li>
                    </ul>
                </section>
            </div>
          )}

          {activeTab === 'combat' && (
            <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                <section>
                    <h3 className="text-xl font-bold text-zinc-200 mb-3">The Challenge Check</h3>
                    <p className="text-zinc-400 mb-4">
                        Every action (Self or Location) triggers a check against a random Dungeon Card.
                    </p>
                    <div className="bg-zinc-950 p-6 rounded-lg border border-zinc-800 text-center">
                        <div className="text-sm text-zinc-500 uppercase font-bold mb-2">Victory Formula</div>
                        <div className="text-2xl md:text-3xl font-black text-white font-mono bg-zinc-900 inline-block px-4 py-2 rounded border border-zinc-700">
                           (Cards + Stat + Suit Bonus) <span className="text-zinc-500">vs</span> Dungeon Value
                        </div>
                    </div>
                </section>

                <section>
                     <h3 className="text-xl font-bold text-zinc-200 mb-3">Playing Cards</h3>
                     <ul className="list-disc list-inside text-zinc-400 space-y-2">
                        <li>You can select 1 or more cards from your hand.</li>
                        <li><strong>Cost:</strong> The first card is free. Each additional card costs <strong>{settings.manaCostPerExtraCard} Mana</strong>.</li>
                        <li>The values of all selected cards are added together.</li>
                        <li>Face cards (J, Q, K) are worth 10. Ace is worth 1.</li>
                     </ul>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-zinc-200 mb-3">Bonuses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-900/10 border border-blue-800/50 p-4 rounded">
                            <strong className="text-blue-300 block mb-1">Suit Bonus (+2)</strong>
                            <p className="text-sm text-zinc-400">
                                If a played card's suit matches the action's affinity (e.g. Spades for Attack), it grants <strong>+2 Power</strong>.
                            </p>
                        </div>
                         <div className="bg-green-900/10 border border-green-800/50 p-4 rounded">
                            <strong className="text-green-300 block mb-1">Stat Bonus</strong>
                            <p className="text-sm text-zinc-400">
                                You always add your relevant Stat (Might, Agility, etc.) to the total.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-zinc-200 mb-3">Outcomes</h3>
                    <div className="space-y-3">
                        <div className="flex gap-4 items-start">
                            <div className="bg-green-500/20 text-green-500 font-bold px-3 py-1 rounded text-sm">SUCCESS</div>
                            <p className="text-sm text-zinc-400">
                                If your total is ≥ the Dungeon Card. You gain the reward. <br/>
                                <span className="text-zinc-500 italic">High margins (beating it by 4, 5, 8+) grant Critical Rewards.</span><br/>
                                <strong className="text-yellow-400 block mt-1">Double Move:</strong> If you beat an Adventure location by <strong>10 or more</strong>, you advance 2 spaces instead of 1!
                            </p>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="bg-red-500/20 text-red-500 font-bold px-3 py-1 rounded text-sm">FAILURE</div>
                            <p className="text-sm text-zinc-400">
                                If your total is &lt; the Dungeon Card. <br/>
                                <strong className="text-red-400">Damage Taken = (Difference) + (Cards Played)</strong>. <br/>
                                <span className="text-zinc-500 italic">Playing many cards is risky if you still fail!</span>
                            </p>
                        </div>
                    </div>
                </section>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                 <section>
                    <h3 className="text-xl font-bold text-zinc-200 mb-3">Character Stats</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded">
                            <div className="flex items-center gap-2 font-bold text-white mb-1"><Shield size={16} /> Might</div>
                            <p className="text-xs text-zinc-400">Used for <strong>Training</strong> (XP) and exploring the <strong>Dungeon</strong>.</p>
                        </div>
                        <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded">
                            <div className="flex items-center gap-2 font-bold text-white mb-1"><Sparkles size={16} /> Agility</div>
                            <p className="text-xs text-zinc-400">Used for <strong>Looting</strong> (Gold) and exploring the <strong>City</strong>.</p>
                        </div>
                        <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded">
                            <div className="flex items-center gap-2 font-bold text-white mb-1"><Book size={16} /> Wisdom</div>
                            <p className="text-xs text-zinc-400">Used for <strong>Studying</strong> (Mana) and exploring the <strong>Tower</strong>.</p>
                        </div>
                        <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded">
                            <div className="flex items-center gap-2 font-bold text-white mb-1"><Heart size={16} /> Spirit</div>
                            <p className="text-xs text-zinc-400">Used for <strong>Resting</strong> (Health) and exploring the <strong>Forest</strong>.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-zinc-200 mb-3">Upgrading</h3>
                    <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2">
                        <li>
                            <strong>Stats:</strong> Cost = Current Value + {settings.xpBaseCost} XP.
                        </li>
                        <li>
                            <strong>Player Level:</strong> Cost = Level × {settings.xpLevelUpMult} XP. <br/>
                            <span className="text-yellow-500 ml-4">Benefit: Increases Max HP by 2 and Fully Heals you.</span>
                        </li>
                    </ul>
                </section>
            </div>
          )}

          {activeTab === 'alignment' && (
            <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                 <section>
                    <h3 className="text-xl font-bold text-zinc-200 mb-3">Virtue & Vice</h3>
                    <p className="text-zinc-400 text-sm mb-4">
                        Your soul fluctuates between light and dark ({settings.alignmentMin} to {settings.alignmentMax}). 
                        Reaching thresholds unlocks passives but comes with consequences.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-red-900/10 border border-red-800/50 p-4 rounded-lg">
                            <h4 className="text-red-400 font-bold uppercase text-sm mb-2 flex items-center gap-2"><Skull size={16}/> Path of Vice</h4>
                            <div className="text-sm text-zinc-400 space-y-3">
                                <p><strong>Action: Dark Pact</strong><br/>Instantly gain 5 Mana, but shift -3 Alignment.</p>
                                <div className="bg-red-950/30 p-2 rounded border border-red-900/50">
                                    <strong className="text-red-300 text-xs">Threshold Effect ({settings.evilThreshold})</strong>
                                    <p className="text-xs mt-1">Your physical form decays. You <strong>lose 1 Health</strong> at the end of every turn.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-900/10 border border-indigo-800/50 p-4 rounded-lg">
                            <h4 className="text-indigo-400 font-bold uppercase text-sm mb-2 flex items-center gap-2"><Sparkles size={16}/> Path of Virtue</h4>
                            <div className="text-sm text-zinc-400 space-y-3">
                                <p><strong>Action: Purify</strong><br/>Spend 2 Mana to Heal 3 HP and shift +2 Alignment.</p>
                                <div className="bg-indigo-950/30 p-2 rounded border border-indigo-900/50">
                                    <strong className="text-indigo-300 text-xs">Threshold Effect ({settings.goodThreshold})</strong>
                                    <p className="text-xs mt-1">
                                        The world tests the righteous. <strong>Enemy Difficulty +1</strong>, but you gain <strong>+1 Soul Score</strong> on every success.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default GameRules;
