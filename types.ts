
export interface QuestStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  scheduledAt: string; // ISO string
  durationMinutes: number;
}

export interface Quest {
  id: string;
  title: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'abandoned';
  steps: QuestStep[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xp: number;
  lastUpdate: string;
}

export interface UserStats {
  level: number;
  totalXp: number;
  completedQuests: number;
  streak: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'reminder' | 'level-up' | 'alert';
  timestamp: Date;
}
