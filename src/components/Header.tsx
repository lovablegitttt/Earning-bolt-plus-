import React from 'react';
import { UserEarningsData, TabType } from '../types';
import { MessageSquare, Globe, Bot } from 'lucide-react';

interface HeaderProps {
  userData: UserEarningsData;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenSupport: () => void;
  onOpenLanguage: () => void;
  onOpenBotConfig?: () => void;
  language: string;
}

export const Header: React.FC<HeaderProps> = ({
  userData,
  activeTab,
  setActiveTab,
  onOpenSupport,
  onOpenLanguage,
  onOpenBotConfig,
  language,
}) => {
  return (
    <header className="w-full px-4 pt-3 pb-2 select-none">
      {/* Top Bar with Brand & Actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center tracking-tight">
            <span className="font-extrabold text-2xl tracking-tighter text-neutral-900 flex items-center">
              Pay<span className="text-[#d4af37] flex items-center">Plus<span className="text-sm font-black ml-0.5 text-amber-500">$</span></span>
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-500/20">
            Bolt
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Bot Live Sync Button */}
          {onOpenBotConfig && (
            <button
              id="header-bot-btn"
              onClick={onOpenBotConfig}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-amber-400 bg-neutral-900 text-white text-[11px] font-semibold shadow-xs hover:bg-neutral-800 active:scale-95 transition-transform"
              title="Telegram Bot Live Settings"
            >
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-[10px]">Bot</span>
            </button>
          )}

          {/* Customer Support Button */}
          <button
            id="header-support-btn"
            onClick={onOpenSupport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-amber-300/60 bg-gradient-to-b from-[#fffef7] to-[#fbf8ea] text-[11px] font-semibold text-neutral-800 shadow-xs hover:border-amber-400 active:scale-95 transition-transform"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
            <div className="text-left leading-tight hidden sm:block">
              <span className="text-[9px] block text-neutral-500 font-medium leading-none">Customer</span>
              <span className="font-bold">Support</span>
            </div>
            <span className="font-bold sm:hidden text-[10px]">Support</span>
          </button>

          {/* Language Selector Button */}
          <button
            id="header-language-btn"
            onClick={onOpenLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-amber-300/60 bg-gradient-to-b from-[#fffef7] to-[#fbf8ea] text-[11px] font-semibold text-neutral-800 shadow-xs hover:border-amber-400 active:scale-95 transition-transform"
          >
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            <div className="text-left leading-tight hidden sm:block">
              <span className="text-[9px] block text-neutral-500 font-medium leading-none">Language</span>
              <span className="font-bold">{language}</span>
            </div>
            <span className="font-bold sm:hidden text-[10px]">{language.slice(0, 2)}</span>
          </button>
        </div>
      </div>

      {/* Gold Hero Balance Card */}
      <div 
        id="hero-balance-card"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4d3a17] via-[#2f230b] to-[#1a1406] p-4 text-white shadow-lg border border-amber-500/30"
      >
        {/* Subtle background glow & texture */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-yellow-500/15 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-amber-200/80 uppercase">
              TOTAL BALANCE
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-amber-400 mt-0.5 flex items-baseline gap-1">
              ${userData.totalBalance.toFixed(2)}
            </div>
            <div className="text-[11px] text-amber-200/70 font-medium mt-0.5">
              Available to withdraw
            </div>
          </div>

          {/* User Profile Badge (Auto-detected Telegram Data) */}
          <div className="flex items-center gap-2.5 bg-black/30 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-amber-400/20">
            <div className="relative">
              {userData.avatarUrl ? (
                <img
                  src={userData.avatarUrl}
                  alt={userData.name}
                  className="w-9 h-9 rounded-full object-cover border border-amber-400/50"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center font-bold text-neutral-900 text-sm shadow-inner">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-neutral-900 rounded-full" />
            </div>

            <div className="text-left">
              <div className="text-xs font-bold text-white leading-tight truncate max-w-[100px]">
                {userData.name}
              </div>
              <div className="text-[10px] text-amber-300/80 font-mono tracking-tight">
                ID: {userData.userId}
              </div>
            </div>
          </div>
        </div>

        {/* Action Pills Navigation */}
        <div className="mt-3.5 pt-2.5 border-t border-amber-500/20 flex items-center justify-between text-[10px] text-amber-200/80">
          <button
            onClick={() => setActiveTab('ads')}
            className={`flex items-center gap-1 transition-colors ${activeTab === 'ads' ? 'text-amber-300 font-bold' : 'hover:text-amber-100'}`}
          >
            <span className="text-amber-400">▶</span> Watch Ads
          </button>
          <span className="text-amber-500/40">•</span>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1 transition-colors ${activeTab === 'tasks' ? 'text-amber-300 font-bold' : 'hover:text-amber-100'}`}
          >
            <span className="text-amber-400">☑</span> Complete Tasks
          </button>
          <span className="text-amber-500/40">•</span>
          <button
            onClick={() => setActiveTab('invite')}
            className={`flex items-center gap-1 transition-colors ${activeTab === 'invite' ? 'text-amber-300 font-bold' : 'hover:text-amber-100'}`}
          >
            <span className="text-amber-400">👥</span> Invite Friends
          </button>
        </div>
      </div>
    </header>
  );
};
