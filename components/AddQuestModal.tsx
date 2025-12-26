
import React, { useState } from 'react';
import { Language, translations } from '../translations';

interface AddQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: string, totalMinutes: number, category: string) => void;
  loading: boolean;
  language: Language;
  existingCategories: string[];
}

const AddQuestModal: React.FC<AddQuestModalProps> = ({ isOpen, onClose, onSubmit, loading, language, existingCategories }) => {
  const [goal, setGoal] = useState('');
  const [category, setCategory] = useState('');
  const [mode, setMode] = useState<'quick' | 'epic'>('epic');
  const [quickMinutes, setQuickMinutes] = useState(60);
  const [sagaDays, setSagaDays] = useState(7);
  
  const t = translations[language];

  const quickOptions = [
    { label: language === 'ko' ? '30분' : '30m', value: 30 },
    { label: language === 'ko' ? '1시간' : '1h', value: 60 },
    { label: language === 'ko' ? '3시간' : '3h', value: 180 },
    { label: language === 'ko' ? '6시간' : '6h', value: 360 },
    { label: language === 'ko' ? '12시간' : '12h', value: 720 },
  ];

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!goal) return;
    const finalMinutes = mode === 'quick' ? quickMinutes : sagaDays * 1440;
    onSubmit(goal, finalMinutes, category);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 p-6 relative animate-in slide-in-from-bottom-10 duration-500 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
        <h2 className="text-xl font-bold mb-4 pixel-font text-yellow-400 uppercase tracking-tighter">{t.summonQuest}</h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">{t.primaryObjective}</label>
            <textarea
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all min-h-[100px] text-sm"
              placeholder={t.placeholderGoal}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">{t.category}</label>
            <input
              list="categories"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all text-sm"
              placeholder={t.categoryPlaceholder}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <datalist id="categories">
              {existingCategories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.durationMode}</label>
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button 
                  onClick={() => setMode('quick')}
                  className={`px-3 py-1.5 text-[9px] font-black rounded-md transition-all ${mode === 'quick' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
                >
                  {t.quickKick.toUpperCase()}
                </button>
                <button 
                  onClick={() => setMode('epic')}
                  className={`px-3 py-1.5 text-[9px] font-black rounded-md transition-all ${mode === 'epic' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
                >
                  {t.epicSaga.toUpperCase()}
                </button>
              </div>
            </div>

            {mode === 'quick' ? (
              <div className="grid grid-cols-5 gap-2 animate-in fade-in zoom-in-95 duration-300">
                {quickOptions.map(opt => (
                  <button 
                    key={opt.value}
                    onClick={() => setQuickMinutes(opt.value)}
                    className={`py-3 rounded-xl border-2 text-[10px] font-black transition-all ${
                      quickMinutes === opt.value 
                        ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                        : 'border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-300">
                   <span>{t.duration}</span>
                   <span className="text-yellow-400">{sagaDays} {t.days}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="30" 
                  value={sagaDays}
                  onChange={(e) => setSagaDays(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-600 font-bold">
                  <span>{t.shortBurst}</span>
                  <span>{t.epicJourney}</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold py-3 rounded-xl transition-all uppercase text-[10px] tracking-widest"
            >
              {t.abandon}
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading || !goal}
              className="flex-[2] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 uppercase text-[10px] tracking-widest"
            >
              {loading ? t.consultingMaster : t.beginQuest}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuestModal;
