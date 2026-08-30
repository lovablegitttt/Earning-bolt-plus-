import React, { useState } from 'react';
import { UserEarningsData, TaskItem } from '../types';
import { Megaphone, Bot, Youtube, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import { triggerHaptic, openExternalLink } from '../lib/telegram';
import { INITIAL_TASKS, saveUserData } from '../lib/storage';

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
