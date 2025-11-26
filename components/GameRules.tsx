
import React, { useState } from 'react';
import { X, Shield, Swords, Heart, Sparkles, HelpCircle, Book, User, Skull, Coins, Zap, ScrollText, Flame, Split } from 'lucide-react';
import { GameSettings } from '../types';

interface GameRulesProps {
  onClose: () => void;
  settings: GameSettings;
}

const GameRules: React.FC<GameRulesProps> = ({ onClose, settings }) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'combat' | 'classes' | 'alignment'>('basics');

  const TabButton = ({ id, label, icon }: { id: typeof activeTab; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${
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
        
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Book className="text-yellow-500" />
            <h2 className="text-2xl font-bold text-white">Adventurer's Guide</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex border-b border-zinc-800 overflow-x-auto flex-shrink-0">
           <TabButton id="basics" label="Basics & Spells" icon={<HelpCircle size={16} />} />
           <TabButton id="combat" label="Combos & Combat" icon={<Swords size={16} />} />
           <TabButton id="classes" label="Classes & Abilities" icon={<User size={16} />} />
           <TabButton id="alignment" label="Alignment & Fate" icon={<Skull size={16} />} />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin text-zinc-300">
          
          {activeTab === 'basics' && (
            <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                <section>
                    <h3 className="text-xl font-bold text-zinc-200 mb-2">Objective</h3>
                    <p className="text-zinc-400">
                        Survive {settings.maxRounds} rounds of dungeon exploration, build your party, and achieve high scores.
                        The game ends if your Health reaches 0 or you complete the final round.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-zinc-200 mb-2">Resources</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex gap-3 bg-zinc-800/30 p-3 rounded">
                            <div className="bg-red-900/20 p-2 rounded h-fit"><Heart size={16} className="text-red-500" /></div>
                            <div>
                                <strong className="text-red-400">Health (HP)</strong>
                                <p className="text-xs text-zinc-400">If this hits 0, you die. Restore via Resting, Potions, or Spells.</p>
                            </div>
                        </div>
                        <div className="flex gap-3 bg-zinc-800/30 p-3 rounded">
                            <div className="bg-blue-900/20 p-2 rounded h-fit"><Sparkles size={16} className="text-blue-500" /></div>
                            <div>
                                <strong className="text-blue-400">Mana</strong>
                                <p className="text-xs text-zinc-400">Used for Spells, Abilities, and playing extra cards.</p>
                            </div>
                        </div>
                        <div className="flex gap-3 bg-zinc-800/30 p-3 rounded">
                            <div className="bg-yellow-900/20 p-2 rounded h-fit"><Coins size={16} className="text-yellow-500" /></div>
                            <div>
                                <strong className="text-yellow-400">Gold</strong>
                                <p className="text-xs text-zinc-400">Buy Items from the Shop. Earned via Looting or City encounters.</p>
                            </div>
                        </div>
                        <div className="flex gap-3 bg-zinc-800/30 p-3 rounded">
                            <div className="bg-purple-900/20 p-2 rounded h-fit"><Zap size={16} className="text-purple-500" /></div>
                            <div>
                                <strong className="text-purple-400">XP</strong>
                                <p className="text-xs text-zinc-400">Upgrade Stats or Player Level. Leveling up heals you fully!</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-zinc-200 mb-2 flex items-center gap-2"><Book size={18}/> The Spellbook</h3>
                    <p className="text-sm text-zinc-400 mb-3">Mana allows you to manipulate the game rules via the Spellbook menu.</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <li className="bg-zinc-800/50 p-2 rounded border border-zinc-700">
                            <strong className="text-blue-300">Transmute (1 Mana)</strong>: Discard 1 selected card to draw a new one. Great for fixing broken combos.
                        </li>
                        <li className="bg-zinc-800/50 p-2 rounded border border-zinc-700">
                            <strong className="text-red-300">Discard Hand (1 Mana)</strong>: Dump your entire hand and redraw 5 cards.
                        </li>
                        <li className="bg-zinc-800/50 p-2 rounded border border-zinc-700">
                            <strong className="text-purple-300">Time Warp (Cost Scales)</strong>: Buy an extra turn for the current round. Costs 1, then 2, then 3 Mana, etc.
                        </li>
                         <li className="bg-zinc-800/50 p-2 rounded border border-zinc-700">
                            <strong className="text-indigo-300">Rewind Fate (2 Mana)</strong>: If you fail a test, re-draw the Dungeon Card to try again.
                        </li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-zinc-200 mb-2 flex items-center gap-2"><ScrollText size={18}/> Quests</h3>
                    <p className="text-sm text-zinc-400">
                        Every game generates 4 random Quests (e.g., "Grand Archmage" or "Untouchable"). 
                        Completing these grants massive bonus points at the end of the game. Check the Quest Log to see your progress!
                    </p>
                </section>
            </div>
          )}

          {activeTab === 'combat' && (
            <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                <section>
                     <h3 className="text-xl font-bold text-zinc-200 mb-3">The Power Check</h3>
                     <div className="bg-zinc-950 p-6 rounded-lg border border-zinc-800 text-center">
                        <div className="text-sm text-zinc-500 uppercase font-bold mb-2">Total Power Formula</div>
                        <div className="text-xl md:text-2xl font-black text-white font-mono bg-zinc-900 inline-block px-4 py-2 rounded border border-zinc-700">
                           (Cards × Combo) + Stat + Suit Bonus
                        </div>
                        <p className="text-xs text-zinc-500 mt-2">Vs Dungeon Card Value</p>
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-zinc-200 mb-3 text-purple-400">Card Synergies (Combos)</h3>
                    <p className="text-sm text-zinc-400 mb-4">
                        Playing multiple cards isn't just about adding their values. Form poker-style hands to multiply your power!
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-zinc-500 uppercase text-xs border-b border-zinc-700">
                                <tr>
                                    <th className="py-2">Combo</th>
                                    <th className="py-2">Example</th>
                                    <th className="py-2 text-right">Effect</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                <tr>
                                    <td className="py-2 font-bold text-zinc-300">Pair</td>
                                    <td className="py-2 text-zinc-500">5♥ 5♠</td>
                                    <td className="py-2 text-right font-mono text-purple-400">x1.5 Power</td>
                                </tr>
                                <tr>
                                    <td className="py-2 font-bold text-zinc-300">Two Pair</td>
                                    <td className="py-2 text-zinc-500">5♥ 5♠ 8♦ 8♣</td>
                                    <td className="py-2 text-right font-mono text-purple-400">x1.75 Power</td>
                                </tr>
                                <tr>
                                    <td className="py-2 font-bold text-zinc-300">Three of a Kind</td>
                                    <td className="py-2 text-zinc-500">7♥ 7♠ 7♦</td>
                                    <td className="py-2 text-right font-mono text-purple-400">x2.0 Power</td>
                                </tr>
                                <tr>
                                    <td className="py-2 font-bold text-zinc-300">Four of a Kind</td>
                                    <td className="py-2 text-zinc-500">9♥ 9♠ 9♦ 9♣</td>
                                    <td className="py-2 text-right font-mono text-purple-400">x2.5 Power</td>
                                </tr>
                                <tr>
                                    <td className="py-2 font-bold text-zinc-300">Flush (3+ Cards)</td>
                                    <td className="py-2 text-zinc-500">2♥ 5♥ 9♥</td>
                                    <td className="py-2 text-right font-mono text-purple-400">x1.25 Power</td>
                                </tr>
                                <tr>
                                    <td className="py-2 font-bold text-zinc-300">Straight (3+ Cards)</td>
                                    <td className="py-2 text-zinc-500">4♠ 5♥ 6♦</td>
                                    <td className="py-2 text-right font-mono text-yellow-500">+5 Flat Power</td>
                                </tr>
                                <tr>
                                    <td className="py-2 font-bold text-zinc-300">Suited Straight</td>
                                    <td className="py-2 text-zinc-500">4♥ 5♥ 6♥</td>
                                    <td className="py-2 text-right font-mono text-yellow-500">+10 Flat Power</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-zinc-200 mb-3 flex items-center gap-2"><Skull size={18} className="text-red-500"/> Elite Enemies</h3>
                    <p className="text-sm text-zinc-400 mb-2">Some encounters have special rules:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="bg-zinc-800/50 p-3 rounded border border-red-900/30">
                            <strong className="text-zinc-200">Armored</strong>
                            <p className="text-zinc-500 text-xs">You must deal at least 15 Total Power to deal ANY damage or succeed.</p>
                        </div>
                        <div className="bg-zinc-800/50 p-3 rounded border border-blue-900/30">
                            <strong className="text-zinc-200">Spectral / Anti-Magic</strong>
                            <p className="text-zinc-500 text-xs">Physical suits (Spades/Clubs) or Magic suits (Hearts/Diamonds) may be disabled completely.</p>
                        </div>
                        <div className="bg-zinc-800/50 p-3 rounded border border-orange-900/30">
                            <strong className="text-zinc-200">Volatile</strong>
                            <p className="text-zinc-500 text-xs">Failures deal Double Damage.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-zinc-200 mb-2 flex items-center gap-2"><Split size={18}/> Branching Paths</h3>
                    <p className="text-sm text-zinc-400">
                        Some locations offer a choice (e.g. "High Road" vs "Low Road"). 
                        The path you take is determined by the <strong>Suit of your first played card</strong>.
                        Red cards (Hearts/Diamonds) take the Red path; Black cards take the Black path.
                    </p>
                </section>
            </div>
          )}

          {activeTab === 'classes' && (
            <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                 <section>
                    <h3 className="text-xl font-bold text-zinc-200 mb-3 flex items-center gap-2"><Flame size={18} className="text-orange-500"/> Heroic Abilities</h3>
                    <p className="text-sm text-zinc-400 mb-4">
                        Each class has a unique active ability with a Mana cost and a Cooldown (measured in turns). Use them wisely!
                    </p>
                    
                    <div className="space-y-3">
                        <div className="flex gap-4 p-3 bg-zinc-800/30 rounded border border-zinc-700/50">
                            <div className="font-bold text-zinc-200 w-24 flex-shrink-0">Druid</div>
                            <div>
                                <div className="text-orange-300 font-bold text-sm">Regrowth</div>
                                <p className="text-xs text-zinc-400">Heal 4 HP immediately. (Cost: 2 Mana, CD: 3)</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-3 bg-zinc-800/30 rounded border border-zinc-700/50">
                            <div className="font-bold text-zinc-200 w-24 flex-shrink-0">Ranger</div>
                            <div>
                                <div className="text-orange-300 font-bold text-sm">Bullseye</div>
                                <p className="text-xs text-zinc-400">Next action is an Automatic Critical Success. (Cost: 3 Mana, CD: 4)</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-3 bg-zinc-800/30 rounded border border-zinc-700/50">
                            <div className="font-bold text-zinc-200 w-24 flex-shrink-0">Paladin</div>
                            <div>
                                <div className="text-orange-300 font-bold text-sm">Divine Shield</div>
                                <p className="text-xs text-zinc-400">Prevent all damage from the next failed test. (Cost: 2 Mana, CD: 3)</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-3 bg-zinc-800/30 rounded border border-zinc-700/50">
                            <div className="font-bold text-zinc-200 w-24 flex-shrink-0">Alchemist</div>
                            <div>
                                <div className="text-orange-300 font-bold text-sm">Elixir of Insight</div>
                                <p className="text-xs text-zinc-400">Instantly gain 3 Mana and 3 XP. (Cost: 0 Mana, CD: 4)</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-3 bg-zinc-800/30 rounded border border-zinc-700/50">
                            <div className="font-bold text-zinc-200 w-24 flex-shrink-0">Necromancer</div>
                            <div>
                                <div className="text-orange-300 font-bold text-sm">Soul Harvest</div>
                                <p className="text-xs text-zinc-400">Discard hand & draw 5. Spades drawn grant Gold. (Cost: 2 Mana, CD: 4)</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-3 bg-zinc-800/30 rounded border border-zinc-700/50">
                            <div className="font-bold text-zinc-200 w-24 flex-shrink-0">Bard</div>
                            <div>
                                <div className="text-orange-300 font-bold text-sm">Encore</div>
                                <p className="text-xs text-zinc-400">Next action costs 0 Mana to play multiple cards. (Cost: 1 Mana, CD: 3)</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-zinc-200 mb-3">Stats Overview</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-zinc-800/50 p-2 rounded"><strong className="text-white">Might:</strong> XP Training & Dungeons.</div>
                        <div className="bg-zinc-800/50 p-2 rounded"><strong className="text-white">Agility:</strong> Gold Looting & Cities.</div>
                        <div className="bg-zinc-800/50 p-2 rounded"><strong className="text-white">Wisdom:</strong> Mana Studying & Towers.</div>
                        <div className="bg-zinc-800/50 p-2 rounded"><strong className="text-white">Spirit:</strong> Health Resting & Forests.</div>
                    </div>
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
