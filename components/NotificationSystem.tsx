
import React from 'react';
import { Notification } from '../types';

interface NotificationSystemProps {
  notifications: Notification[];
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications }) => {
  return (
    <div className="fixed top-20 left-0 right-0 z-[100] px-4 pointer-events-none space-y-2">
      {notifications.map((notif) => (
        <div 
          key={notif.id}
          className={`
            max-w-xs mx-auto p-4 rounded-xl border-2 shadow-2xl animate-in slide-in-from-top-10 duration-500 fade-in
            ${notif.type === 'level-up' ? 'bg-yellow-500 border-yellow-300 text-slate-950' : 'bg-slate-900/95 border-indigo-500 text-white'}
            backdrop-blur-md pointer-events-auto transition-all duration-300
          `}
        >
          <div className="flex items-start gap-3">
            <div className={`
              mt-1 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
              ${notif.type === 'level-up' ? 'bg-slate-950 text-yellow-500' : 'bg-indigo-600 text-white'}
            `}>
              {notif.type === 'level-up' && <span className="font-black text-xs">LVL</span>}
              {notif.type === 'reminder' && <span className="text-lg">🔔</span>}
              {notif.type === 'info' && <span className="text-lg">⚔️</span>}
              {notif.type === 'alert' && <span className="text-lg">⚠️</span>}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm uppercase tracking-tight leading-none mb-1 truncate">{notif.title}</h4>
              <p className="text-xs opacity-90 leading-tight line-clamp-2">{notif.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;
