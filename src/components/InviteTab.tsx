import React, { useState } from 'react';
import { UserEarningsData } from '../types';
import { Users, Copy, Check, Send, Sparkles, UserPlus } from 'lucide-react';
import { triggerHaptic, shareToTelegram } from '../lib/telegram';

interface InviteTabProps {
  userData: UserEarningsData;
}

export const InviteTab: React.FC<InviteTabProps> = ({ userData }) => {
  const [copied, setCopied] = useState(false);

  // Deep link targeting Telegram bot and webapp start param
  const inviteLink = `https://t.me/Bolt_Earning_Bot/app?startapp=${userData.userId}`;
  const shareMessage = `⚡ Join Bolt Earning Bot! Watch quick Adsgram ads, complete tasks, and earn real cash daily! Start here:`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    triggerHaptic('success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    triggerHaptic('medium');
    shareToTelegram(shareMessage, inviteLink);
  };

  return (
    <div className="space-y-4 pb-28 px-4 animate-in fade-in duration-200">
      <div className="ios-glass-card rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {/* Header Icon + Description */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-neutral-900 tracking-tight leading-tight">
              Invite & Earn
            </h2>
            <div className="text-xs font-bold text-blue-600 mt-0.5">
              Earn $0.75 for each friend you invite
            </div>
            <p className="text-xs text-neutral-500 font-medium mt-1 leading-normal">
              Copy and share your unique referral link with friends to earn instant commission.
            </p>
          </div>
        </div>

        {/* Your Invite Link box with Copy Button */}
        <div className="space-y-1.5 mb-4">
          <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wide">
            Your Personal Invite Link
          </label>
          <div className="flex items-center justify-between p-2 rounded-2xl border border-neutral-200 bg-white text-xs gap-2 shadow-2xs">
            <div className="font-mono text-neutral-600 truncate text-[11px] pl-2 select-all">
              {inviteLink}
            </div>
            <button
              id="copy-invite-link-btn"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 active:scale-95 transition-all shrink-0 border border-blue-200/60"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Share with Friends Button */}
        <button
          id="share-friends-btn"
          onClick={handleShare}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:brightness-105 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,122,255,0.3)] active:scale-[0.99] transition-all mb-5"
        >
          <Send className="w-4 h-4 text-white" />
          <span>Share with Friends</span>
        </button>

        {/* Bottom 2 Stats Boxes */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
          <div className="rounded-2xl border border-blue-100/80 bg-gradient-to-b from-white to-blue-50/30 p-4 text-left shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider text-blue-800 uppercase block">
              FRIENDS INVITED
            </span>
            <div className="text-2xl font-black text-neutral-900 mt-1 flex items-baseline gap-1">
              {userData.friendsInvited} <span className="text-xs text-neutral-400 font-medium">friends</span>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100/80 bg-gradient-to-b from-white to-blue-50/30 p-4 text-left shadow-2xs">
            <span className="text-[10px] font-bold tracking-wider text-blue-800 uppercase block">
              EARNED FROM INVITES
            </span>
            <div className="text-2xl font-black text-blue-600 mt-1 flex items-baseline gap-0.5">
              ${userData.earnedFromInvites.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
