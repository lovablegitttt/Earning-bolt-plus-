import React, { useState } from 'react';
import { UserEarningsData, AdInteraction } from '../types';
import { Play, AlertCircle, CheckCircle2, ShieldCheck, Settings, ExternalLink, Radio, Zap } from 'lucide-react';
import { triggerHaptic } from '../lib/telegram';
import { AdsgramService, DEFAULT_ADSGRAM_BLOCK_ID } from '../lib/adsgram';

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

  const progressPercent = Math.min(
    100,
    (userData.todayAdsWatched / userData.dailyAdsLimit) * 100
  );

  const isLimitReached = userData.todayAdsWatched >= userData.dailyAdsLimit;
  const isSdkAvailable = AdsgramService.isAdsgramAvailable();

  const handleSaveBlockId = () => {
    AdsgramService.setBlockId(customBlockId.trim() || DEFAULT_ADSGRAM_BLOCK_ID);
    AdsgramService.setDebugMode(isDebug);
    setShowConfig(false);
    triggerHaptic('success');
  };

  const handleToggleDebug = (val: boolean) => {
    setIsDebug(val);
    AdsgramService.setDebugMode(val);
    triggerHaptic('light');
  };

  return (
    <div className="space-y-4 pb-24 px-4 animate-in fade-in duration-200">
      {/* Adsgram SDK Status Banner */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-neutral-900 text-white text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isSdkAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="font-semibold tracking-tight text-[11px]">
            Adsgram SDK {isSdkAvailable ? 'Connected' : 'Loaded'}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">
            {isDebug ? 'Debug Test Mode' : `Live Block: ${AdsgramService.getBlockId()}`}
          </span>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="text-amber-400 hover:text-amber-300 text-[11px] font-bold flex items-center gap-1 underline"
        >
          Configure
        </button>
      </div>

      {/* Main Action Container matching Screenshot 1 */}
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
            <span className="text-[10px] font-mono font-semibold">ID: {AdsgramService.getBlockId()}</span>
          </button>
        </div>

        <p className="text-xs text-neutral-500 font-medium mb-4">
          Complete and watch a short video ads and earn{' '}
          <span className="font-bold text-neutral-800">${userData.adsRewardPerView.toFixed(2)}</span>
        </p>

        {/* Adsgram Custom Block ID & Real Ads Config Drawer */}
        {showConfig && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" /> Official Adsgram Integration
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

            {/* Mode Switcher: Debug Test Ad vs Live Publisher Ad */}
            <div>
              <label className="text-[11px] font-bold text-neutral-800 block mb-1.5">
                Ads Delivery Mode:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleDebug(true)}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    isDebug
                      ? 'bg-amber-100/90 border-amber-400 text-amber-950 font-bold shadow-xs'
                      : 'bg-white border-neutral-200 text-neutral-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Zap className="w-3 h-3 text-amber-600" />
                    <span>Adsgram Test Ad</span>
                  </div>
                  <p className="text-[9px] text-neutral-500 font-normal mt-0.5">
                    Official SDK test video (always renders)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleDebug(false)}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    !isDebug
                      ? 'bg-amber-100/90 border-amber-400 text-amber-950 font-bold shadow-xs'
                      : 'bg-white border-neutral-200 text-neutral-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Radio className="w-3 h-3 text-emerald-600" />
                    <span>Live Publisher Ad</span>
                  </div>
                  <p className="text-[9px] text-neutral-500 font-normal mt-0.5">
                    Commercial campaigns from your Block ID
                  </p>
                </button>
              </div>
            </div>

            {/* Block ID Input */}
            <div>
              <label className="text-[11px] font-bold text-neutral-800 block mb-1">
                Adsgram Block ID:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customBlockId}
                  onChange={(e) => setCustomBlockId(e.target.value)}
                  placeholder="e.g. int-5441 or your block ID"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={handleSaveBlockId}
                  className="px-3.5 py-1.5 bg-neutral-900 text-white font-bold text-xs rounded-lg hover:bg-neutral-800"
                >
                  Apply
                </button>
              </div>
              <p className="text-[10px] text-amber-800/80 mt-1">
                Create or manage your Block IDs in the Adsgram Telegram Bot / Web Dashboard at adsgram.ai
              </p>
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

        {/* Watch Ad Interactive Card (Gold Border & Play Button) */}
        <div
          id="watch-ad-card"
          className="relative rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-[#ffffff] via-[#fffdf9] to-[#fbf7ed] p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              {/* Play Button Icon */}
              <button
                onClick={() => {
                  if (!isLimitReached && !isLoadingAd) {
                    triggerHaptic('medium');
                    onWatchAdClicked();
                  }
                }}
                disabled={isLimitReached || isLoadingAd}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#252836] to-[#12141c] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform disabled:opacity-50"
              >
                {isLoadingAd ? (
                  <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-5 h-5 fill-white ml-0.5 text-white" />
                )}
              </button>

              <div>
                <h3 className="font-bold text-sm text-neutral-900 leading-tight">
                  Watch Ad
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {isDebug ? 'Watch Adsgram Test Ad' : 'Watch Live Rewarded Ad'}
                </p>
              </div>
            </div>

            {/* Reward Pill */}
            <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-neutral-800 to-neutral-700 text-white font-black text-xs shadow-xs tracking-tight">
              +${userData.adsRewardPerView.toFixed(2)}
            </div>
          </div>

          {/* Progress Bar & Counter */}
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
        </div>

        {/* Status Pill matching Screenshot 1 */}
        <div className="mt-3 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-100/80 text-neutral-600 text-xs font-medium border border-neutral-200/50">
          <AlertCircle className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <span>
            {isLimitReached
              ? 'Daily ad limit reached. Come back tomorrow!'
              : 'Ready to earn with Adsgram'}
          </span>
        </div>

        {/* Statistics Cards (TOTAL WATCHED & TOTAL EARNED) */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-b from-[#fffefc] to-[#fcf8ee] p-3.5 text-left">
            <span className="text-[10px] font-bold tracking-wider text-amber-800/80 uppercase block">
              TOTAL WATCHED
            </span>
            <div className="text-xl font-extrabold text-neutral-900 mt-1 flex items-baseline gap-1">
              {userData.totalAdsWatched} <span className="text-xs font-normal text-neutral-500">ads</span>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-b from-[#fffefc] to-[#fcf8ee] p-3.5 text-left">
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
                      <span>Adsgram Rewarded Video Completed</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    </div>
                    <div className="text-[9px] text-neutral-400 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString()} • Block: {item.blockId} • Tx: {item.txHash.slice(0, 8)}...
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

