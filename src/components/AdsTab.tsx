import React, { useState, useEffect } from 'react';
import { UserEarningsData, AdInteraction } from '../types';
import { Play, CheckCircle2, Timer, Sparkles, ShieldCheck, Flame, Eye } from 'lucide-react';
import { triggerHaptic } from '../lib/telegram';
import { AdsgramService, AD_COOLDOWN_SECONDS } from '../lib/adsgram';

interface AdsTabProps {
  userData: UserEarningsData;
  onWatchAdClicked: () => void;
  isLoadingAd: boolean;
  feedbackMessage?: string | null;
}

export const AdsTab: React.FC<AdsTabProps> = ({
  userData,
  onWatchAdClicked,
  isLoadingAd,
  feedbackMessage,
}) => {
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // 1-minute (60 seconds) cooldown timer calculation
  useEffect(() => {
    const updateCooldown = () => {
      if (!userData.lastAdTimestamp) {
        setCooldownRemaining(0);
        return;
      }
      const elapsed = Date.now() - userData.lastAdTimestamp;
      const cooldownMs = AD_COOLDOWN_SECONDS * 1000;
      if (elapsed < cooldownMs) {
        setCooldownRemaining(Math.ceil((cooldownMs - elapsed) / 1000));
      } else {
        setCooldownRemaining(0);
      }
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [userData.lastAdTimestamp]);

  const progressPercent = Math.min(
    100,
    (userData.todayAdsWatched / userData.dailyAdsLimit) * 100
  );

  const isLimitReached = userData.todayAdsWatched >= userData.dailyAdsLimit;
  const isCooldownActive = cooldownRemaining > 0;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 pb-28 px-4 animate-in fade-in duration-200">
      {/* Main Neu-Glass Card */}
      <div className="neu-glass-card rounded-3xl p-5">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,1),2px_2px_6px_rgba(0,80,200,0.08)] border border-white">
              <Eye className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">
                Watch Ads & Earn
              </h2>
              <p className="text-[11px] text-neutral-500 font-medium">
                Earn <span className="font-bold text-blue-600">${userData.adsRewardPerView.toFixed(2)}</span> per video
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-blue-50/90 text-blue-700 font-bold text-[10px] border border-blue-200/80 shadow-2xs">
            Rewarded
          </span>
        </div>

        {/* Feedback / Alert Notice */}
        {feedbackMessage && (
          <div className="my-3 px-3.5 py-2.5 rounded-2xl bg-emerald-50/95 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Interactive Play Video Card with Neumorphic Layering */}
        <div
          id="watch-ad-card"
          className={`relative mt-4 rounded-3xl border transition-all p-5 ${
            isCooldownActive
              ? 'border-blue-100 bg-gradient-to-b from-blue-50/40 via-white/80 to-white shadow-[inset_0_2px_4px_rgba(0,102,238,0.03),3px_4px_16px_rgba(0,0,0,0.02)]'
              : 'border-blue-200/90 bg-gradient-to-br from-white via-blue-50/40 to-sky-50/60 shadow-[4px_6px_20px_-2px_rgba(0,80,200,0.08),inset_0_1px_1px_rgba(255,255,255,1)] hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              {/* Neumorphic 3D Play Button */}
              <button
                onClick={() => {
                  if (!isLimitReached && !isLoadingAd && !isCooldownActive) {
                    triggerHaptic('medium');
                    onWatchAdClicked();
                  }
                }}
                disabled={isLimitReached || isLoadingAd || isCooldownActive}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  isCooldownActive
                    ? 'neu-inset-well text-neutral-400 cursor-not-allowed'
                    : 'neu-glass-btn text-white'
                } disabled:opacity-80`}
              >
                {isLoadingAd ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isCooldownActive ? (
                  <Timer className="w-6 h-6 text-neutral-400 animate-pulse" />
                ) : (
                  <Play className="w-6 h-6 fill-white ml-0.5 text-white" />
                )}
              </button>

              <div>
                <h3 className="font-extrabold text-sm text-neutral-900 leading-tight flex items-center gap-1.5">
                  <span>Sponsored Video Ad</span>
                  {!isCooldownActive && !isLimitReached && (
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </h3>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  {isCooldownActive ? (
                    <span className="text-blue-600 font-semibold flex items-center gap-1">
                      <Timer className="w-3 h-3" /> Ready in {formatTimer(cooldownRemaining)}
                    </span>
                  ) : (
                    'Instant verified reward credit'
                  )}
                </p>
              </div>
            </div>

            {/* Apple Neu-Glass Reward Pill */}
            <div className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-extrabold text-xs shadow-[2px_3px_8px_rgba(0,102,238,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] tracking-tight">
              +${userData.adsRewardPerView.toFixed(2)}
            </div>
          </div>

          {/* 1-Minute Cooldown Progress Bar in Debossed Well */}
          {isCooldownActive ? (
            <div className="mt-4 pt-3.5 border-t border-blue-100/80">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-700 mb-1.5">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Timer className="w-3.5 h-3.5" /> Cooldown Active
                </span>
                <span className="font-mono text-neutral-900 font-bold text-xs">
                  {formatTimer(cooldownRemaining)}
                </span>
              </div>
              <div className="w-full h-2.5 neu-inset-well rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-1000 rounded-full shadow-xs"
                  style={{
                    width: `${((AD_COOLDOWN_SECONDS - cooldownRemaining) / AD_COOLDOWN_SECONDS) * 100}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            /* Daily Progress Bar in Debossed Well */
            <div className="mt-4 pt-3.5 border-t border-neutral-100 flex flex-col gap-1.5">
              <div className="w-full h-2.5 neu-inset-well rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-500 rounded-full shadow-xs"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-right text-[11px] font-bold text-neutral-500">
                {userData.todayAdsWatched} of {userData.dailyAdsLimit} watched today
              </div>
            </div>
          )}
        </div>

        {/* Neumorphic Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-2xl neu-stat-tile p-4 text-left">
            <span className="text-[10px] font-bold tracking-wider text-blue-800 uppercase block">
              TOTAL WATCHED
            </span>
            <div className="text-2xl font-black text-neutral-900 mt-1 flex items-baseline gap-1">
              {userData.totalAdsWatched} <span className="text-xs font-medium text-neutral-400">videos</span>
            </div>
          </div>

          <div className="rounded-2xl neu-stat-tile p-4 text-left">
            <span className="text-[10px] font-bold tracking-wider text-blue-800 uppercase block">
              TOTAL REWARDED
            </span>
            <div className="text-2xl font-black text-neutral-900 mt-1 text-blue-600">
              ${userData.totalAdsEarned.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <div className="neu-glass-card rounded-3xl p-5">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Live Verified Activity
            </h3>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Real-Time
          </span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {userData.history && userData.history.length > 0 ? (
            userData.history.slice(0, 5).map((item: AdInteraction) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/90 border border-white text-xs shadow-[2px_2px_8px_rgba(0,70,180,0.04)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100 shadow-2xs">
                    <Play className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900 text-xs flex items-center gap-1">
                      <span>Rewarded Video Completed</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="text-[10px] text-neutral-400 font-medium">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Instant payout
                    </div>
                  </div>
                </div>
                <div className="font-black text-blue-600 text-xs">
                  +${item.rewardAmount.toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-5 text-xs text-neutral-400 font-medium">
              No recent activity yet. Tap "Watch Video Ad" above to start earning!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
