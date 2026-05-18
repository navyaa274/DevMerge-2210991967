import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../services/api/apiClient";
import socketService from "../services/api/socket.js";
import {
  BellIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

export default function NotificationCenter() {
  const { token, user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // Check if server is online
  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", checkOnlineStatus);
    window.addEventListener("offline", checkOnlineStatus);

    return () => {
      window.removeEventListener("online", checkOnlineStatus);
      window.removeEventListener("offline", checkOnlineStatus);
    };
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!token || !user?.id) return;

    setIsLoading(true);
    try {
      const response = await apiClient.get(`/notifications/${user.id}`);
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n) => !n.isRead).length);
    } catch (error) {
      if (
        error.code === "ERR_NETWORK" ||
        error.code === "ERR_CONNECTION_REFUSED"
      ) {
        console.log("Notifications service unavailable");
      } else {
        console.error("Notifications sync error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    if (!token) return;

    fetchNotifications();

    // Setup Socket.IO for real-time notifications (non-critical)
    let socketConnected = false;

    try {
      socketService.connect(token);

      socketService.on("connect", () => {
        console.log("📡 Socket connected:", socketService.socket?.id);
        socketConnected = true;
      });

      socketService.on("disconnect", () => {
        console.log("📡 Socket disconnected");
        socketConnected = false;
      });

      socketService.on("notification", (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Flash the bell icon or show a toast if needed
        if ("Notification" in window && Notification.permission === "granted") {
          try {
            new Notification(newNotif.title, { body: newNotif.message });
          } catch (err) {
            console.debug('Notification failed:', err);
          }
        }
      });

      socketService.on("notification_count", ({ unreadCount }) => {
        setUnreadCount(unreadCount);
      });

      return () => {
        socketService.off("notification");
        socketService.off("notification_count");
        socketService.off("connect");
        socketService.off("disconnect");
      };
    } catch (error) {
      console.debug('Socket connection setup failed (non-critical):', error);
    }

    // Cleanup socket connection on unmount
    return () => {
      try {
        if (socketConnected && socketService.socket) {
          socketService.disconnect();
        }
      } catch (error) {
        console.debug('Socket disconnect error (non-critical):', error);
      }
    };
  }, [token, fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark read:", error);
      // Don't throw error to user, just fail silently
    }
  };

  const markAllRead = async () => {
    try {
      await apiClient.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all read:", error);
    }
  };

  const deleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      // Re-fetch count if needed or decrement locally
      const wasUnread = !notifications.find((n) => n._id === notificationId)
        ?.isRead;
      if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to delete notification:", error);
      // Don't throw error to user, just fail silently
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "announcement":
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
      case "assignment":
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
      case "system":
        return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />;
      default:
        return <BellIcon className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-full border transition-all duration-300 ${
          isOpen
            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-200"
            : "bg-gray-50/50 dark:bg-dark-800/50 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 border-gray-100 dark:border-dark-700"
        }`}
        disabled={isLoading}
      >
        <BellIcon className="w-6 h-6" />
        {isLoading ? (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] font-black rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center border-2 border-white dark:border-dark-950 shadow-sm animate-pulse">
            ⏳
          </span>
        ) : unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] font-black rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center border-2 border-white dark:border-dark-950 shadow-sm animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40 transition-opacity"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="absolute right-0 mt-4 w-96 max-w-[90vw] bg-white dark:bg-dark-900 rounded-3xl shadow-3xl border border-gray-100 dark:border-dark-800 z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-50 dark:border-dark-800/50 flex justify-between items-center bg-gray-50/50 dark:bg-dark-950/50">
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                    Activity Feed
                  </h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    Real-time Telemetry
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full transition-all"
                  >
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Mark All Read
                  </button>
                )}
              </div>

              <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  <div className="p-16 text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] italic mt-4">
                      Syncing...
                    </p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-dark-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <EnvelopeIcon className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] italic">
                      No active vectors
                    </p>
                  </div>
                ) : (
                  notifications.map((notif, idx) => (
                    <motion.div
                      key={notif._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => !notif.isRead && markAsRead(notif._id)}
                      className={`p-6 border-b border-gray-50 dark:border-dark-800/50 cursor-pointer group transition-all relative ${
                        notif.isRead
                          ? "opacity-60 grayscale-[0.5]"
                          : "bg-indigo-50/30 dark:bg-indigo-900/10"
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className="mt-1 shrink-0">
                          {getIcon(notif.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <p className="font-black text-[11px] text-gray-900 dark:text-white uppercase tracking-tight leading-tight truncate">
                              {notif.title}
                            </p>
                            <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap opacity-60">
                              {new Date(notif.createdAt).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-slate-400 font-medium leading-relaxed">
                            {notif.message}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 items-center opacity-0 group-hover:opacity-100 transition-all ml-2">
                          <button
                            onClick={(e) => deleteNotification(e, notif._id)}
                            className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {!notif.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-dark-950/50 border-t border-gray-100 dark:border-dark-800">
                  <p className="text-[10px] font-black text-slate-400 text-center uppercase tracking-[0.2em] italic">
                    Viewing latest updates from your sectors
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
