import React from 'react';
import { TabType } from '../types';
import { PlayCircle, CheckSquare, Users, CircleDollarSign } from 'lucide-react';
import { triggerHaptic } from '../lib/telegram';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'ads',
      label: 'Ads',
      icon: <PlayCircle className="w-5 h-5" />,
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <CheckSquare className="w-5 h-5" />,
    },
    {
      id: 'invite',
      label: 'Invite',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'withdraw',
      label: 'Cashout',
      icon: <CircleDollarSign className="w-5 h-5" />,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 ios-glass-nav border-t border-white/60 shadow-[0_-8px_32px_rgba(0,122,255,0.08)] pb-[max(env(safe-area-inset-bottom),12px)] pt-2.5">
      <div className="max-w-md mx-auto px-4 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => {
                triggerHaptic('light');
                setActiveTab(item.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3.5 transition-all duration-200 relative select-none ${
                isActive ? 'text-blue-600 font-bold scale-105' : 'text-neutral-400 font-medium hover:text-neutral-600'
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[11px] tracking-tight mt-1 font-semibold">{item.label}</span>
              {isActive && (
                <div className="absolute -top-1 w-5 h-1 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full shadow-[0_2px_6px_rgba(0,122,255,0.4)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
