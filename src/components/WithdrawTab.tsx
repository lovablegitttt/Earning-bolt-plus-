import React, { useState } from 'react';
import { UserEarningsData, PaymentMethod, WithdrawalRequest } from '../types';
import { Wallet, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { triggerHaptic } from '../lib/telegram';
import { requestWithdrawal } from '../lib/storage';

interface WithdrawTabProps {
  userData: UserEarningsData;
  onWithdrawalCreated: (updatedUser: UserEarningsData) => void;
}

export const WithdrawTab: React.FC<WithdrawTabProps> = ({
  userData,
  onWithdrawalCreated,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('usdt');
  const [amount, setAmount] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getMethodIcon = (m: PaymentMethod) => {
    switch (m) {
      case 'usdt':
        return (
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-base shadow-2xs">
            ₮
          </div>
        );
      case 'paypal':
        return (
          <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-base shadow-2xs">
            P
          </div>
        );
      case 'mobile':
        return (
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-base shadow-2xs">
            📱
          </div>
        );
      case 'ton':
        return (
          <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold text-base shadow-2xs">
            💎
          </div>
        );
    }
  };

  const getMethodLabel = (m: PaymentMethod) => {
    switch (m) {
      case 'usdt':
        return 'USDT TRC20';
      case 'paypal':
        return 'PayPal';
      case 'mobile':
        return 'Mobile Top-Up';
      case 'ton':
        return 'TON Wallet';
    }
  };

  const getAddressPlaceholder = () => {
    switch (method) {
      case 'usdt':
        return 'e.g. TXyz...abc (TRC20 Address)';
      case 'paypal':
        return 'e.g. user@paypal.com (Email)';
      case 'mobile':
        return 'e.g. +1234567890 (Phone Number & Carrier)';
      case 'ton':
        return 'e.g. EQ... or telegram.ton';
    }
  };

  const getAddressHint = () => {
    switch (method) {
      case 'usdt':
        return 'Enter your USDT TRC20 destination wallet address';
      case 'paypal':
        return 'Enter your verified PayPal account email';
      case 'mobile':
        return 'Enter your mobile phone number with country dial code';
      case 'ton':
        return 'Enter your TON address from Tonkeeper or @wallet';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid withdrawal amount.');
      triggerHaptic('error');
      return;
    }

    if (parsedAmount < 10) {
      setErrorMsg('Minimum withdrawal amount is $10.00.');
      triggerHaptic('error');
      return;
    }

    if (userData.totalBalance < parsedAmount) {
      setErrorMsg(`Insufficient balance. You currently have $${userData.totalBalance.toFixed(2)}.`);
      triggerHaptic('error');
      return;
    }

    if (!address.trim()) {
      setErrorMsg('Please enter your destination wallet or account detail.');
      triggerHaptic('error');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic('medium');

    setTimeout(() => {
      const res = requestWithdrawal(userData.userId, parsedAmount, method, address);
      setIsSubmitting(false);

      if (res.success && res.updatedUser) {
        setSuccessMsg('Withdrawal submitted successfully! Processing in 1-24 hours.');
        setAmount('');
        setAddress('');
        onWithdrawalCreated(res.updatedUser);
        triggerHaptic('success');
      } else {
        setErrorMsg(res.message);
        triggerHaptic('error');
      }
    }, 1200);
  };

  return (
    <div className="space-y-4 pb-28 px-4 animate-in fade-in duration-200">
      <div className="neu-glass-card rounded-3xl p-5">
        {/* Title */}
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,1),2px_2px_6px_rgba(0,80,200,0.08)] border border-white">
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">
              Cashout & Payouts
            </h2>
            <p className="text-[11px] text-neutral-500 font-medium">
              Choose your preferred cashout method
            </p>
          </div>
        </div>

        {/* Payment Methods 3-Column Selector with Neumorphic Relief */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {(['usdt', 'paypal', 'mobile'] as PaymentMethod[]).map((m) => {
            const isSelected = method === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setMethod(m);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),2px_4px_12px_rgba(0,102,238,0.15)] ring-2 ring-blue-500/20'
                    : 'neu-stat-tile hover:bg-neutral-50 text-neutral-600'
                }`}
              >
                {getMethodIcon(m)}
                <span className={`text-[11px] font-bold mt-2 leading-tight ${isSelected ? 'text-blue-700' : 'text-neutral-700'}`}>
                  {getMethodLabel(m)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Withdrawal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Field with Neumorphic Inset Well */}
          <div>
            <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wide block mb-1">
              Amount (USD)
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 10.00"
              className="w-full px-4 py-3.5 rounded-2xl neu-inset-well text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-neutral-900"
            />
            <div className="text-[11px] text-neutral-500 font-medium mt-1.5 pl-1 flex items-center justify-between">
              <span>Available: <strong className="text-neutral-900 font-bold">${userData.totalBalance.toFixed(2)}</strong></span>
              <span className="text-blue-600 font-bold">Min $10.00</span>
            </div>
          </div>

          {/* Wallet Address / Account Field with Neumorphic Inset Well */}
          <div>
            <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wide block mb-1">
              Destination Address / Account
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={getAddressPlaceholder()}
              className="w-full px-4 py-3.5 rounded-2xl neu-inset-well text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-neutral-900"
            />
            <div className="text-[11px] text-neutral-500 font-medium mt-1.5 pl-1">
              {getAddressHint()}
            </div>
          </div>

          {/* Error / Success Feedback */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 shadow-2xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Withdrawal Request Button */}
          <button
            type="submit"
            id="submit-withdrawal-btn"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl neu-glass-btn text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 text-white" />
                <span>Submit Cashout Request</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Withdrawal History Tracker */}
      {userData.withdrawals && userData.withdrawals.length > 0 && (
        <div className="neu-glass-card rounded-3xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-3">
            Withdrawal History
          </h3>
          <div className="space-y-2">
            {userData.withdrawals.map((wd: WithdrawalRequest) => (
              <div
                key={wd.id}
                className="p-3.5 rounded-2xl bg-white/90 border border-white flex items-center justify-between text-xs shadow-[2px_2px_8px_rgba(0,70,180,0.04)]"
              >
                <div>
                  <div className="font-extrabold text-neutral-900 flex items-center gap-1.5 text-sm">
                    <span>${wd.amount.toFixed(2)}</span>
                    <span className="uppercase text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100">
                      {wd.method}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400 font-medium mt-0.5">
                    {wd.address.slice(0, 12)}... • {new Date(wd.timestamp).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/80 shadow-2xs">
                  <Clock className="w-3 h-3 text-blue-600" />
                  <span className="capitalize">{wd.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
