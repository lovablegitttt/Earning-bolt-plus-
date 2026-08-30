import React, { useState, useEffect, useRef } from 'react';
import { UserEarningsData, TaskItem } from '../types';
import { Megaphone, Bot, Youtube, CheckCircle, ExternalLink, Sparkles, Zap, ShieldCheck, RefreshCw, Settings } from 'lucide-react';
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
  const [taskBlockId, setTaskBlockId] = useState(AdsgramService.getTaskBlockId());
  const [showConfig, setShowConfig] = useState(false);
  const [taskNotice, setTaskNotice] = useState<string | null>(null);
  const [isRefreshingAdsgramTask, setIsRefreshingAdsgramTask] = useState(false);
  const taskWallContainerRef = useRef<HTMLDivElement>(null);

  // Mount real Adsgram Tasks Web Component (<adsgram-task>)
  useEffect(() => {
    const container = taskWallContainerRef.current;
    if (!container) return;

    container.innerHTML = '';
    const taskElement = document.createElement('adsgram-task');
    taskElement.setAttribute('data-block-id', taskBlockId || DEFAULT_ADSGRAM_TASK_BLOCK_ID);
    
    // Listen for Adsgram task events
    const handleAdsgramReward = (e: any) => {
      console.log('[Adsgram Task Wall] Reward event received:', e);
      const reward = 0.50;
      const updatedUser: UserEarningsData = {
        ...userData,
        totalBalance: Number((userData.totalBalance + reward).toFixed(2)),
      };
      saveUserData(updatedUser);
      triggerHaptic('success');
      setTaskNotice(`+$${reward.toFixed(2)} rewarded from Adsgram Tasks!`);
      setTimeout(() => setTaskNotice(null), 5000);
    };

    taskElement.addEventListener('reward', handleAdsgramReward);
    container.appendChild(taskElement);

    return () => {
      taskElement.removeEventListener('reward', handleAdsgramReward);
    };
  }, [taskBlockId, userData]);

  const handleRefreshAdsgramTasks = () => {
    setIsRefreshingAdsgramTask(true);
    triggerHaptic('light');

    const container = taskWallContainerRef.current;
    if (container) {
      container.innerHTML = '';
      const taskElement = document.createElement('adsgram-task');
      taskElement.setAttribute('data-block-id', taskBlockId || DEFAULT_ADSGRAM_TASK_BLOCK_ID);
      container.appendChild(taskElement);
    }

    setTimeout(() => {
      setIsRefreshingAdsgramTask(false);
      setTaskNotice('Adsgram task list updated');
      setTimeout(() => setTaskNotice(null), 3000);
    }, 800);
  };

  const handleSaveTaskBlockId = (id: string) => {
    const cleanId = id.trim() || DEFAULT_ADSGRAM_TASK_BLOCK_ID;
    setTaskBlockId(cleanId);
    AdsgramService.setTaskBlockId(cleanId);
    setShowConfig(false);
    triggerHaptic('success');
    handleRefreshAdsgramTasks();
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
    <div className="space-y-4 pb-24 px-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-neutral-200/70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-bold text-sm">☑</span>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">
              Complete Tasks & Earn Rewards
            </h2>
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="text-neutral-500 hover:text-neutral-800 text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100/90 font-medium"
            title="Adsgram Task Block Config"
          >
            <Settings className="w-3.5 h-3.5 text-neutral-600" />
            <span className="text-[10px] font-mono font-semibold">
              {taskBlockId}
            </span>
          </button>
        </div>

        {/* Feedback / Alert Notice */}
        {taskNotice && (
          <div className="mb-3 px-3.5 py-2.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium animate-in fade-in flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{taskNotice}</span>
          </div>
        )}

        {/* Task Block ID Config Drawer */}
        {showConfig && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Official Adsgram Tasks ({taskBlockId})
              </span>
              <button
                type="button"
                onClick={() => handleSaveTaskBlockId(DEFAULT_ADSGRAM_TASK_BLOCK_ID)}
                className="text-[10px] text-amber-800 hover:underline font-semibold"
              >
                Reset Default (task-45229)
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={taskBlockId}
                onChange={(e) => setTaskBlockId(e.target.value)}
                placeholder="e.g. task-45229"
                className="flex-1 px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={() => handleSaveTaskBlockId(taskBlockId)}
                className="px-3 py-1.5 bg-neutral-900 text-white font-bold text-xs rounded-lg hover:bg-neutral-800"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Featured Official Adsgram Task Wall Embed */}
        <div
          id="adsgram-task-card"
          className="mb-4 rounded-2xl border-2 border-amber-400/90 bg-gradient-to-br from-[#fffdf9] via-[#fff8eb] to-[#fef3d6] p-3.5 shadow-sm"
        >
          <div className="flex items-center justify-between gap-2.5 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Zap className="w-5 h-5 fill-white" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-neutral-900 leading-tight">
                    Adsgram Tasks Wall
                  </h3>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-950 font-bold">
                    {taskBlockId}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 font-medium mt-0.5">
                  Live partner quests & instant rewards
                </p>
              </div>
            </div>

            <button
              onClick={handleRefreshAdsgramTasks}
              disabled={isRefreshingAdsgramTask}
              className="p-2 rounded-xl bg-white border border-amber-200 text-amber-800 hover:bg-amber-50 active:scale-95 transition-all shadow-xs"
              title="Refresh Adsgram Task Wall"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshingAdsgramTask ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Real Adsgram Task Element Container */}
          <div
            ref={taskWallContainerRef}
            className="min-h-[40px] rounded-xl overflow-hidden"
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

                  {/* Action Button */}
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

                {/* Progress bar */}
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
