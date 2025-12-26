
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Quest, UserStats, Notification } from './types';
import { generateQuestBreakdown, getMotivationalNudge, getAlternativeStrategy } from './geminiService';
import Layout from './components/Layout';
import QuestCard from './components/QuestCard';
import AddQuestModal from './components/AddQuestModal';
import QuestDetails from './components/QuestDetails';
import NotificationSystem from './components/NotificationSystem';
import { Language, translations } from './translations';

type FilterType = 'active' | 'completed' | 'abandoned' | 'due-today';

const App: React.FC = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    totalXp: 0,
    completedQuests: 0,
    streak: 0,
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('quest_master_lang');
    return (saved as Language) || 'en';
  });

  const t = translations[language];

  // Load state from localStorage
  useEffect(() => {
    const savedQuests = localStorage.getItem('quest_master_quests');
    const savedStats = localStorage.getItem('quest_master_stats');
    if (savedQuests) setQuests(JSON.parse(savedQuests));
    if (savedStats) setUserStats(JSON.parse(savedStats));
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('quest_master_quests', JSON.stringify(quests));
    localStorage.setItem('quest_master_stats', JSON.stringify(userStats));
    localStorage.setItem('quest_master_lang', language);
  }, [quests, userStats, language]);

  const addNotification = useCallback((title: string, message: string, type: Notification['type'] = 'info', questId?: string) => {
    const newNotif: Notification = {
      id: crypto.randomUUID(),
      questId,
      title,
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 5));
    
    // Auto-clear general notifications after 8 seconds
    if (type !== 'alert') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
      }, 8000);
    }
  }, []);

  const clearNotificationsForQuest = useCallback((questId: string) => {
    setNotifications(prev => prev.filter(n => n.questId !== questId));
  }, []);

  const handleCreateQuest = async (goal: string, totalMinutes: number, category: string) => {
    setLoading(true);
    try {
      const newQuest = await generateQuestBreakdown(goal, totalMinutes, language, category) as Quest;
      setQuests(prev => [newQuest, ...prev]);
      setIsModalOpen(false);
      addNotification(t.questAccepted, `${t.started}: ${newQuest.title}`, 'info', newQuest.id);
    } catch (error) {
      addNotification(t.error, t.errorCreate, 'alert');
    } finally {
      setLoading(false);
    }
  };

  const handleAbandonQuest = (questId: string) => {
    if (window.confirm(t.confirmAbandon)) {
      setQuests(prev => prev.map(q => 
        q.id === questId ? { ...q, status: 'abandoned', lastUpdate: new Date().toISOString() } : q
      ));
      // AUTO-DELETE ALARMS ON ABANDON
      clearNotificationsForQuest(questId);
      setSelectedQuest(null);
    }
  };

  const toggleStep = (questId: string, stepId: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        const updatedSteps = q.steps.map(s => s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s);
        const allCompleted = updatedSteps.every(s => s.isCompleted);
        
        if (allCompleted && q.status !== 'completed') {
          // AUTO-DELETE ALARMS ON COMPLETION
          clearNotificationsForQuest(questId);

          // Level up logic
          const xpGained = q.xp;
          setUserStats(stats => {
             const newTotalXp = stats.totalXp + xpGained;
             const newLevel = Math.floor(newTotalXp / 1000) + 1;
             if (newLevel > stats.level) {
                addNotification(t.levelUp, `${t.reachedLevel} ${newLevel}!`, 'level-up');
             }
             return {
               ...stats,
               totalXp: newTotalXp,
               level: newLevel,
               completedQuests: stats.completedQuests + 1
             };
          });
          addNotification(t.questComplete, `+${xpGained} XP`, 'info', questId);
          return { ...q, steps: updatedSteps, status: 'completed', lastUpdate: new Date().toISOString() };
        }

        return { ...q, steps: updatedSteps, lastUpdate: new Date().toISOString() };
      }
      return q;
    }));
  };

  const isDueToday = (dateStr: string) => {
    const end = new Date(dateStr);
    const today = new Date();
    return end.getDate() === today.getDate() &&
           end.getMonth() === today.getMonth() &&
           end.getFullYear() === today.getFullYear();
  };

  const uniqueCategories = useMemo(() => {
    const cats = new Set(quests.map(q => q.category));
    return Array.from(cats);
  }, [quests]);

  const filteredQuests = useMemo(() => {
    let base = quests;
    
    // Status filter
    if (activeFilter === 'completed') {
      base = base.filter(q => q.status === 'completed');
    } else if (activeFilter === 'abandoned') {
      base = base.filter(q => q.status === 'abandoned');
    } else {
      base = base.filter(q => q.status === 'active');
      if (activeFilter === 'due-today') {
        base = base.filter(q => isDueToday(q.endDate));
      }
    }

    // Category filter
    if (selectedCategory !== 'all') {
      base = base.filter(q => q.category === selectedCategory);
    }

    return base;
  }, [quests, activeFilter, selectedCategory]);

  // Monitoring for overdue steps and quest expiry
  useEffect(() => {
    const checkStatus = async () => {
      const now = new Date();
      let anyUpdate = false;
      
      const newQuests = await Promise.all(quests.map(async (q) => {
        if (q.status !== 'active') return q;

        // Auto-cleanup expired quest notifications
        if (new Date(q.endDate) < now) {
            // Quest has naturally expired. For "Quest Kicker", we keep it active but clear stale alerts
            // Alternatively, we could auto-abandon it here.
        }
        
        let questUpdated = false;
        const newSteps = await Promise.all(q.steps.map(async (step) => {
          const scheduled = new Date(step.scheduledAt);
          // Only trigger if past scheduled time AND not completed AND no strategy yet
          if (scheduled < now && !step.isCompleted && !step.overdueStrategy) {
            try {
              const strategy = await getAlternativeStrategy(q.title, step.title, language);
              addNotification(t.overdueWarning, `${step.title}: ${t.tacticalAdvice}`, 'alert', q.id);
              questUpdated = true;
              anyUpdate = true;
              return { ...step, overdueStrategy: strategy };
            } catch (e) {
              console.error("Failed to get overdue strategy", e);
              return step;
            }
          }
          return step;
        }));

        return questUpdated ? { ...q, steps: newSteps, lastUpdate: new Date().toISOString() } : q;
      }));

      if (anyUpdate) {
        setQuests(newQuests);
      }
    };

    const interval = setInterval(checkStatus, 60000); // Check every minute
    checkStatus();
    
    return () => clearInterval(interval);
  }, [quests, language, addNotification, t.overdueWarning, t.tacticalAdvice]);

  return (
    <Layout userStats={userStats} language={language} onLanguageChange={setLanguage}>
      <div className="p-4 space-y-6 pb-24">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold pixel-font text-yellow-400 uppercase tracking-tighter">{t.appName}</h1>
            <p className="text-slate-400 text-sm">{t.trackProgress}</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
          >
            <span className="text-xl">+</span> {t.new}
          </button>
        </header>

        {/* Primary Filter Bar */}
        <div className="space-y-3">
          <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => { setActiveFilter('active'); setSelectedCategory('all'); }}
              className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${activeFilter === 'active' || activeFilter === 'due-today' ? 'bg-slate-800 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {t.activeMissions}
            </button>
            <button 
              onClick={() => { setActiveFilter('completed'); setSelectedCategory('all'); }}
              className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${activeFilter === 'completed' ? 'bg-slate-800 text-green-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {t.completedSagas}
            </button>
            <button 
              onClick={() => { setActiveFilter('abandoned'); setSelectedCategory('all'); }}
              className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${activeFilter === 'abandoned' ? 'bg-slate-800 text-red-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {t.abandonedSagas}
            </button>
          </div>

          {/* Sub-Filter (Due Today) and Category Filter */}
          <div className="space-y-3">
            {(activeFilter === 'active' || activeFilter === 'due-today') && (
              <div className="flex gap-4 px-1 animate-in fade-in slide-in-from-top-2 duration-300">
                <button 
                  onClick={() => setActiveFilter('active')}
                  className={`text-[9px] font-black tracking-widest uppercase transition-colors ${activeFilter === 'active' ? 'text-indigo-400' : 'text-slate-600'}`}
                >
                  {t.allActive}
                </button>
                <button 
                  onClick={() => setActiveFilter('due-today')}
                  className={`flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase transition-colors ${activeFilter === 'due-today' ? 'text-orange-400' : 'text-slate-600'}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${activeFilter === 'due-today' ? 'bg-orange-500 animate-pulse' : 'bg-slate-700'}`}></div>
                  {t.dueToday}
                </button>
              </div>
            )}

            {/* Category horizontal scroller */}
            {uniqueCategories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-black whitespace-nowrap transition-all border ${
                    selectedCategory === 'all' 
                      ? 'bg-slate-800 border-indigo-500 text-indigo-400' 
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  {t.allCategories.toUpperCase()}
                </button>
                {uniqueCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-black whitespace-nowrap transition-all border ${
                      selectedCategory === cat 
                        ? 'bg-slate-800 border-indigo-500 text-indigo-400' 
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <section className="grid gap-4">
          {filteredQuests.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/20">
              <p className="text-slate-500 italic px-4">
                {activeFilter === 'due-today' ? t.noQuestsDueToday : 
                 activeFilter === 'completed' ? t.noCompletedSagas :
                 activeFilter === 'abandoned' ? t.noAbandonedSagas :
                 t.noActiveMissions}
              </p>
            </div>
          ) : (
            filteredQuests.map(quest => (
              <QuestCard 
                key={quest.id} 
                quest={quest} 
                language={language}
                onClick={() => setSelectedQuest(quest)} 
              />
            ))
          )}
        </section>
      </div>

      <AddQuestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateQuest}
        loading={loading}
        language={language}
        existingCategories={uniqueCategories}
      />

      {selectedQuest && (
        <QuestDetails 
          quest={selectedQuest} 
          language={language}
          onClose={() => setSelectedQuest(null)}
          onToggleStep={toggleStep}
          onAbandon={() => handleAbandonQuest(selectedQuest.id)}
        />
      )}

      <NotificationSystem notifications={notifications} />

      {/* Persistent Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 flex justify-around items-center px-6 z-40">
        <button className="text-yellow-400 flex flex-col items-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span className="text-[10px] mt-1 font-bold">{t.home}</span>
        </button>
        <button className="text-slate-500 flex flex-col items-center opacity-50 cursor-not-allowed">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span className="text-[10px] mt-1 font-bold">{t.trophies}</span>
        </button>
        <button className="text-slate-500 flex flex-col items-center opacity-50 cursor-not-allowed">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            <span className="text-[10px] mt-1 font-bold">{t.hero}</span>
        </button>
      </nav>
    </Layout>
  );
};

export default App;
