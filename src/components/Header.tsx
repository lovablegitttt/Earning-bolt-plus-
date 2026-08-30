import React from 'react';
import { UserEarningsData, TabType } from '../types';
import { MessageSquare, Globe, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { triggerHaptic } from '../lib/telegram';

interface HeaderProps {
  userData: UserEarningsData;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenSupport: () => void;
  onOpenLanguage: () => void;
  language?: string;
}

export const Header: React.FC<HeaderProps> = ({
  userData,
  activeTab,
  setActiveTab,
  onOpenSupport,
  onOpenLanguage,
  language = 'English',
}) => {
  const langText = language || 'English';

  return (
    <header className="w-full px-4 pt-3.5 pb-2 select-none">
      {/* Top Bar with Apple Glass Branding & Controls */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          {/* iOS App Icon Style Badge with Neumorphic Relief */}
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-0.5 shadow-[3px_4px_12px_rgba(0,102,238,0.3)] flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center text-white">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="font-extrabold text-lg tracking-tight text-neutral-900">
                Bolt<span className="text-blue-600">Pay</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/80 shadow-2xs">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-medium">Daily Reward Hub</p>
          </div>
        </div>

        {/* Action Controls in Neumorphic Glass Style */}
        <div className="flex items-center gap-2">
          {/* Customer Support Button */}
          <button
            id="header-support-btn"
            onClick={() => {
              triggerHaptic('light');
              onOpenSupport();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full neu-light-btn text-xs font-semibold text-neutral-700 hover:text-blue-600 active:scale-95 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-medium hidden sm:inline">Support</span>
          </button>

          {/* Language Selector Button */}
          <button
            id="header-language-btn"
            onClick={() => {
              triggerHaptic('light');
              onOpenLanguage();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full neu-light-btn text-xs font-semibold text-neutral-700 hover:text-blue-600 active:scale-95 transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-medium">{langText.slice(0, 2).toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Premium Neumorphic + Frosted Glass Hero Card */}
      <div 
        id="hero-balance-card"
        className="relative overflow-hidden rounded-3xl neu-glass-hero p-5 text-white"
      >
        {/* Optical Light Highlights */}
        <div className="absolute -top-16 -right-12 w-48 h-48 bg-sky-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-10 w-40 h-40 bg-blue-300/25 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/15 pointer-events-none rounded-3xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1 text-[11px] font-semibold tracking-wider text-blue-100 uppercase">
                <span>TOTAL AVAILABLE BALANCE</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1 flex items-baseline gap-1 drop-shadow-sm">
                ${userData.totalBalance.toFixed(2)}
              </div>
              <div className="text-[11px] text-blue-100/90 font-medium mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                Instant withdrawals enabled
              </div>
            </div>

            {/* Apple Style User Pill with Neumorphic Glow */}
            <div className="flex items-center gap-2.5 bg-white/20 backdrop-blur-xl px-3.5 py-1.5 rounded-2xl border border-white/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_4px_12px_rgba(0,0,0,0.1)]">
              <div className="relative">
                {userData.avatarUrl ? (
                  <img
                    src={userData.avatarUrl}
                    alt={userData.name}
                    className="w-8 h-8 rounded-full object-cover border border-white/60 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-xs shadow-xs border border-white">
                    {userData.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-blue-600 rounded-full" />
              </div>

              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight truncate max-w-[85px]">
                  {userData.name}
                </div>
                <div className="text-[9px] text-blue-100 font-mono tracking-tight opacity-90">
                  Verified
                </div>
              </div>
            </div>
          </div>

          {/* Quick Segmented Nav Control with Inset Well + Raised Pill */}
          <div className="mt-4 pt-3.5 border-t border-white/20 grid grid-cols-3 gap-1.5 bg-black/15 backdrop-blur-md p-1.5 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]">
            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('ads');
              }}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${
                activeTab === 'ads'
                  ? 'bg-white text-blue-700 shadow-[0_3px_10px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,1)]'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>Watch Ads</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('tasks');
              }}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${
                activeTab === 'tasks'
                  ? 'bg-white text-blue-700 shadow-[0_3px_10px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,1)]'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>Tasks</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('invite');
              }}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${
                activeTab === 'invite'
                  ? 'bg-white text-blue-700 shadow-[0_3px_10px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,1)]'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>Invite</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
