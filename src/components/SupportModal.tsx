import React from 'react';
import { MessageSquare, X, ExternalLink, HelpCircle, ShieldCheck, Mail } from 'lucide-react';
import { openExternalLink } from '../lib/telegram';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-white border border-neutral-200 shadow-2xl p-5 text-neutral-900">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-900 leading-tight">
                Customer Support
              </h3>
              <p className="text-[10px] text-neutral-500">24/7 Bolt Earning Desk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-4 space-y-3 text-xs">
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 leading-relaxed">
            <span className="font-bold block mb-1">⚡ Fast Telegram Support</span>
            Need assistance with Adsgram ad rewards, referral tracking, or withdrawal processing? Reach our official Telegram support channel.
          </div>

          <button
            onClick={() => openExternalLink('https://t.me/Bolt_Earning_Bot')}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#292e3d] to-[#12141c] text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-transform"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Open @BoltEarningSupport on Telegram</span>
          </button>

          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Quick FAQs
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="font-bold text-neutral-800 text-[11px] mb-0.5">
                When are ad rewards credited?
              </div>
              <p className="text-[10px] text-neutral-500 leading-normal">
                Instantly upon completing the 15-second Adsgram rewarded video.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="font-bold text-neutral-800 text-[11px] mb-0.5">
                What is the minimum withdrawal?
              </div>
              <p className="text-[10px] text-neutral-500 leading-normal">
                Minimum withdrawal threshold is $10.00 via USDT TRC20, PayPal, or Mobile Top-Up.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs"
        >
          Close
        </button>
      </div>
    </div>
  );
};
