// components/LeaveTracker.jsx
"use client";
import { useMemo } from "react";
import { CalendarCheck, CalendarX, CalendarOff, Gift } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    CartesianGrid, ResponsiveContainer, Cell
} from "recharts";

const FREE_LEAVE_PER_MONTH = 1;

const formatCurrency = (v) => `₹${Math.round(v).toLocaleString("en-IN")}`;

// Get "YYYY-MM" list from joiningDate to current month
const getMonthRange = (joiningDate) => {
    const start = joiningDate ? new Date(joiningDate) : new Date();
    const end = new Date();
    const months = [];
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cur <= end) {
        months.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`);
        cur.setMonth(cur.getMonth() + 1);
    }
    return months;
};

const LeaveTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md text-xs space-y-1">
            <p className="font-medium text-slate-700 mb-1">{label}</p>
            {payload.map(entry => (
                <p key={entry.name} className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-500">{entry.name}:</span>
                    <span className="font-medium">{entry.value}</span>
                </p>
            ))}
        </div>
    );
};

export default function LeaveTracker({ employee, allLeaveData = [], dailySalary = 0 }) {
    const currentMonth = new Date().toISOString().slice(0, 7);

    // ── Build monthly leave summary with carry-forward ─────────────────────
    const { monthlyData, currentMonthStats } = useMemo(() => {
        const months = getMonthRange(employee?.joiningDate);
        let carryForward = 0;
        const monthlyData = [];

        months.forEach((month) => {
            // Approved leaves this month
            const monthLeaves = allLeaveData.filter(l =>
                (l.startDate || "").startsWith(month) &&
                (l.status || "").toLowerCase() === "approved"
            );
            const approvedCount = monthLeaves.length;
            const freeQuota = FREE_LEAVE_PER_MONTH + carryForward;
            const deductibleLeaves = Math.max(0, approvedCount - freeQuota);
            const deductionAmount = deductibleLeaves * dailySalary;
            const unused = Math.max(0, freeQuota - approvedCount); // unused → carry forward

            monthlyData.push({
                month,
                label: month.slice(5), // "06"
                approved: approvedCount,
                freeQuota,
                deductibleLeaves,
                deductionAmount,
                carryForward,
                unused,
            });

            // Next month carry forward = unused free leaves (max 1 carry per month optional — remove cap if needed)
            carryForward = unused;
        });

        const current = monthlyData.find(m => m.month === currentMonth) || {
            approved: 0, freeQuota: FREE_LEAVE_PER_MONTH, deductibleLeaves: 0,
            deductionAmount: 0, carryForward: 0, unused: 0,
        };

        return { monthlyData, currentMonthStats: current };
    }, [allLeaveData, employee, dailySalary, currentMonth]);

    // All leaves this month (any status) for display
    const currentMonthLeaves = allLeaveData.filter(l =>
        (l.startDate || "").startsWith(currentMonth)
    );

    const pendingCount = currentMonthLeaves.filter(l => (l.status || "").toLowerCase() === "pending").length;
    const deniedCount = currentMonthLeaves.filter(l => (l.status || "").toLowerCase() === "denied").length;

    // Chart — last 4 months
    const chartData = monthlyData.slice(-4).map(m => ({
        label: m.label,
        approved: m.approved,
        freeQuota: m.freeQuota,
        deductible: m.deductibleLeaves,
    }));

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">Leave tracker</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Monthly quota · unused leaves carry forward
                    </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                    <CalendarX className="w-4 h-4 text-rose-600" />
                </div>
            </div>

            {/* Summary cards — current month */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                    {
                        label: "Free quota",
                        value: currentMonthStats.freeQuota,
                        icon: Gift,
                        bg: "bg-indigo-50", color: "text-indigo-600",
                        sub: currentMonthStats.carryForward > 0 ? `+${currentMonthStats.carryForward} carried` : "this month"
                    },
                    {
                        label: "Approved",
                        value: currentMonthStats.approved,
                        icon: CalendarCheck,
                        bg: "bg-green-50", color: "text-green-600",
                        sub: "this month"
                    },
                    {
                        label: "Pending",
                        value: pendingCount,
                        icon: CalendarOff,
                        bg: "bg-amber-50", color: "text-amber-600",
                        sub: "awaiting"
                    },
                    {
                        label: "Deductible",
                        value: currentMonthStats.deductibleLeaves,
                        icon: CalendarX,
                        bg: "bg-red-50", color: "text-red-600",
                        sub: currentMonthStats.deductionAmount > 0
                            ? `−${formatCurrency(currentMonthStats.deductionAmount)}`
                            : "no deduction"
                    },
                ].map(({ label, value, icon: Icon, bg, color, sub }) => (
                    <div key={label} className={`${bg} rounded-xl p-3`}>
                        <div className="flex items-center gap-1.5 mb-1">
                            <Icon className={`w-3.5 h-3.5 ${color}`} />
                            <p className="text-xs text-slate-500">{label}</p>
                        </div>
                        <p className={`text-xl font-semibold ${color}`}>{value}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
                    </div>
                ))}
            </div>

            {/* Free quota progress bar */}
            <div className="mb-5">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Free quota used this month</span>
                    <span>{Math.min(currentMonthStats.approved, currentMonthStats.freeQuota)} / {currentMonthStats.freeQuota}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-2 rounded-full transition-all"
                        style={{
                            width: `${Math.min((currentMonthStats.approved / (currentMonthStats.freeQuota || 1)) * 100, 100)}%`,
                            background: currentMonthStats.deductibleLeaves > 0 ? "#EF4444" : "#22C55E"
                        }}
                    />
                </div>
                {currentMonthStats.deductibleLeaves > 0 && (
                    <p className="text-xs text-red-500 mt-1.5">
                        {currentMonthStats.deductibleLeaves} leave(s) beyond free quota —{" "}
                        <span className="font-medium">{formatCurrency(currentMonthStats.deductionAmount)}</span> will be deducted from salary
                    </p>
                )}
                {currentMonthStats.unused > 0 && (
                    <p className="text-xs text-green-600 mt-1.5">
                        {currentMonthStats.unused} unused leave(s) will carry forward to next month
                    </p>
                )}
            </div>

            {/* Monthly leave chart — last 4 months */}
            {chartData.length > 0 && (
                <>
                    <p className="text-xs text-slate-400 mb-2">Last {chartData.length} months</p>
                    <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<LeaveTooltip />} />
                                <Bar dataKey="freeQuota" name="Free quota" fill="#E0E7FF" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="approved" name="Approved" fill="#22C55E" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="deductible" name="Deductible" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}

            {/* Current month leave list */}
            {currentMonthLeaves.length > 0 && (
                <div className="mt-5 space-y-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">This month's leaves</p>
                    {currentMonthLeaves.map(l => {
                        const start = new Date(l.startDate).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
                        const end = new Date(l.endDate).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
                        const status = (l.status || "pending").toLowerCase();
                        const statusStyles = {
                            approved: "bg-green-50 text-green-700",
                            denied: "bg-red-50 text-red-700",
                            pending: "bg-amber-50 text-amber-700",
                        };
                        return (
                            <div key={l._id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-500">{start} → {end}</p>
                                    <p className="text-sm text-slate-700 truncate mt-0.5">{l.reason}</p>
                                </div>
                                <span className={`text-[11px] font-medium px-2 py-1 rounded-md flex-shrink-0 ${statusStyles[status] || statusStyles.pending}`}>
                                    {status}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {currentMonthLeaves.length === 0 && (
                <div className="mt-4 flex flex-col items-center justify-center py-6 text-slate-400 text-sm gap-2">
                    <CalendarOff className="w-7 h-7" />
                    No leaves this month
                </div>
            )}
        </div>
    );
}