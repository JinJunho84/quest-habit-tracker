
import React from 'react';
import { Quest } from '../types';

interface QuestDetailsProps {
  quest: Quest;
  onClose: () => void;
  onToggleStep: (questId: string, stepId: string) => void;
}

const QuestDetails: React.FC<QuestDetailsProps> = ({ quest, onClose, onToggleStep }) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50">
        <button onClick={onClose} className="p-2 -ml-2 text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quest Journal</span>
        <div className="w-6"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        <div>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">{quest.category}</span>
          <h1 className="text-3xl font-black text-white mt-1 leading-tight">{quest.title}</h1>
          <p className="text-slate-400 mt-4 leading-relaxed">{quest.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Rewards</div>
            <div className="text-yellow-500 font-black">+{quest.xp} XP</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Deadline</div>
            <div className="text-slate-200 font-black">{formatDate(quest.endDate)}</div>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Stepwise Objectives</h2>
          <div className="space-y-4">
            {quest.steps.map((step, idx) => (
              <div 
                key={step.id}
                onClick={() => quest.status !== 'completed' && onToggleStep(quest.id, step.id)}
                className={`flex gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  step.isCompleted 
                    ? 'bg-slate-900 border-indigo-900/50 opacity-60' 
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className={`mt-0.5 w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  step.isCompleted ? 'bg-indigo-600 border-indigo-600' : 'border-slate-600'
                }`}>
                  {step.isCompleted && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold leading-tight ${step.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {step.title}
                    </h3>
                  </div>
                  <p className={`text-xs mt-1 leading-normal ${step.isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                    {step.description}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {step.durationMinutes}M
                    </span>
                    <span className="flex items-center gap-1">
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                       {formatDate(step.scheduledAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      
      {quest.status === 'completed' && (
        <div className="p-6 bg-slate-900 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="text-center">
            <div className="text-yellow-400 text-3xl mb-2 font-black pixel-font">QUEST COMPLETE</div>
            <p className="text-slate-400 text-sm mb-4">You have mastered this objective.</p>
            <button 
                onClick={onClose}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all"
            >
              COLLECT REWARDS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestDetails;
