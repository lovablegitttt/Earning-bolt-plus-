import React from 'react';
import { Globe, Check, X } from 'lucide-react';
import { triggerHaptic } from '../lib/telegram';

interface LanguageModalProps {
  isOpen: boolean;
  currentLanguage: string;
  onSelectLanguage: (lang: string) => void;
  onClose: () => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Русский (Russian)', flag: '🇷🇺' },
  { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
  { code: 'uz', name: 'Oʻzbek (Uzbek)', flag: '🇺🇿' },
  { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦' },
];

export const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  currentLanguage,
  onSelectLanguage,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl neu-glass-card border border-white p-5 text-neutral-900 shadow-[0_20px_60px_rgba(0,80,200,0.15)]">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,1),2px_2px_6px_rgba(0,80,200,0.08)] border border-white">
              <Globe className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-neutral-900 leading-tight">
                Select Language
              </h3>
              <p className="text-[10px] text-neutral-500 font-medium">Choose your preferred language</p>
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

        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {LANGUAGES.map((lang) => {
            const isSelected = currentLanguage === lang.name || currentLanguage === lang.name.split(' ')[0];
            return (
              <button
                key={lang.code}
                onClick={() => {
                  triggerHaptic('light');
                  onSelectLanguage(lang.name.split(' ')[0]);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'border border-blue-500 bg-blue-50/80 text-blue-900 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),2px_4px_10px_rgba(0,102,238,0.12)] ring-2 ring-blue-500/20'
                    : 'neu-stat-tile hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-600 font-bold" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
