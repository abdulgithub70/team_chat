"use client";

import { useMemo, useEffect, useState } from "react";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    CartesianGrid, ResponsiveContainer,
} from "recharts";
import { CalendarCheck, CalendarX, Clock, TrendingUp, Wallet, Inbox } from "lucide-react";

const OVERTIME_RATE_PER_HOUR = 100;
const STANDARD_WORK_MINUTES = 9 * 60;
const STANDARD_DAYS_PER_MONTH = 26; // 👈 add this

const minutesToHours = (minutes) => {
    if (!minutes || isNaN(minutes)) return 0;
    return Math.round((minutes / 60) * 10) / 10;
};



const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
};

const formatCurrency = (value) => `₹${Math.round(value).toLocaleString("en-IN")}`;

const AttendanceTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const hours = payload[0]?.value ?? 0;
    return (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md text-xs">
            <p className="font-medium text-slate-700 mb-1">{label}</p>
            <p className="text-slate-500">
                Working hours: <span className="font-medium text-indigo-600">{hours}h</span>
            </p>
        </div>
    );
};

const SalaryTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md text-xs space-y-1">
            <p className="font-medium text-slate-700 mb-1">{label}</p>
            {payload.map((entry) => (
                <p key={entry.dataKey} className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-500">{entry.name}:</span>
                    <span className="font-medium text-slate-700">{formatCurrency(entry.value)}</span>
                </p>
            ))}
        </div>
    );
};

