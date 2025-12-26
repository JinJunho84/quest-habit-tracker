
import React, { useState, useEffect, useCallback } from 'react';
import { Quest, UserStats, Notification } from './types';
import { generateQuestBreakdown, getMotivationalNudge } from './geminiService';
import Layout from './components/Layout';
import QuestCard from './components/QuestCard';
import AddQuestModal from './components/AddQuestModal';
import QuestDetails from './components/QuestDetails';
import NotificationSystem from './components/NotificationSystem';

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
  }, [quests, userStats]);

  const addNotification = useCallback((title: string, message: string, type: Notification['type'] = 'info') => {
    const newNotif: Notification = {
      id: crypto.randomUUID(),
      title,
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 5));
  }, []);

  const handleCreateQuest = async (goal: string, duration: number) => {
    setLoading(true);
    try {
      const newQuest = await generateQuestBreakdown(goal, duration) as Quest;
      setQuests(prev => [newQuest, ...prev]);
      setIsModalOpen(false);
      addNotification("Quest Accepted!", `Started: ${newQuest.title}`, 'info');
    } catch (error) {
      addNotification("Error", "Could not create quest. Try again.", 'alert');
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (questId: string, stepId: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        const updatedSteps = q.steps.map(s => s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s);
        const allCompleted = updatedSteps.every(s => s.isCompleted);
        
        if (allCompleted && q.status !== 'completed') {
          // Level up logic
          const xpGained = q.xp;
          setUserStats(stats => {
             const newTotalXp = stats.totalXp + xpGained;
             const newLevel = Math.floor(newTotalXp / 1000) + 1;
             if (newLevel > stats.level) {
                addNotification("LEVEL UP!", `You reached Level ${newLevel}!`, 'level-up');
             }
             return {
               ...stats,
               totalXp: newTotalXp,
               level: newLevel,
               completedQuests: stats.completedQuests + 1
             };
          });
          addNotification("Quest Complete!", `Gained ${xpGained} XP`, 'info');
          return { ...q, steps: updatedSteps, status: 'completed', lastUpdate: new Date().toISOString() };
        }

        return { ...q, steps: updatedSteps, lastUpdate: new Date().toISOString() };
      }
      return q;
    }));
  };

  // Simulated Push Notification / Inactivity Check
  useEffect(() => {
    const interval = setInterval(async () => {
      const inactiveQuests = quests.filter(q => {
        const lastUpdate = new Date(q.lastUpdate).getTime();
        const diffHours = (Date.now() - lastUpdate) / (1000 * 60 * 60);
        return q.status === 'active' && diffHours > 24; // Check every 24 hours of inactivity
      });

      if (inactiveQuests.length > 0) {
        const target = inactiveQuests[0];
        const nudge = await getMotivationalNudge(target.title);
        addNotification("Quest Master's Nudge", nudge, 'reminder');
      }
    }, 1000 * 60 * 60); // Check every hour

    return () => clearInterval(interval);
  }, [quests, addNotification]);

  return (
    <Layout userStats={userStats}>
      <div className="p-4 space-y-6 pb-24">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold pixel-font text-yellow-400">QUESTS</h1>
            <p className="text-slate-400 text-sm">Active Missions</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
          >
            <span className="text-xl">+</span> NEW QUEST
          </button>
        </header>

        <section className="grid gap-4">
          {quests.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/20">
              <p className="text-slate-500 italic">No quests active. Embark on a journey!</p>
            </div>
          ) : (
            quests.filter(q => q.status === 'active').map(quest => (
              <QuestCard 
                key={quest.id} 
                quest={quest} 
                onClick={() => setSelectedQuest(quest)} 
              />
            ))
          )}
        </section>

        {quests.some(q => q.status === 'completed') && (
          <section className="mt-8">
            <h2 className="text-lg font-bold text-slate-400 mb-4 px-1">COMPLETED</h2>
            <div className="grid gap-3 opacity-60">
              {quests.filter(q => q.status === 'completed').map(quest => (
                <QuestCard 
                  key={quest.id} 
                  quest={quest} 
                  onClick={() => setSelectedQuest(quest)} 
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <AddQuestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateQuest}
        loading={loading}
      />

      {selectedQuest && (
        <QuestDetails 
          quest={selectedQuest} 
          onClose={() => setSelectedQuest(null)}
          onToggleStep={toggleStep}
        />
      )}

      <NotificationSystem notifications={notifications} />

      {/* Persistent Bottom Nav (Simplified for this UI) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 flex justify-around items-center px-6 z-40">
        <button className="text-yellow-400 flex flex-col items-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span className="text-[10px] mt-1 font-bold">HOME</span>
        </button>
        <button className="text-slate-500 flex flex-col items-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span className="text-[10px] mt-1 font-bold">TROPHIES</span>
        </button>
        <button className="text-slate-500 flex flex-col items-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            <span className="text-[10px] mt-1 font-bold">HERO</span>
        </button>
      </nav>
    </Layout>
  );
};

export default App;
