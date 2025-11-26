
import React from 'react';
import { PlayerState, Quest } from '../types';
import { getCriteriaProgress } from '../utils/quests';
import { CheckCircle2, Circle } from 'lucide-react';

interface QuestLogProps {
  player: PlayerState;
}

const QuestCard: React.FC<{ quest: Quest; player: PlayerState }> = ({ quest, player }) => {
  return (
    <div className={`
      p-3 rounded-lg border flex flex-col gap-2 transition-all
      ${quest.isCompleted 
        ? 'bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
        : 'bg-zinc-900 border-zinc-700'}
    `}>
      <div className="flex justify-between items-start">
        <h4 className={`font-bold text-sm ${quest.isCompleted ? 'text-emerald-400' : 'text-zinc-200'}`}>
          {quest.name}
        </h4>
        {quest.isCompleted ? (
          <CheckCircle2 size={16} className="text-emerald-500" />
        ) : (
          <span className="text-xs font-mono text-yellow-500">+{quest.bonusPoints} pts</span>
        )}
      </div>
      
      <p className="text-[10px] text-zinc-500">{quest.description}</p>

      <div className="space-y-2 mt-1">
        {quest.criteria.map((crit, idx) => {
           const current = getCriteriaProgress(player, crit);
           let progressPercent = 0;
           
           // Handle negative alignment targets differently
           if (crit.type === 'alignment' && crit.target < 0) {
                // E.g. Target -8. Current -2. Progress: 2/8 (25%). Current -8. Progress 100%.
                const absTarget = Math.abs(crit.target);
                const absCurrent = current < 0 ? Math.abs(current) : 0;
                progressPercent = Math.min(100, (absCurrent / absTarget) * 100);
           } else {
                progressPercent = Math.min(100, (current / crit.target) * 100);
           }

           const isMet = progressPercent >= 100;

           return (
             <div key={idx} className="space-y-0.5">
               <div className="flex justify-between text-[9px] font-medium uppercase text-zinc-400">
                  <span>{crit.description}</span>
                  <span>{isMet ? 'Done' : `${current}/${crit.target}`}</span>
               </div>
               <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                 <div 
                    className={`h-full transition-all duration-500 ${isMet ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                    style={{ width: `${progressPercent}%` }}
                 />
               </div>
             </div>
           );
        })}
      </div>
    </div>
  );
};

const QuestLog: React.FC<QuestLogProps> = ({ player }) => {
  return (
    <div className="bg-zinc-950 p-4 rounded-lg border border-yellow-900/30 animate-in slide-in-from-top-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {player.quests.map(quest => (
                <QuestCard key={quest.id} quest={quest} player={player} />
            ))}
        </div>
    </div>
  );
};

export default QuestLog;
