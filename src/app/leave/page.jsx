"use client";
import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Leave from "@/components/Leave";
import { useRouter } from "next/navigation";
import { CalendarDays, Plus, X, Clock, CheckCircle2, XCircle, Hourglass } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function LeavePage() {
    const router = useRouter();
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [loggedInUserName, setLoggedInUserName] = useState("");
    const [role, setRole] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [leaves, setLeaves] = useState([]);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userId = localStorage.getItem("userId");
            const name = localStorage.getItem("userName");
            const userRole = localStorage.getItem("role");
            if (!userId) {
                router.push("/login");
                return;
            }
            setLoggedInUserId(userId);
            setLoggedInUserName(name);
            setRole(userRole);
        }
    }, [router]);

    // 📡 Fetch leave records for stats/graph
    useEffect(() => {
        if (!loggedInUserId) return;
        const fetchLeaves = async () => {
            try {
                const res = await fetch(`${apiUrl}/leave`);
                const data = await res.json();
                console.log("Fetched leaves:", data);
                setLeaves(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching leaves:", err);
            }
        };
        fetchLeaves();
    }, [loggedInUserId]);
    
    const isAdmin = role === "admin";

    // Role-based base data
    const baseLeaves = useMemo(() => {
        if (isAdmin) return leaves;
        return leaves.filter(l => l.userId === loggedInUserId);
    }, [leaves, isAdmin, loggedInUserId]);

    // Stats
    const stats = useMemo(() => {
        const total = baseLeaves.length;
        const pending = baseLeaves.filter(l => (l.status || "").toLowerCase() === "pending").length;
        const approved = baseLeaves.filter(l => (l.status || "").toLowerCase() === "approved").length;
        const rejected = baseLeaves.filter(l => (l.status || "").toLowerCase() === "rejected").length;
        return { total, pending, approved, rejected };
    }, [baseLeaves]);

    // Monthly chart data — group by month
    const chartData = useMemo(() => {
        const map = {};
        baseLeaves.forEach(l => {
            const month = (l.fromDate || l.date || "").slice(0, 7); // "2026-06"
            if (!month) return;
            if (!map[month]) map[month] = { month: month.slice(5), approved: 0, pending: 0, rejected: 0 };
            const status = (l.status || "pending").toLowerCase();
            if (map[month][status] !== undefined) map[month][status]++;
        });
        return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
    }, [baseLeaves]);

    if (!loggedInUserId || !role) {
        return (
            <div className="flex items-center justify-center min-h-screen text-muted-foreground text-sm">
                Loading leave data...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 space-y-5">

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-[17px] font-medium flex items-center gap-2">
                        <CalendarDays className="w-[18px] h-[18px] text-muted-foreground" />
                        Leave management
                        <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-md ${isAdmin
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            : "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                            }`}>
                            {isAdmin ? "Admin" : "My leaves"}
                        </span>
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isAdmin
                            ? "Review and manage leave requests from your team"
                            : "Apply for leave and track your requests"}
                    </p>
                </div>

                {!isAdmin && (
                    <Button
                        variant={showForm ? "outline" : "default"}
                        className="gap-2"
                        onClick={() => setShowForm(prev => !prev)}
                    >
                        {showForm ?  (
                            <>
                                <X className="w-4 h-4" /> Cancel
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" /> Apply for leave
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: "Total leaves", value: stats.total, icon: CalendarDays, color: "text-slate-500" },
                    { label: "Pending", value: stats.pending, icon: Hourglass, color: "text-amber-600 dark:text-amber-400" },
                    { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "text-green-600 dark:text-green-400" },
                    { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-600 dark:text-red-400" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Icon className={`w-4 h-4 ${color}`} />
                            <p className="text-xs text-muted-foreground">{label}</p>
                        </div>
                        <p className="text-[22px] font-medium">{value}</p>
                    </div>
                ))}
            </div>

            {/* Chart */}
            <Card className="border border-border/50 shadow-none">
                <div className="px-5 py-4 border-b border-border/50">
                    <h2 className="text-sm font-medium">Monthly leave trend</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {isAdmin ? "Across all employees" : "Your leave history"}
                    </p>
                </div>
                <div className="p-4">
                    {chartData.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-10">No leave data yet</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={chartData} barCategoryGap="30%">
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="approved" name="Approved" fill="#86C99A" radius={[3, 3, 0, 0]} />
                                <Bar dataKey="pending" name="Pending" fill="#F0C078" radius={[3, 3, 0, 0]} />
                                <Bar dataKey="rejected" name="Rejected" fill="#E89797" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </Card>

            {/* Apply Leave Form Section */}
            {showForm && !isAdmin && (
                <Card className="border border-border/50 shadow-none">
                    <div className="px-5 py-4 border-b border-border/50">
                        <h2 className="text-sm font-medium">New leave request</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Fill in the details below to submit your request
                        </p>
                    </div>
                    <div className="p-5">
                        <Leave
                            loggedInUserId={loggedInUserId}
                            loggedInUserName={loggedInUserName}
                            role={role}
                            mode="form"
                        />
                    </div>
                </Card>
            )}

            {/* Leave List */}
            <Card className="border border-border/50 shadow-none">
                <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
                    <h2 className="text-sm font-medium">
                        {isAdmin ? "All leave requests" : "Your leave requests"}
                    </h2>
                </div>
                <div className="max-h-[500px] overflow-y-auto p-5">
                    <Leave
                        loggedInUserId={loggedInUserId}
                        loggedInUserName={loggedInUserName}
                        role={role}
                        mode="list"
                    />
                </div>
            </Card>
        </div>
    );
}