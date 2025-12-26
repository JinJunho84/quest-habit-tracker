
import React from 'react';
import { UserStats } from '../types';
import { Language, translations } from '../translations';

interface LayoutProps {
  children: React.ReactNode;
  userStats: UserStats;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userStats, language, onLanguageChange }) => {
  const t = translations[language];
  const xpProgress = (userStats.totalXp % 1000) / 10;

  return (
    <div className="max-w-md mx-auto min-h-screen relative bg-slate-950 flex flex-col overflow-x-hidden">
      {/* RPG HUD Top Bar */}
      <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-yellow-500 bg-slate-800 flex items-center justify-center overflow-hidden">
                <img src={`https://picsum.photos/seed/${userStats.level}/200`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-slate-950 font-black text-[10px] px-1 rounded border border-white whitespace-nowrap">
              {t.level}{userStats.level}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">{t.experiencePoints}</span>
              <span className="text-[10px] text-slate-400 font-bold">{userStats.totalXp % 1000} / 1000 XP</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-500" 
                style={{ width: `${xpProgress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Language Switcher Control */}
          <div className="flex bg-slate-950/50 rounded-lg p-0.5 border border-slate-700/50">
            <button 
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1.5 text-[10px] font-black rounded-md transition-all duration-200 ${language === 'en' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              EN
            </button>
            <button 
              onClick={() => onLanguageChange('ko')}
              className={`px-2.5 py-1.5 text-[10px] font-black rounded-md transition-all duration-200 ${language === 'ko' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              KO
            </button>
          </div>
        </div>
      </div>
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
