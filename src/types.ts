export interface TelegramUser {
  id: number | string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  is_premium?: boolean;
  allows_write_to_pm?: boolean;
}

export interface AdInteraction {
  id: string;
  timestamp: number;
  rewardAmount: number;
  adType: 'rewarded_video' | 'interstitial' | 'sponsored_task';
  adProvider: 'Adsgram';
  status: 'completed' | 'verified';
  txHash: string;
  blockId: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'channel' | 'bot' | 'youtube' | 'sponsor';
  currentProgress: number;
  maxProgress: number;
  link: string;
  completed: boolean;
  verifying?: boolean;
}

export interface WithdrawalRequest {
  id: string;
  timestamp: number;
  amount: number;
  method: 'usdt' | 'paypal' | 'mobile' | 'ton';
  address: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  txId?: string;
}

export interface UserEarningsData {
  userId: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  totalBalance: number;
  totalAdsWatched: number;
  totalAdsEarned: number;
  todayAdsWatched: number;
  dailyAdsLimit: number;
  adsRewardPerView: number;
  friendsInvited: number;
  earnedFromInvites: number;
  referralCode: string;
  completedTasks: string[];
  history: AdInteraction[];
  withdrawals: WithdrawalRequest[];
  lastAdTimestamp: number | null;
}

export type TabType = 'ads' | 'tasks' | 'invite' | 'withdraw';
export type PaymentMethod = 'usdt' | 'paypal' | 'mobile' | 'ton';
