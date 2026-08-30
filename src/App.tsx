import React, { useState, useEffect, useCallback } from 'react';
import { TabType, UserEarningsData, TaskItem } from './types';
import { getTelegramUser, getStartParam, triggerHaptic } from './lib/telegram';
import { getStoredUserData, recordAdCompletion, saveUserData } from './lib/storage';
import { AdsgramService } from './lib/adsgram';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AdsTab } from './components/AdsTab';
import { TasksTab } from './components/TasksTab';
import { InviteTab } from './components/InviteTab';
import { WithdrawTab } from './components/WithdrawTab';
import { SupportModal } from './components/SupportModal';
import { LanguageModal } from './components/LanguageModal';
import { BotConfigModal } from './components/BotConfigModal';
import { TelegramSessionBadge } from './components/TelegramSessionBadge';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('ads');
  const [language, setLanguage] = useState<string>('English');
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);
  const [showBotModal, setShowBotModal] = useState<boolean>(false);
  const [isLoadingAd, setIsLoadingAd] = useState<boolean>(false);

  // Authenticate & Load User
  const [userData, setUserData] = useState<UserEarningsData>(() => {
    const tgUser = getTelegramUser();
    if (tgUser) {
      const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || tgUser.username || 'Telegram User';
      const initial = getStoredUserData(String(tgUser.id), fullName);
      if (tgUser.photo_url) {
        initial.avatarUrl = tgUser.photo_url;
      }
      return initial;
    }
    // Default matching screenshot (Paul ID: 1979711369)
    return getStoredUserData('1979711369', 'Paul');
  });

  // Sync when Telegram WebApp provides data or start parameters
  useEffect(() => {
    const tgUser = getTelegramUser();
    if (tgUser) {
      const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || tgUser.username || 'Telegram User';
      const stored = getStoredUserData(String(tgUser.id), fullName);
      if (tgUser.photo_url) {
        stored.avatarUrl = tgUser.photo_url;
      }
      setUserData(stored);

      // Handle referral start parameter if invited
      const refParam = getStartParam();
      if (refParam && refParam !== String(tgUser.id)) {
        // give invitee welcome reward if fresh
        if (!localStorage.getItem(`bolt_ref_credited_${tgUser.id}`)) {
          localStorage.setItem(`bolt_ref_credited_${tgUser.id}`, 'true');
          const bonusUser: UserEarningsData = {
            ...stored,
            totalBalance: Number((stored.totalBalance + 0.50).toFixed(2)),
          };
          saveUserData(bonusUser);
          setUserData(bonusUser);
        }
      }
    }
  }, []);

  // Listen for real-time storage updates
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<UserEarningsData>;
      if (customEvent.detail && customEvent.detail.userId === userData.userId) {
        setUserData(customEvent.detail);
      }
    };
    window.addEventListener('bolt_earnings_updated', handleUpdate);
    return () => window.removeEventListener('bolt_earnings_updated', handleUpdate);
  }, [userData.userId]);

  // Handle Watch Real Adsgram Ad Click
  const [adFeedbackMsg, setAdFeedbackMsg] = useState<string | null>(null);

  const handleWatchAd = useCallback(async () => {
    if (userData.todayAdsWatched >= userData.dailyAdsLimit) {
      setAdFeedbackMsg('Daily limit reached. Check back tomorrow!');
      setTimeout(() => setAdFeedbackMsg(null), 3000);
      return;
    }

    setIsLoadingAd(true);
    setAdFeedbackMsg(null);
    triggerHaptic('medium');

    const reward = userData.adsRewardPerView || 0.30;
    const blockId = AdsgramService.getBlockId();

    try {
      const result = await AdsgramService.showRewardedAd(
        () => {
          const { user } = recordAdCompletion(userData.userId, reward, blockId);
          setUserData(user);
          triggerHaptic('success');
          setAdFeedbackMsg(`+$${reward.toFixed(2)} credited from Adsgram!`);
          setTimeout(() => setAdFeedbackMsg(null), 4500);
        },
        (errMsg) => {
          setAdFeedbackMsg(errMsg || 'Adsgram ad was closed or skipped before completion');
          setTimeout(() => setAdFeedbackMsg(null), 5000);
        }
      );

      if (!result.success && result.error) {
        setAdFeedbackMsg(result.error);
        setTimeout(() => setAdFeedbackMsg(null), 5000);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Adsgram playback issue';
      setAdFeedbackMsg(errorMsg);
      setTimeout(() => setAdFeedbackMsg(null), 5000);
    } finally {
      setIsLoadingAd(false);
    }
  }, [userData.adsRewardPerView, userData.dailyAdsLimit, userData.todayAdsWatched, userData.userId]);

  const handleTaskCompleted = (task: TaskItem) => {
    const current = getStoredUserData(userData.userId);
    setUserData(current);
  };

  const handleWithdrawalCreated = (updatedUser: UserEarningsData) => {
    setUserData(updatedUser);
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-neutral-900 font-sans antialiased flex flex-col justify-between max-w-md mx-auto relative shadow-2xl overflow-x-hidden">
      {/* Top Header matching Screenshots 1-4 */}
      <div>
        <Header
          userData={userData}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSupport={() => setShowSupportModal(true)}
          onOpenLanguage={() => setShowLanguageModal(true)}
          onOpenBotConfig={() => setShowBotModal(true)}
          language={language}
        />

        {/* Telegram Session Authenticity Badge */}
        <TelegramSessionBadge
          userData={userData}
          onUserUpdated={(updated) => setUserData(updated)}
        />

        {/* Active Tab View */}
        <main className="mt-1">
          {activeTab === 'ads' && (
            <AdsTab
              userData={userData}
              onWatchAdClicked={handleWatchAd}
              isLoadingAd={isLoadingAd}
              feedbackMessage={adFeedbackMsg}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksTab
              userData={userData}
              onTaskCompleted={handleTaskCompleted}
            />
          )}

          {activeTab === 'invite' && (
            <InviteTab userData={userData} />
          )}

          {activeTab === 'withdraw' && (
            <WithdrawTab
              userData={userData}
              onWithdrawalCreated={handleWithdrawalCreated}
            />
          )}
        </main>
      </div>

      {/* Floating Bottom Nav */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals */}
      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />

      <LanguageModal
        isOpen={showLanguageModal}
        currentLanguage={language}
        onSelectLanguage={(lang) => setLanguage(lang)}
        onClose={() => setShowLanguageModal(false)}
      />

      <BotConfigModal
        isOpen={showBotModal}
        onClose={() => setShowBotModal(false)}
      />
    </div>
  );
}
