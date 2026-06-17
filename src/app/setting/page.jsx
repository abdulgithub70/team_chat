"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, Building2, Bell, Save, Briefcase, DollarSign, CheckCircle2, ChevronDown } from "lucide-react";

const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "company", label: "Company", icon: Building2 },
    { id: "notifications", label: "Notifications", icon: Bell },
];

export default function SettingsPage() {
    const router = useRouter();
    const [role, setRole] = useState("");
    const [userId, setUserId] = useState("");
    const [activeTab, setActiveTab] = useState("profile");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // ── Employee list (admin ke liye) ─────────────────────────────────────
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [editData, setEditData] = useState({ salary: "", designation: "" });
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // ── Notifications ─────────────────────────────────────────────────────
    const [notifications, setNotifications] = useState({
        leaveApproval: true,
        leaveRejection: true,
        attendanceAlert: false,
        salarySlip: true,
        noticeBoard: true,
    });

    // ── Company settings ──────────────────────────────────────────────────
    const [company, setCompany] = useState({
        checkInTime: "10:00",
        lateAfterMinutes: "5",
        officeEndTime: "19:00",
        overtimeRatePerHour: "100",
        workingDaysPerMonth: "26",
        freeLeavesPerMonth: "1",
        weeklyOff: "Sunday",
    });

    // ── Load user + data ──────────────────────────────────────────────────
    useEffect(() => {
        if (typeof window !== "undefined") {
            const uid = localStorage.getItem("userId");
            const userRole = localStorage.getItem("role");
            if (!uid) { router.push("/login"); return; }
            setUserId(uid);
            setRole(userRole);

            const savedCompany = localStorage.getItem("companySettings");
            if (savedCompany) setCompany(JSON.parse(savedCompany));

            const savedNotif = localStorage.getItem("notificationPrefs");
            if (savedNotif) setNotifications(JSON.parse(savedNotif));

            // Admin → fetch employees
            if (userRole === "admin") {
                fetch(`${apiUrl}/auth/employees`)
                    .then(r => r.json())
                    .then(data => setEmployees(Array.isArray(data) ? data : []))
                    .catch(err => console.error(err));
            }
        }
    }, [router]);

    const isAdmin = role === "admin";

    // ── Select employee from dropdown ─────────────────────────────────────
    const handleSelectEmployee = (emp) => {
        setSelectedEmployee(emp);
        setEditData({
            salary: emp.salary || "",
            designation: emp.designation || "",
        });
        setDropdownOpen(false);
    };

    // ── Save employee update ──────────────────────────────────────────────
    const handleUpdateEmployee = async () => {
        if (!selectedEmployee) {
            toast.error("Please select an employee first");
            return;
        }
        try {
            const res = await fetch(`${apiUrl}/auth/update/${selectedEmployee._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    salary: editData.salary,
                    designation: editData.designation,
                }),
            });
            if (!res.ok) throw new Error("Failed");
            toast.success(`${selectedEmployee.name} updated successfully`);

            // Update local list too
            setEmployees(prev => prev.map(e =>
                e._id === selectedEmployee._id
                    ? { ...e, salary: editData.salary, designation: editData.designation }
                    : e
            ));
            setSelectedEmployee(prev => ({
                ...prev,
                salary: editData.salary,
                designation: editData.designation,
            }));
        } catch (err) {
            toast.error("Failed to update");
        }
    };

    // ── Company save ──────────────────────────────────────────────────────
    const handleSaveCompany = () => {
        localStorage.setItem("companySettings", JSON.stringify(company));
        toast.success("Company settings saved");
    };

    // ── Notifications save ────────────────────────────────────────────────
    const handleSaveNotifications = () => {
        localStorage.setItem("notificationPrefs", JSON.stringify(notifications));
        toast.success("Notification preferences saved");
    };

    if (!userId || !role) return (
        <div className="flex items-center justify-center min-h-screen text-muted-foreground text-sm">
            Loading...
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-[17px] font-medium">Settings</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage company config and preferences
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
                    {TABS.map(({ id, label, icon: Icon }) => {
                        if (id === "profile" && !isAdmin) return null;
                        if (id === "company" && !isAdmin) return null;
                        return (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === id
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* ── PROFILE TAB — Admin employee update ───────────────────── */}
                {activeTab === "profile" && isAdmin && (
                    <Card className="border border-border/50 shadow-none">
                        <div className="px-5 py-4 border-b border-border/50">
                            <h2 className="text-sm font-medium">Update employee</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Select an employee and update their salary or designation
                            </p>
                        </div>
                        <CardContent className="p-5 space-y-5">

                            {/* Employee dropdown */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" /> Select employee
                                </label>
                                <div className="relative">
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="w-full h-9 flex items-center justify-between px-3 text-sm border border-input rounded-md bg-background hover:bg-muted/40 transition-colors"
                                    >
                                        <span className={selectedEmployee ? "text-foreground" : "text-muted-foreground"}>
                                            {selectedEmployee
                                                ? `${selectedEmployee.name} — ${selectedEmployee.designation || "No designation"}`
                                                : "Choose an employee..."}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    </button>

                                    {/* Dropdown list */}
                                    {dropdownOpen && (
                                        <div className="absolute z-10 top-10 left-0 w-full bg-background border border-border rounded-lg shadow-md max-h-52 overflow-y-auto">
                                            {employees.length === 0 ? (
                                                <p className="text-sm text-muted-foreground p-3">No employees found</p>
                                            ) : employees.map(emp => (
                                                <button
                                                    key={emp._id}
                                                    onClick={() => handleSelectEmployee(emp)}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                                                >
                                                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 text-xs font-semibold flex-shrink-0">
                                                        {emp.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium truncate">{emp.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {emp.designation || "—"} · ₹{Number(emp.salary || 0).toLocaleString("en-IN")}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Edit fields — sirf tab dikhao jab employee selected ho */}
                            {selectedEmployee && (
                                <>
                                    {/* Selected employee info */}
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 font-semibold">
                                            {selectedEmployee.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{selectedEmployee.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {selectedEmployee.department || "—"} · {selectedEmployee.email || "—"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Editable fields */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                <Briefcase className="w-3.5 h-3.5" /> Designation
                                            </label>
                                            <Input
                                                value={editData.designation}
                                                onChange={e => setEditData(prev => ({ ...prev, designation: e.target.value }))}
                                                placeholder="e.g. Manager, Executive"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                <DollarSign className="w-3.5 h-3.5" /> Monthly salary (₹)
                                            </label>
                                            <Input
                                                type="number"
                                                value={editData.salary}
                                                onChange={e => setEditData(prev => ({ ...prev, salary: e.target.value }))}
                                                placeholder="e.g. 25000"
                                            />
                                        </div>
                                    </div>

                                    <Button onClick={handleUpdateEmployee} className="gap-2">
                                        <Save className="w-4 h-4" /> Save changes
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ── COMPANY TAB ───────────────────────────────────────────── */}
                {activeTab === "company" && isAdmin && (
                    <Card className="border border-border/50 shadow-none">
                        <div className="px-5 py-4 border-b border-border/50">
                            <h2 className="text-sm font-medium">Company configuration</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Office hours, leave policy, salary rules</p>
                        </div>
                        <CardContent className="p-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { key: "checkInTime", label: "Check-in time", type: "time" },
                                    { key: "lateAfterMinutes", label: "Late after (minutes)", type: "number" },
                                    { key: "officeEndTime", label: "Office end time", type: "time" },
                                    { key: "overtimeRatePerHour", label: "Overtime rate (₹/hr)", type: "number" },
                                    { key: "workingDaysPerMonth", label: "Working days/month", type: "number" },
                                    { key: "freeLeavesPerMonth", label: "Free leaves/month", type: "number" },
                                ].map(({ key, label, type }) => (
                                    <div key={key} className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">{label}</label>
                                        <Input
                                            type={type}
                                            value={company[key]}
                                            onChange={e => setCompany(prev => ({ ...prev, [key]: e.target.value }))}
                                        />
                                    </div>
                                ))}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Weekly off</label>
                                    <select
                                        value={company.weeklyOff}
                                        onChange={e => setCompany(prev => ({ ...prev, weeklyOff: e.target.value }))}
                                        className="h-9 w-full text-sm px-2.5 rounded-md border border-input bg-background"
                                    >
                                        {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <Button onClick={handleSaveCompany} className="gap-2">
                                <Save className="w-4 h-4" /> Save company settings
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* ── NOTIFICATIONS TAB ─────────────────────────────────────── */}
                {activeTab === "notifications" && (
                    <Card className="border border-border/50 shadow-none">
                        <div className="px-5 py-4 border-b border-border/50">
                            <h2 className="text-sm font-medium">Notification preferences</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Choose what you want to be notified about</p>
                        </div>
                        <CardContent className="p-5 space-y-2">
                            {[
                                { key: "leaveApproval", label: "Leave approved", sub: "When your leave is approved" },
                                { key: "leaveRejection", label: "Leave rejected", sub: "When your leave is denied" },
                                { key: "attendanceAlert", label: "Attendance alert", sub: "Daily check-in reminder" },
                                { key: "salarySlip", label: "Salary processed", sub: "When monthly salary is calculated" },
                                { key: "noticeBoard", label: "New notice", sub: "When admin posts a new notice" },
                            ].map(({ key, label, sub }) => (
                                <div
                                    key={key}
                                    onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
                                    className="flex items-center justify-between p-3.5 rounded-xl hover:bg-muted/40 cursor-pointer transition-colors"
                                >
                                    <div>
                                        <p className="text-sm font-medium">{label}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                                    </div>
                                    <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${notifications[key] ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700"
                                        }`}>
                                        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${notifications[key] ? "translate-x-4" : "translate-x-0"
                                            }`} />
                                    </div>
                                </div>
                            ))}
                            <div className="pt-2">
                                <Button onClick={handleSaveNotifications} className="gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Save preferences
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}