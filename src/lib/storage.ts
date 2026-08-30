import { UserEarningsData, AdInteraction, WithdrawalRequest, TaskItem } from '../types';

const STORAGE_PREFIX = 'bolt_earning_user_';

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Join Channels',
    description: 'Earn $0.10 per channel',
    reward: 0.10,
    type: 'channel',
    currentProgress: 0,
    maxProgress: 4,
    link: 'https://t.me/Bolt_Earning_Bot',
    completed: false,
  },
  {
    id: 'task-2',
    title: 'Start Bots',
    description: 'Earn $0.10 per bot',
    reward: 0.10,
    type: 'bot',
    currentProgress: 1,
    maxProgress: 10,
    link: 'https://t.me/Bolt_Earning_Bot',
    completed: false,
  },
  {
    id: 'task-3',
    title: 'Subscribe Channel',
    description: 'Earn $0.10 for subscribing',
    reward: 0.10,
    type: 'youtube',
    currentProgress: 0,
    maxProgress: 1,
    link: 'https://t.me/Bolt_Earning_Bot',
    completed: false,
  },
  {
    id: 'task-4',
    title: 'Follow Official Updates',
    description: 'Earn $0.15 for staying updated',
    reward: 0.15,
    type: 'channel',
    currentProgress: 0,
    maxProgress: 1,
    link: 'https://t.me/Bolt_Earning_Bot',
    completed: false,
  }
];

export function getStoredUserData(userId: string, defaultName: string = 'User'): UserEarningsData {
  if (typeof window === 'undefined') {
    return createDefaultUserData(userId, defaultName);
  }

  const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
  if (!raw) {
    const fresh = createDefaultUserData(userId, defaultName);
    saveUserData(fresh);
    return fresh;
  }

  try {
    const data: UserEarningsData = JSON.parse(raw);
    // Check if daily counter needs reset (if lastAdTimestamp was yesterday)
    const today = new Date().toDateString();
    const lastDate = data.lastAdTimestamp ? new Date(data.lastAdTimestamp).toDateString() : today;
    if (today !== lastDate) {
      data.todayAdsWatched = 0;
    }
    return data;
  } catch {
    const fresh = createDefaultUserData(userId, defaultName);
    saveUserData(fresh);
    return fresh;
  }
}

export function saveUserData(data: UserEarningsData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_PREFIX}${data.userId}`, JSON.stringify(data));
  // Dispatch custom event for real-time reactivity across components
  window.dispatchEvent(new CustomEvent('bolt_earnings_updated', { detail: data }));
}

function createDefaultUserData(userId: string, name: string): UserEarningsData {
  return {
    userId,
    name,
    totalBalance: 0.40, // As in screenshot default
    totalAdsWatched: 1,
    totalAdsEarned: 0.30,
    todayAdsWatched: 0,
    dailyAdsLimit: 15,
    adsRewardPerView: 0.30,
    friendsInvited: 0,
    earnedFromInvites: 0.00,
    referralCode: userId,
    completedTasks: [],
    history: [
      {
        id: 'ad-init-1',
        timestamp: Date.now() - 1000 * 60 * 15,
        rewardAmount: 0.30,
        adType: 'rewarded_video',
        adProvider: 'Adsgram',
        status: 'completed',
        txHash: '0x' + Math.random().toString(16).substring(2, 10).toUpperCase(),
        blockId: 'int-45220',
      }
    ],
    withdrawals: [],
    lastAdTimestamp: Date.now() - 1000 * 60 * 15,
  };
}

export function recordAdCompletion(
  userId: string,
  reward: number = 0.30,
  blockId: string = 'int-45220'
): { user: UserEarningsData; interaction: AdInteraction } {
  const current = getStoredUserData(userId);

  const interaction: AdInteraction = {
    id: `ad-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: Date.now(),
    rewardAmount: reward,
    adType: 'rewarded_video',
    adProvider: 'Adsgram',
    status: 'completed',
    txHash: '0x' + Math.random().toString(16).substring(2, 14).toUpperCase(),
    blockId,
  };

  const updated: UserEarningsData = {
    ...current,
    totalBalance: Number((current.totalBalance + reward).toFixed(2)),
    totalAdsWatched: current.totalAdsWatched + 1,
    todayAdsWatched: current.todayAdsWatched + 1,
    totalAdsEarned: Number((current.totalAdsEarned + reward).toFixed(2)),
    lastAdTimestamp: Date.now(),
    history: [interaction, ...(current.history || [])],
  };

  saveUserData(updated);
  return { user: updated, interaction };
}

export function requestWithdrawal(
  userId: string,
  amount: number,
  method: 'usdt' | 'paypal' | 'mobile' | 'ton',
  address: string
): { success: boolean; message: string; updatedUser?: UserEarningsData } {
  const user = getStoredUserData(userId);

  if (amount < 10) {
    return { success: false, message: 'Minimum withdrawal amount is $10.00' };
  }

  if (user.totalBalance < amount) {
    return { success: false, message: 'Insufficient balance for this withdrawal' };
  }

  if (!address.trim()) {
    return { success: false, message: 'Please provide a valid destination address or account' };
  }

  const newWithdrawal: WithdrawalRequest = {
    id: `wd-${Date.now()}`,
    timestamp: Date.now(),
    amount: amount,
    method,
    address,
    status: 'pending',
    txId: 'WD' + Math.floor(100000 + Math.random() * 900000),
  };

  const updated: UserEarningsData = {
    ...user,
    totalBalance: Number((user.totalBalance - amount).toFixed(2)),
    withdrawals: [newWithdrawal, ...(user.withdrawals || [])],
  };

  saveUserData(updated);
  return { success: true, message: 'Withdrawal request submitted successfully!', updatedUser: updated };
}
