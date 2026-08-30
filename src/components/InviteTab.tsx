import React, { useState } from 'react';
import { UserEarningsData } from '../types';
import { Users, Copy, Check, Send, Sparkles } from 'lucide-react';
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
    <div className="space-y-4 pb-24 px-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-neutral-200/70">
        {/* Header Icon + Description matching Screenshot 3 */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight leading-tight">
              Invite & Earn
            </h2>
            <div className="text-xs font-bold text-amber-800 mt-0.5">
              Earn $0.75 for each invite
            </div>
            <p className="text-[11px] text-neutral-500 font-medium mt-1 leading-normal">
              Copy and share your invite link with friends to earn more.
            </p>
          </div>
        </div>

        {/* Your Invite Link box with Copy Button */}
        <div className="space-y-1.5 mb-3">
          <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wide">
            Your Invite Link
          </label>
          <div className="flex items-center justify-between p-2.5 rounded-2xl border-2 border-neutral-200/90 bg-neutral-50/60 text-xs gap-2">
            <div className="font-mono text-neutral-600 truncate text-[11px] pl-1 select-all">
              {inviteLink}
            </div>
            <button
              id="copy-invite-link-btn"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 active:scale-95 transition-transform shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
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

        {/* Share with Friends Button matching Screenshot 3 */}
        <button
          id="share-friends-btn"
          onClick={handleShare}
          className="w-full py-3.5 rounded-2xl border-2 border-neutral-300/80 bg-white hover:bg-neutral-50 font-bold text-sm text-neutral-800 flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-transform mb-5"
        >
          <Send className="w-4 h-4 text-neutral-700" />
          <span>Share with Friends</span>
        </button>

        {/* Bottom 2 Stats Boxes matching Screenshot 3 */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
          <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-b from-[#fffefc] to-[#fcf8ee] p-3.5 text-left">
            <span className="text-[10px] font-bold tracking-wider text-amber-800/80 uppercase block">
              FRIENDS INVITED
            </span>
            <div className="text-xl font-extrabold text-neutral-900 mt-1 flex items-baseline gap-1">
              {userData.friendsInvited} <Users className="w-3.5 h-3.5 text-neutral-400 inline" />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-b from-[#fffefc] to-[#fcf8ee] p-3.5 text-left">
            <span className="text-[10px] font-bold tracking-wider text-amber-800/80 uppercase block">
              EARNED FROM INVITES
            </span>
            <div className="text-xl font-extrabold text-neutral-900 mt-1 flex items-baseline gap-0.5">
              ${userData.earnedFromInvites.toFixed(2)}{' '}
              <span className="text-xs text-neutral-400 font-bold">$</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
