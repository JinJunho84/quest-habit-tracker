
import React, { useState } from 'react';
import { Quest, QuestStep } from '../types';
import { Language, translations } from '../translations';

interface QuestDetailsProps {
  quest: Quest;
  language: Language;
  onClose: () => void;
  onToggleStep: (questId: string, stepId: string) => void;
  onAbandon: () => void;
}

const QuestDetails: React.FC<QuestDetailsProps> = ({ quest, language, onClose, onToggleStep, onAbandon }) => {
  const t = translations[language];
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStepClick = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const isStepOverdue = (step: QuestStep) => {
    return !step.isCompleted && new Date(step.scheduledAt) < new Date();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50">
        <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.questJournal}</span>
        <div className="w-6"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-32">
        <div className={quest.status === 'abandoned' ? 'opacity-50 grayscale' : ''}>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">{quest.category}</span>
          <h1 className="text-3xl font-black text-white mt-1 leading-tight">{quest.title}</h1>
          <p className="text-slate-400 mt-4 leading-relaxed">{quest.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-inner">
            <div className="text-[10px] font-bold text-slate-500 uppercase">{t.rewards}</div>
            <div className={`font-black ${quest.status === 'abandoned' ? 'text-slate-500' : 'text-yellow-500'}`}>
              +{quest.xp} XP
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-inner">
            <div className="text-[10px] font-bold text-slate-500 uppercase">{t.deadline}</div>
            <div className="text-slate-200 font-black">{formatDate(quest.endDate)}</div>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">{t.stepwiseObjectives}</h2>
            <span className="text-[10px] text-slate-600 font-bold">{quest.steps.filter(s => s.isCompleted).length} / {quest.steps.length} {t.tasks}</span>
          </div>
          
          <div className="space-y-4">
            {quest.steps.map((step) => {
              const isExpanded = expandedStep === step.id;
              const overdue = isStepOverdue(step);
              
              return (
                <div 
                  key={step.id}
                  className={`relative flex flex-col rounded-xl border transition-all duration-500 overflow-hidden ${
                    step.isCompleted 
                      ? 'bg-green-950/10 border-green-900/40 shadow-[inset_0_0_20px_rgba(22,163,74,0.05)]' 
                      : overdue
                        ? 'bg-orange-950/20 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/20'
                        : 'bg-slate-800/40 border-slate-700 hover:border-slate-500 shadow-lg shadow-black/20'
                  }`}
                >
                  {/* "CLEARED" STAMP OVERLAY */}
                  {step.isCompleted && (
                    <div className="absolute -top-1 -right-4 rotate-12 z-20 animate-in zoom-in-150 duration-300">
                      <div className="border-2 border-green-500/60 bg-green-500/10 text-green-500 px-4 py-0.5 rounded text-[8px] font-black tracking-widest uppercase shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                        {t.cleared}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 p-4 items-start relative z-10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (quest.status === 'active') onToggleStep(quest.id, step.id);
                      }}
                      disabled={quest.status !== 'active'}
                      className={`mt-0.5 w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all active:scale-75 ${
                        step.isCompleted 
                          ? 'bg-green-600 border-green-500 shadow-[0_0_15px_rgba(22,163,74,0.5)] animate-subtle-pulse' 
                          : overdue
                            ? 'bg-orange-600 border-orange-500 animate-pulse'
                            : 'border-slate-600 hover:border-indigo-500 bg-slate-900/50'
                      }`}
                    >
                      {step.isCompleted ? (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <div className={`w-1.5 h-1.5 rounded-full ${overdue ? 'bg-white' : 'bg-slate-700 group-hover:bg-indigo-500'}`}></div>
                      )}
                    </button>

                    <div className="flex-1 cursor-pointer" onClick={() => handleStepClick(step.id)}>
                      <div className="flex justify-between items-start">
                        <h3 className={`font-bold leading-tight transition-all duration-500 ${step.isCompleted ? 'text-green-500/60 line-through' : overdue ? 'text-orange-400' : 'text-slate-100'}`}>
                          {step.title}
                          {overdue && !step.isCompleted && <span className="ml-2 text-[8px] px-1 bg-red-500 text-white rounded uppercase tracking-tighter font-black animate-pulse">{language === 'ko' ? '긴급' : 'URGENT'}</span>}
                        </h3>
                        <svg className={`w-4 h-4 text-slate-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <p className={`text-xs mt-1 leading-normal line-clamp-2 transition-all duration-500 ${step.isCompleted ? 'text-slate-700' : overdue ? 'text-orange-800/80 font-medium' : 'text-slate-400'}`}>
                        {step.description}
                      </p>
                      
                      <div className="mt-3 flex items-center gap-4 text-[9px] font-black tracking-wider transition-colors duration-500">
                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${step.isCompleted ? 'bg-green-950/20 text-green-900/60' : 'bg-slate-900/50 text-slate-500'}`}>
                          <svg className={`w-3 h-3 ${step.isCompleted ? 'text-green-700' : 'text-indigo-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {step.durationMinutes}M
                        </span>
                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${step.isCompleted ? 'bg-green-950/20 text-green-900/60' : overdue ? 'bg-orange-500/20 text-orange-500' : 'bg-slate-900/50 text-slate-500'}`}>
                           <svg className={`w-3 h-3 ${step.isCompleted ? 'text-green-700' : overdue ? 'text-orange-500' : 'text-indigo-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                           {formatDate(step.scheduledAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 animate-in fade-in slide-in-from-top-2 duration-300 relative z-10 space-y-4">
                      {/* Normal Recommendation */}
                      <div className={`rounded-xl p-3 border transition-colors duration-500 ${step.isCompleted ? 'bg-green-950/10 border-green-900/20' : 'bg-slate-900/80 border-slate-700/50'}`}>
                        <div className={`flex items-center gap-2 mb-2 text-[9px] font-black uppercase tracking-widest ${step.isCompleted ? 'text-green-700' : 'text-indigo-400'}`}>
                          <span className="text-base">{step.isCompleted ? '✅' : '💡'}</span>
                          {t.masterTip}
                        </div>
                        <p className={`text-xs leading-relaxed italic border-l-2 pl-3 transition-colors duration-500 ${step.isCompleted ? 'text-green-800/60 border-green-800/40' : 'text-slate-300 border-indigo-500'}`}>
                          {step.recommendation}
                        </p>
                      </div>

                      {/* Overdue Tactical Re-assessment */}
                      {step.overdueStrategy && !step.isCompleted && (
                        <div className="rounded-xl p-4 border border-orange-500/40 bg-orange-950/30 relative overflow-hidden shadow-lg shadow-orange-500/10 animate-pulse-slow">
                           <div className="absolute top-0 right-0 p-2 opacity-10">
                              <svg className="w-12 h-12 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/></svg>
                           </div>
                           <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-orange-400 uppercase tracking-widest">
                            <span className="text-lg">⚔️</span>
                            {t.tacticalAdvice}
                          </div>
                          <p className="text-xs text-orange-100 leading-relaxed font-bold pl-1">
                            {step.overdueStrategy}
                          </p>
                        </div>
                      )}

                      {/* Explicit Action Button for the Author */}
                      {!step.isCompleted && quest.status === 'active' && (
                         <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleStep(quest.id, step.id);
                            }}
                            className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${
                                overdue 
                                ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-500/30 ring-1 ring-orange-400' 
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                            }`}
                         >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            {language === 'ko' ? '목표 달성 완료' : 'Complete Objective'}
                         </button>
                      )}
                    </div>
                  )}

                  {step.isCompleted && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-green-500 shadow-[2px_0_10px_rgba(34,197,94,0.4)]"></div>
                  )}
                  {overdue && !step.isCompleted && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 shadow-[2px_0_10px_rgba(249,115,22,0.4)]"></div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {quest.status === 'active' && (
          <div className="pt-8">
            <button 
              onClick={onAbandon}
              className="w-full bg-slate-900 border border-red-900/30 text-red-500/80 hover:text-red-400 font-bold py-3 rounded-xl transition-all uppercase text-xs tracking-widest active:scale-95"
            >
              {t.abandonQuest}
            </button>
          </div>
        )}
      </div>
      
      {quest.status === 'completed' && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-slate-900 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-5 duration-500 z-50">
          <div className="text-center">
            <div className="text-yellow-400 text-3xl mb-2 font-black pixel-font uppercase">{t.questComplete}</div>
            <p className="text-slate-400 text-sm mb-4">{t.masteredObjective}</p>
            <button 
                onClick={onClose}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/30 uppercase"
            >
              {t.collectRewards}
            </button>
          </div>
        </div>
      )}

      {quest.status === 'abandoned' && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-slate-900 border-t border-slate-800 z-50">
          <div className="text-center">
            <div className="text-red-500 text-3xl mb-2 font-black pixel-font uppercase">{t.abandoned}</div>
            <p className="text-slate-400 text-sm mb-4 italic">"Every failure is a step toward success."</p>
            <button 
                onClick={onClose}
                className="w-full bg-slate-800 text-slate-400 font-bold py-3 rounded-xl transition-all uppercase"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestDetails;
