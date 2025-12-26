
import React from 'react';
import { Quest } from '../types';

interface QuestCardProps {
  quest: Quest;
  onClick: () => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onClick }) => {
  const completedSteps = quest.steps.filter(s => s.isCompleted).length;
  const progress = (completedSteps / quest.steps.length) * 100;

  const difficultyColor = {
    'Easy': 'text-green-400',
    'Medium': 'text-yellow-400',
    'Hard': 'text-red-400'
  }[quest.difficulty];

  return (
    <div 
      onClick={onClick}
      className="quest-card rounded-xl p-4 cursor-pointer hover:border-slate-500 transition-all active:scale-[0.98] group"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{quest.category}</span>
          <h3 className="text-lg font-bold group-hover:text-yellow-400 transition-colors">{quest.title}</h3>
        </div>
        <div className={`text-[10px] font-bold border px-1.5 py-0.5 rounded ${difficultyColor} border-current`}>
          {quest.difficulty.toUpperCase()}
        </div>
      </div>

      <p className="text-slate-400 text-xs line-clamp-1 mb-4">{quest.description}</p>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold">
          <span className="text-slate-400">PROGRESS</span>
          <span className="text-yellow-500">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase pt-1">
          <span>{completedSteps}/{quest.steps.length} Tasks</span>
          <span>+{quest.xp} XP</span>
        </div>
      </div>
    </div>
  );
};

export default QuestCard;
