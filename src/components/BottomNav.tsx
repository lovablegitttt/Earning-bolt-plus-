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
      label: 'Withdraw',
      icon: <CircleDollarSign className="w-5 h-5" />,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[max(env(safe-area-inset-bottom),8px)] pt-2">
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
              className={`flex flex-col items-center justify-center py-1 px-4 transition-all duration-200 relative ${
                isActive ? 'text-[#c69214] font-bold scale-105' : 'text-neutral-400 font-medium hover:text-neutral-600'
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[11px] tracking-tight mt-0.5">{item.label}</span>
              {isActive && (
                <div className="absolute -top-1 w-6 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
