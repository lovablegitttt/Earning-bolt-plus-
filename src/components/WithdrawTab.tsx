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
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm">
            ₮
          </div>
        );
      case 'paypal':
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm">
            P
          </div>
        );
      case 'mobile':
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-sm">
            📲
          </div>
        );
      case 'ton':
        return (
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold text-sm">
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
        return 'Enter your USDT TRC20 wallet address';
      case 'paypal':
        return 'Enter your registered PayPal email account';
      case 'mobile':
        return 'Enter your mobile phone number with country code';
      case 'ton':
        return 'Enter your TON address from @wallet or Tonkeeper';
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
    <div className="space-y-4 pb-24 px-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-neutral-200/70">
        {/* Title matching Screenshot 4 */}
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-bold text-neutral-900 tracking-tight uppercase">
            Payment Method
          </h2>
        </div>

        {/* Payment Methods 3-Column Selector matching Screenshot 4 */}
        <div className="grid grid-cols-3 gap-2 mb-5">
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
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all text-center ${
                  isSelected
                    ? 'border-amber-400/90 bg-gradient-to-b from-[#fffbf0] to-[#fef8e7] shadow-xs'
                    : 'border-neutral-200/70 bg-white hover:bg-neutral-50 text-neutral-600'
                }`}
              >
                {getMethodIcon(m)}
                <span className={`text-[11px] font-bold mt-1.5 leading-tight ${isSelected ? 'text-neutral-900' : 'text-neutral-600'}`}>
                  {getMethodLabel(m)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Withdrawal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Field */}
          <div>
            <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wide block mb-1">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (e.g. 10.00)"
              className="w-full px-4 py-3 rounded-2xl border-2 border-neutral-200/90 bg-neutral-50/50 text-sm font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
            />
            <div className="text-[11px] text-neutral-500 font-medium mt-1 pl-1">
              Available balance:{' '}
              <span className="font-bold text-neutral-800">${userData.totalBalance.toFixed(2)}</span>
              {' '}• Min $10.00
            </div>
          </div>

          {/* Wallet Address / Account Field */}
          <div>
            <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wide block mb-1">
              Wallet Address / Account
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={getAddressPlaceholder()}
              className="w-full px-4 py-3 rounded-2xl border-2 border-neutral-200/90 bg-neutral-50/50 text-sm font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
            />
            <div className="text-[11px] text-neutral-500 font-medium mt-1 pl-1">
              {getAddressHint()}
            </div>
          </div>

          {/* Error / Success Feedback */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Withdrawal Request Button matching Screenshot 4 */}
          <button
            type="submit"
            id="submit-withdrawal-btn"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#292e3d] via-[#1b1f2b] to-[#12141c] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-[0.99] transition-transform disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 text-amber-400" />
                <span>Submit Withdrawal Request</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Withdrawal History Tracker */}
      {userData.withdrawals && userData.withdrawals.length > 0 && (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-neutral-200/70">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-3">
            Withdrawal History
          </h3>
          <div className="space-y-2">
            {userData.withdrawals.map((wd: WithdrawalRequest) => (
              <div
                key={wd.id}
                className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <span>${wd.amount.toFixed(2)}</span>
                    <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700 font-mono">
                      {wd.method}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                    {wd.address.slice(0, 10)}... • {new Date(wd.timestamp).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                  <Clock className="w-3 h-3" />
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
