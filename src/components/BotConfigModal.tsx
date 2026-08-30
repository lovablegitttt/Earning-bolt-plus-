import React, { useState, useEffect } from 'react';
import { Bot, Send, CheckCircle2, ShieldCheck, ExternalLink, Zap, RefreshCw, Smartphone, Copy, Check } from 'lucide-react';
import { triggerHaptic } from '../lib/telegram';

interface BotConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BotConfigModal: React.FC<BotConfigModalProps> = ({ isOpen, onClose }) => {
  const [botInfo, setBotInfo] = useState<{ username?: string; first_name?: string; id?: number } | null>(null);
  const [webhookInfo, setWebhookInfo] = useState<{ url?: string; has_custom_certificate?: boolean; pending_update_count?: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [testChatId, setTestChatId] = useState('1979711369');
  const [copied, setCopied] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bot/status');
      const data = await res.json();
      if (data.success) {
        setBotInfo(data.bot);
        setWebhookInfo(data.webhook);
      }
    } catch (err) {
      console.warn('Could not fetch bot status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const handleSetupWebhook = async () => {
    setLoading(true);
    setSyncStatus('Connecting bot to PayPlus Mini App...');
    triggerHaptic('medium');
    try {
      const res = await fetch('/api/bot/setup-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatus('✅ Bot connected! Interactive Welcome & Web App Menu button are now live!');
        triggerHaptic('success');
        await fetchStatus();
      } else {
        setSyncStatus(`Error: ${data.error || 'Failed to setup webhook'}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSyncStatus(`Connection error: ${msg}`);
    } finally {
      setLoading(false);
      setTimeout(() => setSyncStatus(null), 6000);
    }
  };

  const handleSendTestWelcome = async () => {
    if (!testChatId.trim()) return;
    setLoading(true);
    triggerHaptic('medium');
    try {
      const res = await fetch('/api/bot/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: testChatId.trim(),
          firstName: 'Player',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatus(`✅ Interactive Welcome Message delivered to Chat ID ${testChatId}!`);
        triggerHaptic('success');
      } else {
        setSyncStatus(`Send failed: ${data.error || data.result?.description || 'Ensure user has started the bot first'}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSyncStatus(`Send error: ${msg}`);
    } finally {
      setLoading(false);
      setTimeout(() => setSyncStatus(null), 6000);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    triggerHaptic('light');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-neutral-200 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">Telegram Bot Interactive Setup</h3>
              <p className="text-[10px] text-neutral-500">Welcome message & Mini App launch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          {/* Bot Credentials Box */}
          <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-neutral-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Telegram Bot API
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Connected
              </span>
            </div>
            <div className="text-[11px] text-neutral-600 space-y-1">
              <div>
                <span className="text-neutral-400">Bot:</span>{' '}
                <span className="font-semibold text-neutral-900">
                  {botInfo?.first_name || 'PayPlus Bolt Bot'} {botInfo?.username ? `(@${botInfo.username})` : ''}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Bot ID:</span>{' '}
                <span className="font-mono text-neutral-700">{botInfo?.id || '8742324772'}</span>
              </div>
            </div>
          </div>

          {/* Setup Action: 1-Click Webhook & Menu Button */}
          <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Activate Live /start Handler</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Enables interactive welcome cards and the <b>⚡️ Earn</b> Telegram menu button so users can tap to earn and launch the Mini App.
            </p>
            <button
              onClick={handleSetupWebhook}
              disabled={loading}
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs transition-colors shadow-sm"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Sync Bot Webhook & Menu Button</span>
            </button>
          </div>

          {/* Interactive Welcome Message Preview */}
          <div className="space-y-2">
            <label className="font-bold text-neutral-800 text-[11px] block">
              Interactive Message Preview:
            </label>
            <div className="p-3 bg-neutral-900 text-white rounded-2xl space-y-2.5 text-[11px]">
              <div className="leading-relaxed">
                ⚡️ <b>Welcome to PayPlus Bolt Earning!</b> ⚡️<br />
                Earn real rewards daily with Adsgram Video Ads, simple social tasks, and instant withdrawals.<br /><br />
                💰 <b>Earning Breakdown:</b><br />
                • <b>Watch Ads:</b> $0.30 per video<br />
                • <b>Daily Tasks:</b> $0.50 - $1.00<br />
                • <b>Referral Bonus:</b> $0.50 + 10% commission
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="w-full py-2 bg-amber-500 text-neutral-950 font-bold rounded-xl text-center flex items-center justify-center gap-1.5 shadow-sm">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>🚀 Open Mini App & Start Earning</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <div className="py-1.5 bg-white/10 rounded-lg text-center font-medium text-neutral-300">
                    📢 Join Channel
                  </div>
                  <div className="py-1.5 bg-white/10 rounded-lg text-center font-medium text-neutral-300">
                    💬 Support
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Dispatch to Chat */}
          <div className="space-y-1.5 pt-1">
            <label className="font-bold text-neutral-800 text-[11px] block">
              Send Test Message to Telegram Chat ID:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testChatId}
                onChange={(e) => setTestChatId(e.target.value)}
                placeholder="Telegram Chat ID (e.g. 1979711369)"
                className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={handleSendTestWelcome}
                disabled={loading || !testChatId.trim()}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>

          {/* Status feedback */}
          {syncStatus && (
            <div className="p-2.5 rounded-xl bg-neutral-100 text-neutral-900 text-[11px] font-medium border border-neutral-200">
              {syncStatus}
            </div>
          )}

          {/* Bot Direct Link */}
          {botInfo?.username && (
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
              <a
                href={`https://t.me/${botInfo.username}`}
                target="_blank"
                rel="noreferrer"
                className="text-amber-700 hover:underline flex items-center gap-1 font-bold text-[11px]"
              >
                Open @{botInfo.username} in Telegram <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => handleCopy(`https://t.me/${botInfo.username}`)}
                className="text-neutral-500 hover:text-neutral-800 flex items-center gap-1 text-[10px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy link'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
