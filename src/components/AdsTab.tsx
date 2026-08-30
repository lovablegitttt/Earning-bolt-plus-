import React, { useState, useEffect } from 'react';
import { UserEarningsData, AdInteraction } from '../types';
import { Play, AlertCircle, CheckCircle2, ShieldCheck, Settings, ExternalLink, Timer, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../lib/telegram';
import { AdsgramService, DEFAULT_ADSGRAM_BLOCK_ID, AD_COOLDOWN_SECONDS } from '../lib/adsgram';

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
  const [showConfig, setShowConfig] = useState(false);
  const [customBlockId, setCustomBlockId] = useState(AdsgramService.getBlockId());
  const [isDebug, setIsDebug] = useState(AdsgramService.isDebugMode());
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
  const isSdkAvailable = AdsgramService.isAdsgramAvailable();

  const handleSaveBlockId = (idToSave?: string) => {
    const id = (idToSave || customBlockId).trim() || DEFAULT_ADSGRAM_BLOCK_ID;
    setCustomBlockId(id);
    AdsgramService.setBlockId(id);
    AdsgramService.setDebugMode(isDebug);
    setShowConfig(false);
    triggerHaptic('success');
  };

  const handleToggleDebug = (val: boolean) => {
    setIsDebug(val);
    AdsgramService.setDebugMode(val);
    triggerHaptic('light');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 pb-24 px-4 animate-in fade-in duration-200">
      {/* Adsgram SDK Status Banner */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-neutral-900 text-white text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isSdkAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="font-semibold tracking-tight text-[11px]">
            Adsgram SDK {isSdkAvailable ? 'Connected' : 'Active'}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">
            {isDebug ? 'Debug Mode' : `Block: ${AdsgramService.getBlockId()}`}
          </span>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="text-amber-400 hover:text-amber-300 text-[11px] font-bold flex items-center gap-1 underline"
        >
          Configure
        </button>
      </div>

      {/* Main Action Container */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-neutral-200/70">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-neutral-900 tracking-tight">
            Watch Ads & Earn
          </h2>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="text-neutral-500 hover:text-neutral-800 text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100/90 font-medium"
            title="Adsgram Block Configuration"
          >
            <Settings className="w-3.5 h-3.5 text-neutral-600" />
            <span className="text-[10px] font-mono font-semibold">
              {AdsgramService.getBlockId()}
            </span>
          </button>
        </div>

        <p className="text-xs text-neutral-500 font-medium mb-4">
          Watch a full Adsgram rewarded video and earn{' '}
          <span className="font-bold text-neutral-800">${userData.adsRewardPerView.toFixed(2)}</span>
        </p>

        {/* Adsgram Custom Block ID Config Drawer */}
        {showConfig && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" /> Official Adsgram Network (int-45220)
              </span>
              <a
                href="https://adsgram.ai"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-amber-700 hover:underline flex items-center gap-0.5 font-bold"
              >
                adsgram.ai <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Debug Mode Switcher */}
            <div className="flex items-center justify-between bg-white/80 p-2 rounded-xl border border-amber-200/60">
              <div>
                <div className="font-bold text-[11px] text-neutral-800">Adsgram Debug Test Mode</div>
                <div className="text-[9px] text-neutral-500">Test ad completion without consuming live ad fills</div>
              </div>
              <button
                type="button"
                onClick={() => handleToggleDebug(!isDebug)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  isDebug ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {isDebug ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Block ID Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-neutral-800">
                  Adsgram Rewarded Block ID:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCustomBlockId(DEFAULT_ADSGRAM_BLOCK_ID);
                    handleSaveBlockId(DEFAULT_ADSGRAM_BLOCK_ID);
                  }}
                  className="text-[10px] text-amber-800 hover:underline font-semibold"
                >
                  Reset Default (int-45220)
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customBlockId}
                  onChange={(e) => setCustomBlockId(e.target.value)}
                  placeholder="e.g. int-45220"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={() => handleSaveBlockId(customBlockId)}
                  className="px-3.5 py-1.5 bg-neutral-900 text-white font-bold text-xs rounded-lg hover:bg-neutral-800"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback / Alert Notice */}
        {feedbackMessage && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium animate-in fade-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Watch Ad Interactive Card */}
        <div
          id="watch-ad-card"
          className={`relative rounded-2xl border-2 transition-all p-4 shadow-sm ${
            isCooldownActive
              ? 'border-amber-200 bg-gradient-to-br from-[#fffefc] to-[#fcf8f0]'
              : 'border-amber-300/80 bg-gradient-to-br from-[#ffffff] via-[#fffdf9] to-[#fef8eb]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              {/* Play Button Icon with 1-Min Cooldown countdown */}
              <button
                onClick={() => {
                  if (!isLimitReached && !isLoadingAd && !isCooldownActive) {
                    triggerHaptic('medium');
                    onWatchAdClicked();
                  }
                }}
                disabled={isLimitReached || isLoadingAd || isCooldownActive}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all ${
                  isCooldownActive
                    ? 'bg-amber-100 border border-amber-300 text-amber-700 cursor-not-allowed'
                    : 'bg-gradient-to-br from-[#d97706] to-[#b45309] text-white hover:brightness-105'
                } disabled:opacity-80`}
              >
                {isLoadingAd ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isCooldownActive ? (
                  <Timer className="w-5 h-5 text-amber-700 animate-pulse" />
                ) : (
                  <Play className="w-5 h-5 fill-white ml-0.5 text-white" />
                )}
              </button>

              <div>
                <h3 className="font-bold text-sm text-neutral-900 leading-tight flex items-center gap-1.5">
                  <span>Watch Video Ad</span>
                  {!isCooldownActive && !isLimitReached && (
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {isCooldownActive ? (
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <Timer className="w-3 h-3" /> Cooldown: {formatTimer(cooldownRemaining)}
                    </span>
                  ) : (
                    'Adsgram Rewarded (int-45220)'
                  )}
                </p>
              </div>
            </div>

            {/* Reward Pill */}
            <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-neutral-950 font-black text-xs shadow-xs tracking-tight">
              +${userData.adsRewardPerView.toFixed(2)}
            </div>
          </div>

          {/* 1-Minute Cooldown Progress Bar if active */}
          {isCooldownActive ? (
            <div className="mt-3.5 pt-3 border-t border-amber-200/60">
              <div className="flex items-center justify-between text-[11px] font-semibold text-amber-800 mb-1">
                <span className="flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5" /> Next ad ready in:
                </span>
                <span className="font-mono text-amber-950 font-bold">
                  {formatTimer(cooldownRemaining)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-amber-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-1000 rounded-full"
                  style={{
                    width: `${((AD_COOLDOWN_SECONDS - cooldownRemaining) / AD_COOLDOWN_SECONDS) * 100}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            /* Standard Daily Progress Bar */
            <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-col gap-1.5">
              <div className="w-full h-1.5 bg-neutral-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-right text-[11px] font-semibold text-neutral-500">
                {userData.todayAdsWatched} / {userData.dailyAdsLimit} today
              </div>
            </div>
          )}
        </div>

        {/* Status Pill */}
        <div className="mt-3 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-100/80 text-neutral-600 text-xs font-medium border border-neutral-200/50">
          <AlertCircle className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <span>
            {isLimitReached
              ? 'Daily ad limit reached. Come back tomorrow!'
              : isCooldownActive
              ? `Cooling period active (1 min). Please wait ${cooldownRemaining}s.`
              : 'Ready to earn with Adsgram'}
          </span>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-b from-[#fffefc] to-[#fbf8f2] p-3.5 text-left">
            <span className="text-[10px] font-bold tracking-wider text-amber-800/80 uppercase block">
              TOTAL WATCHED
            </span>
            <div className="text-xl font-extrabold text-neutral-900 mt-1 flex items-baseline gap-1">
              {userData.totalAdsWatched} <span className="text-xs font-normal text-neutral-500">ads</span>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-b from-[#fffefc] to-[#fbf8f2] p-3.5 text-left">
            <span className="text-[10px] font-bold tracking-wider text-amber-800/80 uppercase block">
              TOTAL EARNED
            </span>
            <div className="text-xl font-extrabold text-neutral-900 mt-1">
              ${userData.totalAdsEarned.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Interaction Feed & Anti-Cheat Verified Log */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-neutral-200/70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Live Interaction Updates
            </h3>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Real-Time Verified
          </span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {userData.history && userData.history.length > 0 ? (
            userData.history.slice(0, 5).map((item: AdInteraction) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px]">
                    AD
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900 text-[11px] flex items-center gap-1">
                      <span>Adsgram Video Completed</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    </div>
                    <div className="text-[9px] text-neutral-400 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString()} • Block: {item.blockId || 'int-45220'} • Tx: {item.txHash.slice(0, 8)}...
                    </div>
                  </div>
                </div>
                <div className="font-extrabold text-emerald-600 text-xs">
                  +${item.rewardAmount.toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-xs text-neutral-400">
              No ad interactions logged yet. Watch your first ad above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
