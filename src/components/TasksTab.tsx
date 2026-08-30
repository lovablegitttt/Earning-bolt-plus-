import React, { useState, useEffect, useRef } from 'react';
import { UserEarningsData, TaskItem } from '../types';
import { Megaphone, Bot, Youtube, CheckCircle2, Zap, RefreshCw, CheckSquare } from 'lucide-react';
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
  const [taskNotice, setTaskNotice] = useState<string | null>(null);
  const [isRefreshingAdsgramTask, setIsRefreshingAdsgramTask] = useState(false);
  const taskWallContainerRef = useRef<HTMLDivElement>(null);

  // Mount real Adsgram Tasks Web Component (<adsgram-task>)
  useEffect(() => {
    const container = taskWallContainerRef.current;
    if (!container) return;

    container.innerHTML = '';
    const taskElement = document.createElement('adsgram-task');
    taskElement.setAttribute('data-block-id', AdsgramService.getTaskBlockId() || DEFAULT_ADSGRAM_TASK_BLOCK_ID);
    
    // Listen for Adsgram task events
    const handleAdsgramReward = (e: any) => {
      const reward = 0.50;
      const updatedUser: UserEarningsData = {
        ...userData,
        totalBalance: Number((userData.totalBalance + reward).toFixed(2)),
      };
      saveUserData(updatedUser);
      triggerHaptic('success');
      setTaskNotice(`+$${reward.toFixed(2)} rewarded from Partner Tasks!`);
      setTimeout(() => setTaskNotice(null), 5000);
    };

    taskElement.addEventListener('reward', handleAdsgramReward);
    container.appendChild(taskElement);

    return () => {
      taskElement.removeEventListener('reward', handleAdsgramReward);
    };
  }, [userData]);

  const handleRefreshAdsgramTasks = () => {
    setIsRefreshingAdsgramTask(true);
    triggerHaptic('light');

    const container = taskWallContainerRef.current;
    if (container) {
      container.innerHTML = '';
      const taskElement = document.createElement('adsgram-task');
      taskElement.setAttribute('data-block-id', AdsgramService.getTaskBlockId() || DEFAULT_ADSGRAM_TASK_BLOCK_ID);
      container.appendChild(taskElement);
    }

    setTimeout(() => {
      setIsRefreshingAdsgramTask(false);
      setTaskNotice('Tasks refreshed successfully');
      setTimeout(() => setTaskNotice(null), 3000);
    }, 800);
  };

  const getTaskIcon = (type: TaskItem['type']) => {
    switch (type) {
      case 'channel':
        return <Megaphone className="w-5 h-5 text-blue-600" />;
      case 'bot':
        return <Bot className="w-5 h-5 text-blue-600" />;
      case 'youtube':
        return <Youtube className="w-5 h-5 text-red-500" />;
      default:
        return <Megaphone className="w-5 h-5 text-blue-600" />;
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
    
    // Open external URL
    openExternalLink(task.link);

    // Set verifying state
    setActiveVerifyingId(task.id);

    setTimeout(() => {
      setActiveVerifyingId(null);
      
      // Update local state
      const updatedTasks = tasks.map((t) => {
        if (t.id === task.id) {
          return { ...t, completed: true, currentProgress: t.maxProgress };
        }
        return t;
      });
      setTasks(updatedTasks);

      // Call parent callback to credit balance & save
      onTaskCompleted({
        ...task,
        completed: true,
        currentProgress: task.maxProgress,
      });

      triggerHaptic('success');
      setTaskNotice(`+$${task.reward.toFixed(2)} rewarded for completing task!`);
      setTimeout(() => setTaskNotice(null), 4000);
    }, 2500);
  };

  return (
    <div className="space-y-4 pb-28 px-4 animate-in fade-in duration-200">
      <div className="ios-glass-card rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CheckSquare className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">
                Daily Partner Tasks
              </h2>
              <p className="text-[11px] text-neutral-500 font-medium">
                Complete quests to unlock guaranteed cash rewards
              </p>
            </div>
          </div>
        </div>

        {/* Feedback / Alert Notice */}
        {taskNotice && (
          <div className="mb-4 px-3.5 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{taskNotice}</span>
          </div>
        )}

        {/* Featured Live Partner Quests */}
        <div
          id="adsgram-task-card"
          className="mb-4 rounded-3xl border border-blue-200/90 bg-gradient-to-br from-white via-blue-50/40 to-sky-50/60 p-4 shadow-xs"
        >
          <div className="flex items-center justify-between gap-2.5 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Zap className="w-5 h-5 fill-white text-white" />
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-neutral-900 leading-tight">
                  Instant Partner Quests
                </h3>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  Automated verification & direct wallet rewards
                </p>
              </div>
            </div>

            <button
              onClick={handleRefreshAdsgramTasks}
              disabled={isRefreshingAdsgramTask}
              className="p-2 rounded-xl bg-white border border-blue-100 text-blue-600 hover:bg-blue-50 active:scale-95 transition-all shadow-2xs"
              title="Refresh Quests"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshingAdsgramTask ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Real Adsgram Task Element Container */}
          <div
            ref={taskWallContainerRef}
            className="min-h-[40px] rounded-2xl overflow-hidden mt-2"
          />
        </div>

        {/* Verified Sponsor Tasks List */}
        <div className="space-y-3">
          {tasks.map((task) => {
            const isVerifying = activeVerifyingId === task.id;
            const isCompleted = task.completed;
            const progressPercent = (task.currentProgress / task.maxProgress) * 100;

            return (
              <div
                key={task.id}
                id={`task-card-${task.id}`}
                className="rounded-3xl border border-neutral-200/80 bg-white p-4 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100/60 flex items-center justify-center shrink-0">
                      {getTaskIcon(task.type)}
                    </div>

                    <div>
                      <h3 className="font-extrabold text-sm text-neutral-900 leading-tight">
                        {task.title}
                      </h3>
                      <p className="text-xs text-neutral-500 font-medium mt-0.5">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleTaskAction(task)}
                    disabled={isCompleted || isVerifying}
                    className={`px-5 py-2.5 rounded-2xl font-bold text-xs shadow-xs transition-all flex items-center justify-center min-w-[85px] ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isVerifying
                        ? 'bg-blue-100 text-blue-800 cursor-wait'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:brightness-105 active:scale-95 shadow-[0_4px_12px_rgba(0,122,255,0.25)]'
                    }`}
                  >
                    {isCompleted ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : isVerifying ? (
                      <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      getButtonLabel(task.type)
                    )}
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mt-3.5 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                  <span className="font-semibold text-neutral-600">Completion</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="font-bold text-neutral-900 font-mono">
                      {task.currentProgress}/{task.maxProgress}
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
