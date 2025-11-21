
import React, { useState } from 'react';
import { HighScore } from '../types';
import { Trophy, Crown, Skull, ChevronDown, ChevronUp, Activity, Swords, CheckCircle2, XCircle } from 'lucide-react';

interface ScoreboardProps {
  scores: HighScore[];
  onClose?: () => void;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ scores, onClose }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-zinc-900/95 border border-zinc-700 rounded-xl p-6 max-w-3xl w-full shadow-2xl flex flex-col max-h-[85vh]">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Trophy className="text-yellow-500 w-6 h-6" />
          <h2 className="text-2xl font-bold text-white">Hall of Fame</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            Close
          </button>
        )}
      </div>

      <div className="space-y-3 overflow-y-auto scrollbar-thin pr-2 flex-1">
        {scores.length === 0 ? (
            <div className="text-center text-zinc-500 py-8 italic">No legends recorded yet.</div>
        ) : (
            scores.map((score, index) => (
            <div key={score.id} className="flex flex-col">
                <div 
                    onClick={() => toggleExpand(score.id)}
                    className={`
                        flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all
                        ${index === 0 ? 'bg-yellow-900/20 border-yellow-600/50 hover:bg-yellow-900/30' : 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800'}
                        ${expandedId === score.id ? 'rounded-b-none border-b-0 bg-zinc-800' : ''}
                    `}
                >
                    <div className="flex items-center gap-4">
                        <div className={`font-mono font-bold w-8 text-center flex-shrink-0 ${index === 0 ? 'text-yellow-500 text-xl' : 'text-zinc-500'}`}>
                            {index === 0 ? <Crown size={20} className="mx-auto" /> : index + 1}
                        </div>
                        <div>
                            <div className="font-bold text-white flex items-center gap-2">
                                {score.playerName}
                                {score.outcome === 'Defeat' && <Skull size={14} className="text-red-500" />}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ml-2 uppercase tracking-wider
                                    ${score.difficulty === 'Hard' ? 'border-red-500 text-red-400 bg-red-950/30' : 
                                      score.difficulty === 'Easy' ? 'border-green-500 text-green-400 bg-green-950/30' :
                                      'border-zinc-600 text-zinc-400 bg-zinc-900'}
                                `}>
                                    {score.difficulty || 'Normal'}
                                </span>
                            </div>
                            <div className="text-xs text-zinc-400 flex gap-2">
                                <span>{score.characterClass}</span>
                                <span>•</span>
                                <span>{new Date(score.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="font-mono text-xl font-bold text-yellow-500">{score.score}</div>
                            <div className="text-[10px] text-zinc-600 flex gap-1 justify-end">
                                <span className="text-red-900/80" title="Champion">{score.stats.champion}C</span>
                                <span className="text-green-900/80" title="Explore">{score.stats.explore}E</span>
                                <span className="text-yellow-900/80" title="Fortune">{score.stats.fortune}F</span>
                                <span className="text-blue-900/80" title="Spirit">{score.stats.spirit}S</span>
                            </div>
                        </div>
                        <div className="text-zinc-500">
                            {expandedId === score.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                    </div>
                </div>

                {/* Expanded History View */}
                {expandedId === score.id && (
                    <div className="bg-black/40 border border-t-0 border-zinc-700 rounded-b-lg p-4 animate-in slide-in-from-top-2">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Activity size={14} /> Adventure Log
                        </h4>
                        
                        <div className="space-y-1">
                            {/* Header */}
                            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-zinc-600 uppercase mb-2 px-2">
                                <div className="col-span-2">Time</div>
                                <div className="col-span-3">Action</div>
                                <div className="col-span-2 text-center">Vs</div>
                                <div className="col-span-5">Outcome</div>
                            </div>

                            {(!score.history || score.history.length === 0) ? (
                                <div className="text-center text-zinc-600 text-sm py-4">No detailed history available.</div>
                            ) : (
                                score.history.map((turn, i) => (
                                    <div key={i} className="grid grid-cols-12 gap-2 items-center text-xs p-2 rounded hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors">
                                        {/* Time */}
                                        <div className="col-span-2 font-mono text-zinc-500">
                                            R{turn.round}-T{turn.turn}
                                        </div>

                                        {/* Action */}
                                        <div className="col-span-3 font-bold text-zinc-300 truncate" title={turn.actionName}>
                                            {turn.actionName}
                                        </div>

                                        {/* Vs */}
                                        <div className="col-span-2 flex justify-center items-center gap-1 font-mono text-zinc-400">
                                            <span className={turn.playerTotal >= turn.dungeonTotal ? 'text-green-400' : 'text-red-400'}>
                                                {turn.playerTotal}
                                            </span>
                                            <span className="text-zinc-700 text-[10px]"><Swords size={10} /></span>
                                            <span className="text-zinc-500">{turn.dungeonTotal}</span>
                                        </div>

                                        {/* Outcome */}
                                        <div className="col-span-5 flex items-center gap-2 overflow-hidden">
                                            {turn.success ? 
                                                <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" /> : 
                                                <XCircle size={14} className="text-red-500 flex-shrink-0" />
                                            }
                                            <span className={`truncate ${turn.success ? 'text-zinc-300' : 'text-red-400/80'}`} title={turn.details}>
                                                {turn.details}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Scoreboard;