export default function EmployeeAttendanceAnalytics({ employee, attendanceData  }) {
    const hasData = Array.isArray(attendanceData) && attendanceData.length > 0;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [allLeaves, setAllLeaves] = useState([]);
    const [loggedInUserId, setLoggedInUserId] = useState(null);


    const countLeaveDays = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start) || isNaN(end)) return 1;
        const diffMs = end - start;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1; // inclusive
        return Math.max(1, diffDays);
    };
  
    // 📡 Fetch all leaves once
    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                const res = await fetch(`${apiUrl}/leave?role=admin`);
                const data = await res.json();
                console.log("All leaves:", data);
                setAllLeaves(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching leaves:", err);
            }
        };
        fetchLeaves();
    }, []);

    // 🔍 Filter for selected employee
    const employeeLeaves = useMemo(() => {
        if (!employee?._id) return [];
        return allLeaves.filter(l => l.employeeId === employee._id);
    }, [allLeaves, employee]);

    // 📊 Current month leaves
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthLeaves = employeeLeaves.filter(l =>
        (l.startDate || "").startsWith(currentMonth)
    );

    console.log("Employee leaves:", employeeLeaves);
    console.log("Current month leaves:", currentMonthLeaves);
    
    // ── Leave constants ──────────────────────────────────────────────────────────
    const FREE_LEAVE_PER_MONTH = 1;

    // ── Leave logic (add inside component, after employeeLeaves useMemo) ─────────

    // Get all months from joining date to current month
    const monthRange = useMemo(() => {
        const start = employee?.joiningDate ? new Date(employee.joiningDate) : new Date();
        const end = new Date();
        const months = [];
        const cur = new Date(start.getFullYear(), start.getMonth(), 1);
        while (cur <= end) {
            months.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`);
            cur.setMonth(cur.getMonth() + 1);
        }
        return months;
    }, [employee]);

    // Build month-wise leave summary with carry-forward
    const leaveMonthlyStats = useMemo(() => {
        let carryForward = 0;
        return monthRange.map((month) => {
            const monthLeaves = employeeLeaves.filter(l =>
                (l.startDate || "").startsWith(month)
            );
            //const approved = monthLeaves.filter(l => (l.status || "").toLowerCase() === "approved").length;
            const approved = monthLeaves
                .filter(l => (l.status || "").toLowerCase() === "approved")
                .reduce((sum, l) => sum + countLeaveDays(l.startDate, l.endDate), 0);
            const pending = monthLeaves.filter(l => (l.status || "").toLowerCase() === "pending").length;
            const denied = monthLeaves.filter(l => (l.status || "").toLowerCase() === "denied").length;

            const freeQuota = FREE_LEAVE_PER_MONTH + carryForward;
            const deductible = Math.max(0, approved - freeQuota);
            const dailySal = (employee?.salary || 0) / STANDARD_DAYS_PER_MONTH;
            const deductionAmt = deductible * dailySal;
            const unused = Math.max(0, freeQuota - approved);

            const result = { month, approved, pending, denied, freeQuota, deductible, deductionAmt, unused, carryForward };
            carryForward = unused; // carry unused to next month
            return result;
        });
    }, [employeeLeaves, monthRange, employee]);

    // Current month stats
    const currentMonthStats = useMemo(() => {
        const current = new Date().toISOString().slice(0, 7);
        return leaveMonthlyStats.find(m => m.month === current) || {
            approved: 0, pending: 0, denied: 0,
            freeQuota: FREE_LEAVE_PER_MONTH, deductible: 0,
            deductionAmt: 0, unused: FREE_LEAVE_PER_MONTH, carryForward: 0
        };
    }, [leaveMonthlyStats]);

    // Current month leave list (all statuses)
    const currentMonthLeaveList = useMemo(() => {
        const current = new Date().toISOString().slice(0, 7);
        return employeeLeaves.filter(l => (l.startDate || "").startsWith(current));
    }, [employeeLeaves]);

    // Chart data — last 4 months
    const leaveChartData = useMemo(() => {
        return leaveMonthlyStats.slice(-4).map(m => ({
            label: m.month.slice(5), // "06"
            approved: m.approved,
            freeQuota: m.freeQuota,
            deductible: m.deductible,
        }));
    }, [leaveMonthlyStats]);

    const dailySalaryVal = (employee?.salary || 0) / STANDARD_DAYS_PER_MONTH;

    const { attendanceChartData, salaryChartData, summary } = useMemo(() => {
        if (!hasData) {
            return {
                attendanceChartData: [],
                salaryChartData: [],
                summary: { presentDays: 0, totalHours: 0, overtimeHours: 0, estimatedSalary: 0 },
            };
        }

        const sorted = [...attendanceData].sort((a, b) => new Date(a.date) - new Date(b.date));


        

        
        // ✅ Replace with:
        const dailySalary = (employee?.salary || 0) / STANDARD_DAYS_PER_MONTH;

        let totalMinutesSum = 0;
        let overtimeMinutesSum = 0;
        let presentDays = 0;
        let regularSalaryTotal = 0;
        let overtimeSalaryTotal = 0;

        const attendanceChart = [];
        const salaryChart = [];

        sorted.forEach((record) => {
            const totalMinutes = record.totalMinutes || 0;
            const overtimeMinutes = record.overtimeMinutes || 0;

            if (totalMinutes > 0) presentDays += 1;

            totalMinutesSum += totalMinutes;
            overtimeMinutesSum += overtimeMinutes;

            const regularMinutes = Math.min(totalMinutes, STANDARD_WORK_MINUTES);
            const regularDayFraction = regularMinutes / STANDARD_WORK_MINUTES;

            const regularSalaryForDay = totalMinutes > 0 ? dailySalary * regularDayFraction : 0;
            const overtimeSalaryForDay = (overtimeMinutes / 60) * OVERTIME_RATE_PER_HOUR;

            regularSalaryTotal += regularSalaryForDay;
            overtimeSalaryTotal += overtimeSalaryForDay;

            const label = formatDateLabel(record.date);

            attendanceChart.push({ date: label, hours: minutesToHours(totalMinutes) });
            salaryChart.push({
                date: label,
                regular: Math.round(regularSalaryForDay),
                overtime: Math.round(overtimeSalaryForDay),
            });
        });




        return {
            attendanceChartData: attendanceChart,
            salaryChartData: salaryChart,
            summary: {
                presentDays,
                totalHours: minutesToHours(totalMinutesSum),
                overtimeHours: minutesToHours(overtimeMinutesSum),
                estimatedSalary: Math.round(regularSalaryTotal - currentMonthStats.deductionAmt),
            },
        };
    }, [attendanceData, employee, hasData]);

    const summaryCards = [
        { label: "Present days", value: summary.presentDays, icon: CalendarCheck, iconBg: "bg-indigo-50", iconColor: "text-indigo-600" },
        { label: "Total working hours", value: `${summary.totalHours}h`, icon: Clock, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
        { label: "Overtime hours", value: `${summary.overtimeHours}h`, icon: TrendingUp, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
        { label: "Estimated salary", value: formatCurrency(summary.estimatedSalary), icon: Wallet, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    ];

    if (!hasData) {
        return (
            <div className="w-full">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <Inbox className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">No attendance records available</p>
                    <p className="text-xs text-slate-400 mt-1">
                        {employee?.name ? `${employee.name} has no recorded attendance for this period.` : "Attendance data will appear here once available."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryCards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
                    <div key={label} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                            <Icon className={`w-5 h-5 ${iconColor}`} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-500 truncate">{label}</p>
                            <p className="text-lg font-semibold text-slate-800 truncate">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* LEFT — Leave Tracker */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 h-100 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800">Leave tracker</h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                1 free leave/month · unused carries forward
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                            <CalendarX className="w-4 h-4 text-rose-600" />
                        </div>
                    </div>

                    {/* 4 mini stat cards */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-indigo-50 rounded-xl p-3">
                            <p className="text-xs text-slate-500">Free quota</p>
                            <p className="text-xl font-semibold text-indigo-600">{currentMonthStats.freeQuota}</p>
                            <p className="text-[11px] text-slate-400">
                                {currentMonthStats.carryForward > 0
                                    ? `+${currentMonthStats.carryForward} carried forward`
                                    : "this month"}
                            </p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3">
                            <p className="text-xs text-slate-500">Approved</p>
                            <p className="text-xl font-semibold text-green-600">{currentMonthStats.approved}</p>
                            <p className="text-[11px] text-slate-400">this month</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-3">
                            <p className="text-xs text-slate-500">Pending</p>
                            <p className="text-xl font-semibold text-amber-600">{currentMonthStats.pending}</p>
                            <p className="text-[11px] text-slate-400">awaiting</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-3">
                            <p className="text-xs text-slate-500">Deductible</p>
                            <p className="text-xl font-semibold text-red-600">{currentMonthStats.deductible}</p>
                            <p className="text-[11px] text-slate-400">
                                {currentMonthStats.deductionAmt > 0
                                    ? `−₹${Math.round(currentMonthStats.deductionAmt).toLocaleString("en-IN")}`
                                    : "no deduction"}
                            </p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                            <span>Free quota used</span>
                            <span>{Math.min(currentMonthStats.approved, currentMonthStats.freeQuota)} / {currentMonthStats.freeQuota}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-2 rounded-full transition-all"
                                style={{
                                    width: `${Math.min((currentMonthStats.approved / (currentMonthStats.freeQuota || 1)) * 100, 100)}%`,
                                    background: currentMonthStats.deductible > 0 ? "#EF4444" : "#22C55E"
                                }}
                            />
                        </div>
                        {currentMonthStats.deductible > 0 && (
                            <p className="text-xs text-red-500 mt-1.5">
                                {currentMonthStats.deductible} extra leave(s) —{" "}
                                <span className="font-medium">
                                    ₹{Math.round(currentMonthStats.deductionAmt).toLocaleString("en-IN")}
                                </span> will be deducted
                            </p>
                        )}
                        {currentMonthStats.unused > 0 && (
                            <p className="text-xs text-green-600 mt-1.5">
                                {currentMonthStats.unused} unused leave(s) → carry forward to next month
                            </p>
                        )}
                    </div>

                    {/* Bar chart — last 4 months */}
                    {leaveChartData.length > 0 && (
                        <div className="h-36">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={leaveChartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="freeQuota" name="Free quota" fill="#E0E7FF" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="approved" name="Approved" fill="#22C55E" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="deductible" name="Deductible" fill="#EF4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Current month leave list */}
                    <div className="mt-4 space-y-2">
                        {currentMonthLeaveList.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-3">No leaves this month</p>
                        ) : currentMonthLeaveList.map(l => {
                            const start = new Date(l.startDate).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
                            const end = new Date(l.endDate).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
                            const status = (l.status || "pending").toLowerCase();
                            const styles = { approved: "bg-green-50 text-green-700", denied: "bg-red-50 text-red-700", pending: "bg-amber-50 text-amber-700" };
                            return (
                                <div key={l._id} className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-500">{start} → {end}</p>
                                        <p className="text-sm text-slate-700 truncate">{l.reason}</p>
                                    </div>
                                    <span className={`text-[11px] font-medium px-2 py-1 rounded-md flex-shrink-0 ${styles[status] || styles.pending}`}>
                                        {status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800">Attendance based salary</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Regular vs overtime earnings</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <Wallet className="w-4 h-4 text-emerald-600" />
                        </div>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salaryChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip content={<SalaryTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
                                <Bar dataKey="regular" name="Regular salary" stackId="salary" fill="#6366F1" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="overtime" name="Overtime salary" stackId="salary" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}