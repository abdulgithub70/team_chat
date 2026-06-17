"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ── Helpers ──────────────────────────────────────────────────────────────────
const parseTime12 = (t) => {
    if (!t) return null;
    const m = t.match(/(\d+):(\d+):(\d+)\s*(AM|PM)/i);
    if (!m) return null;
    let h = parseInt(m[1]), min = parseInt(m[2]);
    if (m[4].toUpperCase() === "PM" && h !== 12) h += 12;
    if (m[4].toUpperCase() === "AM" && h === 12) h = 0;
    return h * 60 + min;
};

const isLate = (t) => { const v = parseTime12(t); return v !== null && v > 10 * 60 + 10; };
const isOvertime = (t) => { const v = parseTime12(t); return v !== null && v > 19 * 60; };

const toMinutes = (d) => {
    const m = (d || "").match(/(\d+)h\s*(\d+)m/);
    return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 0;
};

const toHM = (mins) => `${Math.floor(mins / 60)}h ${mins % 60}m`;

const getTotalDuration = (durations) => {
    if (!durations?.length) return "—";
    return toHM(durations.reduce((s, d) => s + toMinutes(d), 0));
};

const getOvertimeDisplay = (checkOut) => {
    if (!isOvertime(checkOut)) return "—";
    return toHM(parseTime12(checkOut) - 19 * 60);
};

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AttendancePage() {
    const router = useRouter();

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🧑‍💼 Logged-in user info
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [loggedInUserRole, setLoggedInUserRole] = useState(null);
    const [loggedInUserName, setLoggedInUserName] = useState(null);
    const [loggedInJoiningDate, setLoggedInJoiningDate] = useState(null);
    const [loggedInDepartment, setLoggedInDepartment] = useState(null);
    const [loggedInDesignation, setLoggedInDesignation] = useState(null);
    const [loggedInSalary, setLoggedInSalary] = useState(null);

    const [searchName, setSearchName] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [searchStatus, setSearchStatus] = useState("");
    const [searchMonth, setSearchMonth] = useState("");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // 🧑‍💼 Load logged-in user from localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const uid = localStorage.getItem("userId");
            const role = localStorage.getItem("role");
            const uname = localStorage.getItem("userName");
            const joiningDate = localStorage.getItem("joiningDate");
            const department = localStorage.getItem("department");
            const designation = localStorage.getItem("designation");
            const salary = localStorage.getItem("salary");

            if (!uid) return router.push("/login");

            setLoggedInUserId(uid);
            setLoggedInUserRole(role);
            setLoggedInUserName(uname);
            setLoggedInJoiningDate(joiningDate);
            setLoggedInDepartment(department);
            setLoggedInDesignation(designation);
            setLoggedInSalary(salary);
        }
    }, [router]);

    // 📡 Fetch attendance records
    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await fetch(`${apiUrl}/attendance`);
                const data = await res.json();
                setRecords(data);
            } catch (err) {
                console.error("❌ Error fetching attendance:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    const isAdmin = (loggedInUserRole || "").toLowerCase() === "admin";

    // Role-based base data
    const baseRecords = useMemo(() => {
        if (isAdmin) return records;
        return records.filter(r => r.userId === loggedInUserId);
    }, [records, isAdmin, loggedInUserId]);

    // Filtered records
    const filtered = useMemo(() => {
        return baseRecords.filter(r => {
            if (searchName && !r.name.toLowerCase().includes(searchName.toLowerCase())) return false;
            if (searchDate && r.date !== searchDate) return false;
            if (searchMonth && !r.date.startsWith(searchMonth)) return false;
            if (searchStatus === "late" && !isLate(r.checkInTime)) return false;
            if (searchStatus === "ontime" && isLate(r.checkInTime)) return false;
            if (searchStatus === "overtime" && !isOvertime(r.checkOutTime)) return false;
            return true;
        });
    }, [baseRecords, searchName, searchDate, searchMonth, searchStatus]);

    // Metrics
    const lateCount = filtered.filter(r => isLate(r.checkInTime)).length;
    const otCount = filtered.filter(r => isOvertime(r.checkOutTime)).length;
    const onTimeCount = filtered.length - lateCount;

    // Chart data — group by date
    const chartData = useMemo(() => {
        const map = {};
        filtered.forEach(r => {
            if (!map[r.date]) map[r.date] = { date: r.date.slice(5), present: 0, late: 0 };
            map[r.date].present++;
            if (isLate(r.checkInTime)) map[r.date].late++;
        });
        return Object.values(map).sort((a, b) => a.date.localeCompare(b.date)).slice(-10);
    }, [filtered]);

    const resetFilter = () => {
        setSearchName(""); setSearchDate(""); setSearchStatus(""); setSearchMonth("");
    };

    if (loading) {
        return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
    }

    if (!loggedInUserId) {
        return <div className="p-6 text-center text-muted-foreground">Redirecting to login...</div>;
    }

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="p-6 flex flex-col gap-5 min-h-screen bg-slate-50 dark:bg-slate-900">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-[17px] font-medium flex items-center gap-2">
                    Attendance
                    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-md ${isAdmin ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            : "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                        }`}>
                        {isAdmin ? "Admin" : "My Records"}
                    </span>
                </h1>
                <span className="text-sm text-muted-foreground">{filtered.length} records</span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: "Total records", value: filtered.length, sub: "" },
                    { label: "Late arrivals", value: lateCount, sub: "After 10:05 AM" },
                    { label: "Overtime days", value: otCount, sub: "After 7:00 PM" },
                    { label: "On time", value: onTimeCount, sub: "" },
                ].map(({ label, value, sub }) => (
                    <div key={label} className="bg-muted/50 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">{label}</p>
                        <p className="text-[22px] font-medium">{value}</p>
                        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
                    </div>
                ))}
            </div>

            {/* Chart */}
            <Card>
                <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm font-medium">Monthly attendance</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={chartData} barCategoryGap="30%">
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="present" name="Present" fill="#93C5FD" radius={[3, 3, 0, 0]} />
                            <Bar dataKey="late" name="Late" fill="#F0997B" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex flex-wrap gap-3 items-end">
                        {isAdmin && (
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-muted-foreground">Name</label>
                                <Input placeholder="Search employee…" value={searchName}
                                    onChange={e => setSearchName(e.target.value)} className="w-44 h-9 text-sm" />
                            </div>
                        )}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-muted-foreground">Date</label>
                            <Input type="date" value={searchDate}
                                onChange={e => setSearchDate(e.target.value)} className="h-9 text-sm" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-muted-foreground">Month</label>
                            <select value={searchMonth} onChange={e => setSearchMonth(e.target.value)}
                                className="h-9 text-sm px-2.5 rounded-md border border-input bg-background w-32">
                                <option value="">All months</option>
                                <option value="2026-06">Jun 2026</option>
                                <option value="2026-05">May 2026</option>
                                <option value="2026-04">Apr 2026</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-muted-foreground">Status</label>
                            <select value={searchStatus} onChange={e => setSearchStatus(e.target.value)}
                                className="h-9 text-sm px-2.5 rounded-md border border-input bg-background w-32">
                                <option value="">All statuses</option>
                                <option value="ontime">On time</option>
                                <option value="late">Late</option>
                                <option value="overtime">Overtime</option>
                            </select>
                        </div>
                        <Button variant="outline" className="h-9 text-sm gap-1.5" onClick={resetFilter}>
                            Reset
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardContent className="pt-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                                {isAdmin && <th className="px-4 py-3 text-left font-medium">Name</th>}
                                <th className="px-4 py-3 text-left font-medium">Date</th>
                                <th className="px-4 py-3 text-left font-medium">Check in</th>
                                <th className="px-4 py-3 text-left font-medium">Check out</th>
                                <th className="px-4 py-3 text-left font-medium">Total time</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                <th className="px-4 py-3 text-left font-medium">Overtime</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={isAdmin ? 7 : 6} className="px-4 py-8 text-center text-muted-foreground">No records found</td></tr>
                            ) : filtered.map(r => {
                                const late = isLate(r.checkInTime);
                                const ot = getOvertimeDisplay(r.checkOutTime);
                                return (
                                    <tr key={r._id} className="border-b hover:bg-muted/30 transition-colors">
                                        {isAdmin && <td className="px-4 py-3 font-medium">{r.name}</td>}
                                        <td className="px-4 py-3 text-muted-foreground">{r.date}</td>
                                        <td className="px-4 py-3">{r.checkInTime || "—"}</td>
                                        <td className="px-4 py-3">{r.checkOutTime || "—"}</td>
                                        <td className="px-4 py-3">{getTotalDuration(r.durations)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${late ? "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                                                    : "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                                                }`}>
                                                {late ? "Late" : "On time"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {ot !== "—"
                                                ? <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">{ot}</span>
                                                : <span className="text-muted-foreground">—</span>
                                            }
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}