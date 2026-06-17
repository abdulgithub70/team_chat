"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, X, Calendar, Megaphone, Clock } from "lucide-react";

const TYPE_CONFIG = {
    leave: { icon: Calendar, bg: "bg-blue-50", color: "text-blue-600", border: "border-blue-100" },
    notice: { icon: Megaphone, bg: "bg-amber-50", color: "text-amber-600", border: "border-amber-100" },
    attendance: { icon: Clock, bg: "bg-green-50", color: "text-green-600", border: "border-green-100" },
};

const WHEN_BADGE = {
    today: { label: "Today", cls: "bg-green-50 text-green-700" },
    tomorrow: { label: "Tomorrow", cls: "bg-blue-50 text-blue-700" },
    yesterday: { label: "Yesterday", cls: "bg-slate-100 text-slate-600" },
    notice: { label: "Notice", cls: "bg-amber-50 text-amber-700" },
};

export default function NotificationBell({ loggedInUserId, loggedInUserRole }) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [readIds, setReadIds] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const popupRef = useRef(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // ── Fetch notifications ───────────────────────────────────────────────
    const fetchNotifications = async () => {
        if (!loggedInUserId) return;
        setLoading(true);
        try {
            const res = await fetch(
                `${apiUrl}/notifications?userId=${loggedInUserId}&role=${loggedInUserRole}`
            );
            const data = await res.json();
            setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Notification fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Har 5 minute mein refresh
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [loggedInUserId]);

    // ── Close on outside click ────────────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ── Load read IDs from localStorage ──────────────────────────────────
    useEffect(() => {
        const saved = localStorage.getItem("readNotifIds");
        if (saved) setReadIds(new Set(JSON.parse(saved)));
    }, []);

    // ── Bell sound function ──────────────────────────────────────────────────────
    const playBellSound = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();

            const playTone = (freq, startTime, duration, volume = 0.3) => {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                oscillator.type = "sine";
                oscillator.frequency.setValueAtTime(freq, startTime);

                // Bell-like envelope — quick attack, slow decay
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            };

            const now = ctx.currentTime;

            // 3 bell dings — pleasant notification sound
            playTone(880, now, 1.2, 0.3); // A5
            playTone(988, now + 0.15, 1.0, 0.2); // B5
            playTone(1320, now + 0.3, 1.5, 0.25); // E6

        } catch (err) {
            console.log("Audio not supported:", err);
        }
    };

    const prevCountRef = useRef(0);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [loggedInUserId]);

    // Naye notification detect karo
    useEffect(() => {
        if (notifications.length > prevCountRef.current && prevCountRef.current !== 0) {
            playBellSound(); // 🔔 naya notification aaya
        }
        prevCountRef.current = notifications.length;
    }, [notifications]);

    useEffect(() => {
        // Sirf tab bajao jab unread notifications hon
        const timer = setTimeout(() => {
            const saved = localStorage.getItem("readNotifIds");
            const readIds = saved ? new Set(JSON.parse(saved)) : new Set();
            const hasUnread = notifications.some(n => !readIds.has(String(n._id)));
            if (hasUnread) playBellSound();
        }, 1500); // page load ke 1.5 sec baad

        return () => clearTimeout(timer);
    }, [notifications]);


    // ── Mark all as read ──────────────────────────────────────────────────
    const markAllRead = () => {
        const allIds = notifications.map(n => String(n._id));
        const updated = new Set([...readIds, ...allIds]);
        setReadIds(updated);
        localStorage.setItem("readNotifIds", JSON.stringify([...updated]));
    };

    // ✅ Naya:
    const handleOpen = () => {
        setOpen(prev => !prev);
        if (!open) {
            markAllRead();
            if (unreadCount > 0) playBellSound(); // 🔔
        }
    };

    const unreadCount = notifications.filter(n => !readIds.has(String(n._id))).length;

    return (
        <div className="relative" ref={popupRef}>

            {/* Bell button */}
            <button
                onClick={handleOpen}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Popup */}
            {open && (
                <div className="absolute right-0 top-11 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden">

                    {/* Popup header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="text-sm font-medium">Notifications</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                                {notifications.length} total
                            </span>
                            <button
                                onClick={() => setOpen(false)}
                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <div className="p-6 text-center text-sm text-muted-foreground">
                                Loading...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">No notifications</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    You're all caught up!
                                </p>
                            </div>
                        ) : notifications.map((n) => {
                            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.notice;
                            const Icon = config.icon;
                            const badge = WHEN_BADGE[n.when] || WHEN_BADGE.notice;
                            const isUnread = !readIds.has(String(n._id));

                            return (
                                <div
                                    key={String(n._id)}
                                    className={`flex gap-3 px-4 py-3 transition-colors ${isUnread
                                            ? "bg-blue-50/40 dark:bg-blue-950/20"
                                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        }`}
                                >
                                    {/* Icon */}
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${config.bg}`}>
                                        <Icon className={`w-4 h-4 ${config.color}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1  min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm leading-snug ${isUnread ? "font-medium" : "font-normal"}`}>
                                                {n.title}
                                            </p>
                                            {isUnread && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                            {n.message}
                                        </p>
                                        <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mt-1.5 ${badge.cls}`}>
                                            {badge.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
                            <button
                                onClick={markAllRead}
                                className="text-xs text-blue-600 hover:underline"
                            >
                                Mark all as read
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}