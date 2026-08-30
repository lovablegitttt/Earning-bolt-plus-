import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, ShieldCheck, X, Sparkles, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { triggerHaptic } from '../lib/telegram';

interface AdPlayerModalProps {
  isOpen: boolean;
  rewardAmount: number;
  onAdCompleted: () => void;
  onClose: () => void;
}

const SAMPLE_ADS = [
  {
    title: 'TonKeeper Wallet & DeFi',
    tagline: 'Secure your crypto assets and explore the TON ecosystem in Telegram',
    badge: 'TON Ecosystem',
    bgGradient: 'from-sky-950 via-slate-900 to-sky-900',
    videoThumb: '💎',
  },
  {
    title: 'Adsgram Network Partner',
    tagline: 'Monetize your Telegram Mini App with high-converting native video ads',
    badge: 'Adsgram Official',
    bgGradient: 'from-amber-950 via-neutral-900 to-yellow-950',
    videoThumb: '⚡',
  },
  {
    title: 'Binance Pay Integration',
    tagline: 'Instant zero-fee borderless crypto payments for all Telegram users',
    badge: 'Crypto Partner',
    bgGradient: 'from-yellow-950 via-stone-900 to-amber-900',
    videoThumb: '🪙',
  }
];

export const AdPlayerModal: React.FC<AdPlayerModalProps> = ({
  isOpen,
  rewardAmount,
  onAdCompleted,
  onClose,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [adIndex, setAdIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(15);
      setIsCompleted(false);
      setAdIndex(Math.floor(Math.random() * SAMPLE_ADS.length));

      const timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsCompleted(true);
            triggerHaptic('success');
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
              });
            } catch {
              // ignore
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentAd = SAMPLE_ADS[adIndex];
  const progressPercent = ((15 - secondsLeft) / 15) * 100;

  const handleClaim = () => {
    onAdCompleted();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-700 shadow-2xl text-white">
        {/* Top Ad Header Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-amber-400 text-neutral-950 font-black">
              ADSGRAM
            </span>
            <span className="text-xs font-semibold text-neutral-300">
              {currentAd.badge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-neutral-300 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {isCompleted ? (
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-neutral-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-mono font-bold text-amber-400 border border-amber-400/30">
                Reward in {secondsLeft}s
              </div>
            )}
          </div>
        </div>

        {/* Video Canvas Simulation */}
        <div className={`relative h-96 bg-gradient-to-br ${currentAd.bgGradient} flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden`}>
          {/* Animated Glow Elements */}
          <div className="w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-5xl mb-4 shadow-2xl animate-bounce">
            {currentAd.videoThumb}
          </div>

          <h3 className="text-xl font-black text-white tracking-tight mb-2 max-w-[240px]">
            {currentAd.title}
          </h3>
          <p className="text-xs text-neutral-300/90 leading-relaxed max-w-[260px] font-medium">
            {currentAd.tagline}
          </p>

          <div className="mt-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] text-amber-300 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Telegram Adsgram Stream</span>
          </div>
        </div>

        {/* Progress Bar at Bottom of Video */}
        <div className="w-full h-1 bg-neutral-800">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Bottom Reward Claim Actions */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800">
          {isCompleted ? (
            <button
              onClick={handleClaim}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-neutral-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Claim +${rewardAmount.toFixed(2)} Reward</span>
            </button>
          ) : (
            <div className="flex items-center justify-between text-xs text-neutral-400 px-2 py-2">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Watching rewarded ad...
              </span>
              <span className="font-mono text-amber-400 font-bold">
                {Math.round(progressPercent)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
