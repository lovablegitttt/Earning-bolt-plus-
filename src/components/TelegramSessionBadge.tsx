import React, { useState } from 'react';
import { UserEarningsData, TelegramUser } from '../types';
import { CheckCircle2, ShieldCheck, UserCheck, Smartphone, Edit3, Check } from 'lucide-react';
import { isRunningInTelegram, triggerHaptic } from '../lib/telegram';
import { saveUserData } from '../lib/storage';

interface TelegramSessionBadgeProps {
  userData: UserEarningsData;
  onUserUpdated: (data: UserEarningsData) => void;
}

export const TelegramSessionBadge: React.FC<TelegramSessionBadgeProps> = ({
  userData,
  onUserUpdated,
}) => {
  const isNativeTg = isRunningInTelegram();
  const [isEditing, setIsEditing] = useState(false);
  const [customName, setCustomName] = useState(userData.name);
  const [customId, setCustomId] = useState(userData.userId);

  const handleSave = () => {
    if (!customName.trim() || !customId.trim()) return;
    const updated: UserEarningsData = {
      ...userData,
      name: customName.trim(),
      userId: customId.trim(),
      referralCode: customId.trim(),
    };
    saveUserData(updated);
    onUserUpdated(updated);
    setIsEditing(false);
    triggerHaptic('success');
  };

  return (
    <div className="px-4 mb-2">
      <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white border border-neutral-200/80 text-[11px] shadow-2xs">
        <div className="flex items-center gap-2">
          {isNativeTg ? (
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          ) : (
            <Smartphone className="w-3.5 h-3.5 text-amber-600" />
          )}
          <span className="text-neutral-600 font-medium">
            {isNativeTg ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" /> Telegram WebApp Connected
              </span>
            ) : (
              <span className="text-neutral-700">
                Telegram Mode: <strong className="text-neutral-900">{userData.name}</strong> (ID: {userData.userId})
              </span>
            )}
          </span>
        </div>

        {!isNativeTg && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-amber-700 hover:text-amber-900 font-bold text-[10px] flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200"
          >
            <Edit3 className="w-3 h-3" />
            <span>{isEditing ? 'Cancel' : 'Change User'}</span>
          </button>
        )}
      </div>

      {isEditing && (
        <div className="mt-2 p-3 bg-white rounded-2xl border border-amber-200 shadow-sm text-xs space-y-2">
          <p className="text-[11px] text-neutral-500">
            Inside Telegram, your Telegram Name and ID are automatically detected. In browser/preview, you can set your real Telegram identity below:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-neutral-600 uppercase">Telegram Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs mt-0.5 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-neutral-600 uppercase">Telegram ID</label>
              <input
                type="text"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs mt-0.5 focus:border-amber-400 focus:outline-none font-mono"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            className="w-full py-1.5 rounded-lg bg-neutral-900 text-white font-bold text-xs flex items-center justify-center gap-1"
          >
            <Check className="w-3.5 h-3.5" /> Save Telegram Identity
          </button>
        </div>
      )}
    </div>
  );
};
