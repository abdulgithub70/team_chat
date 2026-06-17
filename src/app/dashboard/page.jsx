"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import AppShell from "@/components/AppShell";
//import Leave from "@/components/Leave";
import Attendance from "@/components/Attendance";
import AttendanceList from "@/components/AttendanceList";
import NoticeBoard from "@/components/NoticeBoard";
import { Users, UserCheck, CalendarX, UserX, FileSpreadsheet, CalendarPlus, Clock, MessageCircle } from "lucide-react";




function DashboardSkeleton() {
    return (
        <div className="min-h-screen p-6 space-y-6">
            <Skeleton className="h-8 w-64" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
            </div>
        </div>
    );
}

export default function Dashboard() {
    const router = useRouter();

    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [loggedInUserRole, setLoggedInUserRole] = useState(null);
    const [loggedInUserName, setLoggedInUserName] = useState("");
    const [loggedInjoiningDate, setLoggedInJoiningDate] = useState("");
    const [loggedIndepartment, setLoggedInDepartment] = useState("");
    const [loggedIndesignation, setLoggedInDesignation] = useState("");
    const [loggedInsalary, setLoggedInSalary] = useState("");
    const [employeeCount, setEmployeeCount] = useState(0);
    const [presentToday, setPresentToday] = useState(0);
    const [presentList, setPresentList] = useState([]);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const fetchEmployeeCount = async () => {
            try {
                const res = await fetch(
                    `${apiUrl}/auth/employee-count`
                );
                console.log("API Response for employee count:", res);
                const data = await res.json();

                setEmployeeCount(data.count);

            } catch (error) {
                console.log("Error fetching count:", error);
            }
        };

        fetchEmployeeCount();
    }, []);

    useEffect(() => {
        const fetchPresentToday = async () => {
            try {
                const res = await fetch(
                    `${apiUrl}/attendance/checkin-log/today`
                );

                const data = await res.json();

                setPresentToday(data.count);
                setPresentList(data.data);

            } catch (error) {
                console.log(error);
            }
        };

        fetchPresentToday();
    }, []);


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
console.log("Dashboard - loggedInUserId:", loggedInUserId, "| Role:", loggedInUserRole);
    const handleLogout = () => {
        localStorage.clear();
        router.push("/login");
    };

    //Total Absent Employees
    const totalAbsent = employeeCount - presentToday;

    if (!loggedInUserId) {
        return <DashboardSkeleton />;
    }

    

    return (
        <div className="min-h-screen p-1 rounded-lg bg-gray-100 h-auto">

            

            {/*} <AppShell className="mb-6 bg-gray-300" > */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-40 h-auto">

                {/* Total Employees */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Employees</p>
                            <h2 className="text-2xl font-bold text-slate-800">{employeeCount}</h2>
                        </div>
                        <Users className="text-blue-500 w-8 h-8" />
                    </div>
                </div>

                {/* Present */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Present Today</p>
                            <h2 className="text-2xl font-bold text-green-600">{presentToday}</h2>
                        </div>
                        <UserCheck className="text-green-500 w-8 h-8" />
                    </div>
                </div>

                {/* On Leave */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">On Leave</p>
                            <h2 className="text-2xl font-bold text-yellow-600">12</h2>
                        </div>
                        <CalendarX className="text-yellow-500 w-8 h-8" />
                    </div>
                </div>

                {/* Absent */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Absent</p>
                            <h2 className="text-2xl font-bold text-red-600">{totalAbsent}</h2>
                        </div>
                        <UserX className="text-red-500 w-8 h-8" />
                    </div>
                </div>

            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">

                {/* Column 1 — Attendance widget + Chat */}
                <div className="bg-gray-100 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                    <Attendance
                        loggedInUserId={loggedInUserId}
                        loggedInUserName={loggedInUserName}
                    />
                    <Card className="shadow-none border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Chat</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={() => router.push("/chat")}
                                className="w-full bg-blue-500 text-white hover:bg-blue-600"
                            >
                                Open Chat
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Column 2 — Attendance records (scrollable list, fixed-height card) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[330px]">
                    <div className="px-4 py-2 border-b border-slate-200 flex-shrink-0">
                        <h2 className="text-sm font-medium text-slate-800">Attendance records</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        
                        <NoticeBoard
                            role={loggedInUserRole}
                            userName={loggedInUserName}
                        />
                    </div>
                </div>

                {/* Column 3 — Notice board (scrollable list, fixed-height card) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[330px]">
                    <div className="px-4 py-3 border-b border-slate-200 flex-shrink-0">
                        <h2 className="text-sm font-medium text-slate-800">Notice board</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto px- py-1">
                        
                        <AttendanceList
                            loggedInUserId={loggedInUserId}
                            loggedInUserName={loggedInUserName}
                            role={loggedInUserRole}
                        />
                    </div>
                </div>

            </div>
            {/*}  </AppShell> */}

            {/* Column 3 — Quick links */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px] mt-2">
                <div className="px-4 py-3 border-b border-slate-200 flex-shrink-0">
                    <h2 className="text-sm font-medium text-slate-800">Quick links</h2>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                    <button
                        onClick={() => router.push("/reports")}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors text-left"
                    >
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">View reports</span>
                    </button>

                    <button
                        onClick={() => router.push("/leave")}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors text-left"
                    >
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                            <CalendarPlus className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-700"> Leave</span>
                    </button>

                    <button
                        onClick={() => router.push("/Attendance")}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors text-left"
                    >
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-700"> Attendances</span>
                    </button>

                    {loggedInUserRole === "admin" && (
                        <button
                            onClick={() => router.push("/Employees")}
                            className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors text-left"
                        >
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                                <Users className="w-4 h-4 text-amber-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">Employees</span>
                        </button>
                    )}

                    <button
                        onClick={() => router.push("/chat")}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors text-left"
                    >
                        <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                            <MessageCircle className="w-4 h-4 text-pink-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">Open chat</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
