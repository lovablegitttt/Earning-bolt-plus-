import React, { useState } from 'react';
import { UserEarningsData, TaskItem } from '../types';
import { Megaphone, Bot, Youtube, CheckCircle, ExternalLink, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { triggerHaptic, openExternalLink } from '../lib/telegram';
import { INITIAL_TASKS, saveUserData } from '../lib/storage';
import { AdsgramService, DEFAULT_ADSGRAM_TASK_BLOCK_ID } from '../lib/adsgram';

interface TasksTabProps {
  userData: UserEarningsData;
  onTaskCompleted: (task: TaskItem) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({ userData, onTaskCompleted }) => {
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    return INITIAL_TASKS.map((t) => ({
      ...t,
      completed: userData.completedTasks?.includes(t.id) || false,
    }));
  });

  const [activeVerifyingId, setActiveVerifyingId] = useState<string | null>(null);
  const [adsgramTaskLoading, setAdsgramTaskLoading] = useState(false);
  const [taskNotice, setTaskNotice] = useState<string | null>(null);

  const handleLaunchAdsgramTaskWall = async () => {
    setAdsgramTaskLoading(true);
    setTaskNotice(null);
    triggerHaptic('medium');

    try {
      const result = await AdsgramService.showRewardTask(
        () => {
          // On task completion reward
          const taskReward = 0.50;
          const newBalance = Number((userData.totalBalance + taskReward).toFixed(2));
          const updatedUser: UserEarningsData = {
            ...userData,
            totalBalance: newBalance,
          };
          saveUserData(updatedUser);
          triggerHaptic('success');
          setTaskNotice(`+$${taskReward.toFixed(2)} rewarded from Adsgram Tasks!`);
          setTimeout(() => setTaskNotice(null), 5000);
        },
        (errMsg) => {
          setTaskNotice(errMsg || 'Adsgram task was closed or not completed');
          setTimeout(() => setTaskNotice(null), 5000);
        }
      );

      if (!result.success && result.error) {
        setTaskNotice(result.error);
        setTimeout(() => setTaskNotice(null), 5000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error launching Adsgram task';
      setTaskNotice(msg);
      setTimeout(() => setTaskNotice(null), 5000);
    } finally {
      setAdsgramTaskLoading(false);
    }
  };

  const getTaskIcon = (type: TaskItem['type']) => {
    switch (type) {
      case 'channel':
        return <Megaphone className="w-5 h-5 text-amber-700" />;
      case 'bot':
        return <Bot className="w-5 h-5 text-amber-700" />;
      case 'youtube':
        return <Youtube className="w-5 h-5 text-amber-700" />;
      default:
        return <Megaphone className="w-5 h-5 text-amber-700" />;
    }
  };

  const getButtonLabel = (type: TaskItem['type']) => {
    switch (type) {
      case 'channel':
        return 'Join';
      case 'bot':
        return 'Start';
      case 'youtube':
        return 'Subscribe';
      default:
        return 'Claim';
    }
  };

  const handleTaskAction = (task: TaskItem) => {
    triggerHaptic('medium');
    
    // Open the authentic target link in Telegram WebApp or browser
    openExternalLink(task.link);

    // Set verifying state
    setActiveVerifyingId(task.id);

    setTimeout(() => {
      setActiveVerifyingId(null);
      
      const newProgress = Math.min(task.maxProgress, task.currentProgress + 1);
      const isFinished = newProgress >= task.maxProgress;

      const updatedTasks = tasks.map((t) => {
        if (t.id === task.id) {
          return {
            ...t,
            currentProgress: newProgress,
            completed: isFinished,
          };
        }
        return t;
      });

      setTasks(updatedTasks);

      // Add reward to balance
      const newBalance = Number((userData.totalBalance + task.reward).toFixed(2));
      const updatedUser: UserEarningsData = {
        ...userData,
        totalBalance: newBalance,
        completedTasks: isFinished
          ? Array.from(new Set([...(userData.completedTasks || []), task.id]))
          : userData.completedTasks,
      };

      saveUserData(updatedUser);
      onTaskCompleted(task);
      triggerHaptic('success');
    }, 2500);
  };

  return (
    <div className="space-y-4 pb-24 px-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-neutral-200/70">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-amber-500 font-bold text-sm">☑</span>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight">
            Complete Tasks & Earn Rewards
          </h2>
        </div>

        {/* Feedback / Alert Notice */}
        {taskNotice && (
          <div className="mb-3 px-3.5 py-2.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium animate-in fade-in flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{taskNotice}</span>
          </div>
        )}

        {/* Featured Adsgram Sponsored Task Wall (task-45229) */}
        <div
          id="adsgram-task-card"
          className="mb-4 rounded-2xl border-2 border-amber-400/90 bg-gradient-to-br from-[#fffdfa] via-[#fffbf0] to-[#fbf4de] p-3.5 shadow-sm"
        >
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Zap className="w-5 h-5 fill-white" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-neutral-900 leading-tight">
                    Adsgram Tasks Wall
                  </h3>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-950 font-bold">
                    {DEFAULT_ADSGRAM_TASK_BLOCK_ID}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 font-medium mt-0.5">
                  Complete partner quests & tasks
                </p>
              </div>
            </div>

            {/* Launch Adsgram Task Wall Button */}
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={handleLaunchAdsgramTaskWall}
                disabled={adsgramTaskLoading}
                className="px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center min-w-[85px] bg-gradient-to-b from-[#2a2b33] to-[#14151a] text-white hover:brightness-110 active:scale-95 border border-neutral-700 disabled:opacity-50"
              >
                {adsgramTaskLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Launch</span>
                )}
              </button>
              <span className="text-[10px] font-black text-amber-700">+$0.50</span>
            </div>
          </div>
        </div>

        {/* Task Cards List matching Screenshot 2 */}
        <div className="space-y-3">
          {tasks.map((task) => {
            const isVerifying = activeVerifyingId === task.id;
            const isCompleted = task.completed;
            const progressPercent = (task.currentProgress / task.maxProgress) * 100;

            return (
              <div
                key={task.id}
                id={`task-card-${task.id}`}
                className="rounded-2xl border-2 border-neutral-200/80 bg-gradient-to-b from-[#ffffff] to-[#faf9f6] p-3.5 shadow-xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-100/70 border border-amber-200/60 flex items-center justify-center shrink-0">
                      {getTaskIcon(task.type)}
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-neutral-900 leading-tight">
                        {task.title}
                      </h3>
                      <p className="text-xs text-neutral-500 font-medium mt-0.5">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Button matching gold metallic button in screenshot 2 */}
                  <button
                    onClick={() => handleTaskAction(task)}
                    disabled={isCompleted || isVerifying}
                    className={`px-5 py-2 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center min-w-[80px] ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : isVerifying
                        ? 'bg-amber-200 text-amber-900 cursor-wait'
                        : 'bg-gradient-to-b from-[#dfb76c] via-[#c69b4c] to-[#a87f34] text-white hover:brightness-105 active:scale-95 border border-amber-400/40'
                    }`}
                  >
                    {isCompleted ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : isVerifying ? (
                      <div className="w-3.5 h-3.5 border-2 border-amber-900 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      getButtonLabel(task.type)
                    )}
                  </button>
                </div>

                {/* Progress bar matching Screenshot 2 */}
                <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                  <span>Progress</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="font-semibold text-neutral-700">
                      {task.currentProgress} / {task.maxProgress}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
