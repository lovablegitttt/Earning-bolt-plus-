import React from 'react';
import { UserEarningsData } from '../types';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { isRunningInTelegram } from '../lib/telegram';

interface TelegramSessionBadgeProps {
  userData?: UserEarningsData;
}

export const TelegramSessionBadge: React.FC<TelegramSessionBadgeProps> = ({
  userData,
}) => {
  const isNativeTg = isRunningInTelegram();
  const userName = userData?.name || 'Telegram User';

  return (
    <div className="px-4 mb-2 select-none">
      <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl neu-light-btn text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-neutral-700 font-medium text-[11px] flex items-center gap-1">
            <span>Telegram Session Active:</span>
            <strong className="text-neutral-900 font-semibold">{userName}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px] border border-blue-200/80 shadow-2xs">
          <ShieldCheck className="w-3 h-3 text-blue-600" />
          <span>Verified</span>
        </div>
      </div>
    </div>
  );
};
