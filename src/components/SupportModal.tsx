import React from 'react';
import { MessageSquare, X, ExternalLink, HelpCircle, ShieldCheck, Mail } from 'lucide-react';
import { openExternalLink, triggerHaptic } from '../lib/telegram';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl neu-glass-card border border-white p-5 text-neutral-900 shadow-[0_20px_60px_rgba(0,80,200,0.15)]">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,1),2px_2px_6px_rgba(0,80,200,0.08)] border border-white">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-neutral-900 leading-tight">
                Customer Support
              </h3>
              <p className="text-[10px] text-neutral-500 font-medium">24/7 Verified Help Desk</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-7 h-7 rounded-full neu-light-btn flex items-center justify-center text-neutral-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-4 space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl neu-stat-tile text-blue-900 leading-relaxed font-medium">
            <span className="font-bold block mb-1 text-blue-800">⚡ Fast Telegram Support</span>
            Need assistance with rewarded ads, partner quests, or withdrawal processing? Connect directly with our official support representative.
          </div>

          <button
            onClick={() => {
              triggerHaptic('medium');
              openExternalLink('https://t.me/Bolt_Earning_Bot');
            }}
            className="w-full py-3.5 px-4 rounded-2xl neu-glass-btn text-white font-bold text-xs flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-3.5 h-3.5 text-white" />
            <span>Open Telegram Help Desk</span>
          </button>

          <div className="space-y-2 pt-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Quick Answers
            </div>
            <div className="p-3 rounded-2xl neu-light-btn text-left">
              <div className="font-bold text-neutral-800 text-[11px] mb-0.5">
                When are rewards credited?
              </div>
              <p className="text-[10px] text-neutral-500 leading-normal">
                Instantly upon completing the rewarded video ad.
              </p>
            </div>
            <div className="p-3 rounded-2xl neu-light-btn text-left">
              <div className="font-bold text-neutral-800 text-[11px] mb-0.5">
                What is the minimum withdrawal?
              </div>
              <p className="text-[10px] text-neutral-500 leading-normal">
                Minimum threshold is $10.00 via USDT TRC20, PayPal, or Mobile Top-Up.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          className="w-full py-2.5 rounded-2xl neu-light-btn text-neutral-700 font-bold text-xs transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
