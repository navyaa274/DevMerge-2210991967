import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BoltIcon,
  FireIcon,
  CurrencyDollarIcon,
  ClockIcon,
  SignalIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";
import facultyService from "../../services/api/facultyService";
import toast from "../../utils/toast";

export default function ZeroDayQuest() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "Medium",
    baseXp: 100,
    timeLimitMinutes: 60,
    multiplier: 1.0,
    colorTheme: "amber",
    courseId: null,
    tags: [],
  });
  const [deploying, setDeploying] = useState(false);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [endpointAvailable, setEndpointAvailable] = useState(true);
  const [hasCheckedAvailability, setHasCheckedAvailability] = useState(false);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await facultyService.getQuestHistory();
      // Handle different response formats
      if (Array.isArray(res)) {
        setHistory(res);
      } else if (res?.success && Array.isArray(res.data)) {
        setHistory(res.data);
      } else {
        setHistory([]);
      }
    } catch (err) {
      // Silently handle 404 errors and other network issues
      // The endpoint may not exist in the backend, so don't spam console
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    // Check if endpoint exists and only call once
    if (!hasCheckedAvailability) {
      facultyService.checkQuestHistoryAvailability().then((available) => {
        setEndpointAvailable(available);
        setHasCheckedAvailability(true);
        if (available) {
          fetchHistory();
        }
      });
    }

    // Only refresh periodically if endpoint exists
    let interval;
    if (endpointAvailable && hasCheckedAvailability) {
      interval = setInterval(fetchHistory, 30000); // 30s pulse
    }

    return () => {
      clearInterval(interval);
    };
  }, [endpointAvailable, hasCheckedAvailability]);

  const handleDeploy = async (e) => {
    e.preventDefault();

    if (formData.baseXp < 10) {
      toast.error("Base XP must be at least 10");
      return;
    }
    if (formData.timeLimitMinutes < 5) {
      toast.error("Time limit must be at least 5 minutes");
      return;
    }

    setDeploying(true);
    try {
      const res = await facultyService.deployZeroDayQuest(formData);
      if (res.success) {
        toast.success("Zero-Day Quest Broadcasted!");
        setFormData((prev) => ({
          ...prev,
          title: "",
          description: "",
          baseXp: 100,
          timeLimitMinutes: 60,
        }));
        fetchHistory(); // Refresh immediately
      }
    } catch (error) {
      const msg =
        error.formattedMessage || error.message || "Error deploying quest";
      toast.error(msg);
    } finally {
      setDeploying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 py-8 md:p-8 lg:p-12 max-w-[1200px] mx-auto min-h-screen pt-20 md:pt-24 font-sans"
    >
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 lg:mb-20 gap-8">
        <div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
            Zero-Day{" "}
            <span
              className={`text-${formData.colorTheme}-500 transition-colors duration-500`}
            >
              Quest
            </span>
          </h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">
            Deploy Timed Micro-Challenges with Global XP Multipliers
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-8 md:p-12 shadow-3xl border border-slate-50 dark:border-dark-800 relative z-10">
        <form onSubmit={handleDeploy} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 italic">
                  Quest Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold outline-none focus:border-amber-500 transition-colors shadow-inner"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 italic">
                  Briefing / Description
                </label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-[2rem] px-6 py-4 text-slate-900 dark:text-white font-medium outline-none focus:border-amber-500 transition-colors shadow-inner resize-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2 italic">
                    <CurrencyDollarIcon className="w-4 h-4 text-emerald-500" />{" "}
                    Base XP
                  </label>
                  <input
                    type="number"
                    value={formData.baseXp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        baseXp: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-black text-xl outline-none focus:border-amber-500 transition-colors text-center"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2 italic">
                    <ClockIcon className="w-4 h-4 text-rose-500" /> Decay Time
                    (M)
                  </label>
                  <input
                    type="number"
                    value={formData.timeLimitMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeLimitMinutes: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-black text-xl outline-none focus:border-amber-500 transition-colors text-center"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2 italic">
                    <FireIcon className="w-4 h-4 text-amber-500" /> Multiplier
                    Boost
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.multiplier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        multiplier: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-black text-xl outline-none focus:border-amber-500 transition-colors text-center"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 italic">
                    Theme Color
                  </label>
                  <select
                    value={formData.colorTheme}
                    onChange={(e) =>
                      setFormData({ ...formData, colorTheme: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-black text-sm outline-none focus:border-amber-500 transition-colors uppercase tracking-widest"
                  >
                    <option value="indigo">Indigo</option>
                    <option value="rose">Rose (Critical)</option>
                    <option value="amber">Amber (Warning)</option>
                    <option value="emerald">Emerald (Safe)</option>
                    <option value="violet">Violet</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-100 dark:border-dark-800">
            <button
              type="submit"
              disabled={deploying}
              className={`w-full py-6 rounded-[2rem] font-black uppercase text-sm md:text-base tracking-[0.3em] flex items-center justify-center gap-3 italic transition-all shadow-xl
                                ${
                                  deploying
                                    ? "bg-slate-300 dark:bg-dark-800 text-slate-500 cursor-not-allowed"
                                    : `bg-${formData.colorTheme}-600 hover:bg-${formData.colorTheme}-500 text-white hover:scale-[1.02] shadow-${formData.colorTheme}-600/50`
                                }
                            `}
            >
              {deploying ? (
                <span className="animate-pulse flex items-center gap-2">
                  Deploying Payload...
                </span>
              ) : (
                <>
                  <BoltIcon className="w-6 h-6" /> Deploy Zero-Day Quest
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* History Section */}
      <div className="mt-20 lg:mt-32">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
            Deployment History
          </h2>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {history.length > 0 ? (
            history.map((quest, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={quest._id}
                className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-[2rem] p-6 flex flex-col md:flex-row gap-6 items-start md:items-center shadow-xl hover:shadow-2xl transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-${quest.colorTheme || "amber"}-500/10 text-${quest.colorTheme || "amber"}-600`}
                >
                  <BeakerIcon className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-${quest.colorTheme || "amber"}-600 text-white`}
                    >
                      {quest.difficulty}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(quest.createdAt).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full">
                      XP: {quest.baseXp} × {quest.multiplier}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {quest.title}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-1 italic mt-1">
                    {quest.description}
                  </p>
                </div>

                <div className="flex flex-col items-end shrink-0 pl-12 border-l border-slate-100 dark:border-slate-800 hidden md:flex">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    Status
                  </span>
                  <span
                    className={`text-xs font-black italic flex items-center gap-1 ${new Date(quest.expiresAt) > new Date() ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    <SignalIcon className="w-3 h-3" />
                    {new Date(quest.expiresAt) > new Date()
                      ? "ACTIVE"
                      : "EXPIRED"}
                  </span>
                </div>
              </motion.div>
            ))
          ) : isLoadingHistory ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400 font-black uppercase tracking-widest italic animate-pulse">
                Scanning Archive...
              </p>
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 dark:bg-dark-950 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-dark-800">
              <p className="text-slate-400 font-black uppercase tracking-widest italic">
                No historical deployments found
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
