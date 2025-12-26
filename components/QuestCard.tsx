
import React from 'react';
import { Quest } from '../types';
import { Language, translations } from '../translations';

interface QuestCardProps {
  quest: Quest;
  language: Language;
  onClick: () => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, language, onClick }) => {
  const t = translations[language];
  const completedSteps = quest.steps.filter(s => s.isCompleted).length;
  const progress = (completedSteps / quest.steps.length) * 100;

  const isDueToday = () => {
    const end = new Date(quest.endDate);
    const today = new Date();
    return end.getDate() === today.getDate() &&
           end.getMonth() === today.getMonth() &&
           end.getFullYear() === today.getFullYear();
  };

  const dueToday = isDueToday();

  const difficultyColor = {
    'Easy': 'text-green-400',
    'Medium': 'text-yellow-400',
    'Hard': 'text-red-400'
  }[quest.difficulty];

  // Enhanced highlight logic
  let highlightClasses = 'border-slate-700';
  if (quest.status === 'active' && dueToday) {
    highlightClasses = 'border-orange-500 ring-2 ring-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.3)]';
  } else if (quest.status === 'abandoned') {
    highlightClasses = 'border-red-900/50 opacity-60 grayscale-[0.5]';
  } else if (quest.status === 'completed') {
    highlightClasses = 'border-green-500/30';
  }

  return (
    <div 
      onClick={onClick}
      className={`quest-card rounded-xl p-4 cursor-pointer hover:border-slate-500 transition-all active:scale-[0.98] group relative overflow-hidden border-2 ${highlightClasses}`}
    >
      {dueToday && quest.status === 'active' && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-orange-500 text-[9px] font-black px-3 py-1 rounded-bl-lg text-white shadow-lg animate-subtle-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            {t.dueToday.toUpperCase()}
          </div>
        </div>
      )}

      {quest.status === 'abandoned' && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-red-600/80 text-[9px] font-black px-3 py-1 rounded-bl-lg text-white">
            {t.abandoned.toUpperCase()}
          </div>
        </div>
      )}

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

      <div className="space-y-3">
        <div className="flex justify-between text-[10px] font-bold">
          <span className="text-slate-400 uppercase tracking-widest">{t.progress}</span>
          <span className={quest.status === 'abandoned' ? 'text-red-400' : 'text-yellow-500'}>
            {Math.round(progress)}%
          </span>
        </div>
        
        {/* Segmented RPG Progress Bar */}
        <div className="relative h-2.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
          {/* Progress Fill */}
          <div 
            className={`h-full transition-all duration-700 ease-out relative ${
              quest.status === 'abandoned' 
                ? 'bg-red-900/80' 
                : 'bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]'
            }`}
            style={{ width: `${progress}%` }}
          >
             {quest.status !== 'abandoned' && (
               <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
             )}
          </div>

          {/* Step Segment Dividers */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: quest.steps.length }).map((_, i) => (
              <div 
                key={i} 
                className="flex-1 border-r border-slate-950/40 last:border-r-0"
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase pt-1">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            {completedSteps}/{quest.steps.length} {t.tasks}
          </span>
          <span className="text-slate-400 tracking-wider">+{quest.xp} XP</span>
        </div>
      </div>
    </div>
  );
};

export default QuestCard;
