
import React, { useState } from 'react';

interface AddQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: string, duration: number) => void;
  loading: boolean;
}

const AddQuestModal: React.FC<AddQuestModalProps> = ({ isOpen, onClose, onSubmit, loading }) => {
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState(7);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 p-6 relative animate-in slide-in-from-bottom-10 duration-500 shadow-2xl">
        <h2 className="text-xl font-bold mb-4 pixel-font text-yellow-400">SUMMON QUEST</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Primary Objective</label>
            <textarea
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all min-h-[100px]"
              placeholder="e.g., Master the fundamentals of TypeScript in a week"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Duration: {duration} Days</label>
            <input 
              type="range" 
              min="1" 
              max="30" 
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-bold">
              <span>SHORT BURST</span>
              <span>EPIC JOURNEY</span>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold py-3 rounded-xl transition-all"
            >
              ABANDON
            </button>
            <button 
              onClick={() => goal && onSubmit(goal, duration)}
              disabled={loading || !goal}
              className="flex-[2] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
            >
              {loading ? "CONSULTING MASTER..." : "BEGIN QUEST"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuestModal;
