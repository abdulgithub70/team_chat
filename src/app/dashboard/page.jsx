"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AppSidebar } from "@/components/AppSidebar";
import ChatBox from "@/components/ChatBox";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Leave from "@/components/Leave";
import Attendance from "@/components/Attendance"; // 👈 new import
import AttendanceList from "@/components/AttendanceList";

export default function Dashboard() {
    const router = useRouter();
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [loggedInUserRole, setLoggedInUserRole] = useState(null);
    const [loggedInUserName, setLoggedInUserName] = useState("");
    const [activeEmployee, setActiveEmployee] = useState(null);

    const [notices, setNotices] = useState([
        { id: 1, message: "Meeting at 10 AM tomorrow" },
        { id: 2, message: "Employee of the Month: Ayaan" },
        { id: 3, message: "Next holiday: Diwali (Nov 1)" },
    ]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userId = localStorage.getItem("userId");
            const role = localStorage.getItem("role");
            const name = localStorage.getItem("userName");

            if (!userId) {
                router.push("/login");
                return;
            }

            setLoggedInUserId(userId);
            setLoggedInUserRole(role);
            setLoggedInUserName(name);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.clear();
        router.push("/login");
    };

    if (!loggedInUserId || !loggedInUserRole || !loggedInUserName) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <>
            <div>
                <SidebarProvider>
                    <div className="flex min-h-screen border-2 border-black bg-gray-100">
                        {/* Sidebar */}
                        <AppSidebar
                            onSelectEmployee={(emp) => setActiveEmployee(emp)}
                            loggedInUserId={loggedInUserId}
                            role={loggedInUserRole}
                        />

                        {/* Main Dashboard */}
                        <main className="flex-1 p-6">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold">Employee Dashboard</h1>
                                <div className="flex items-center gap-4">
                                    <p className="text-gray-700">
                                        Welcome, <span className="text-blue-600 font-semibold">{loggedInUserName}</span>
                                    </p>
                                    <Button
                                        className="bg-red-500 text-white hover:bg-red-600"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </Button>
                                </div>
                            </div>

                            {/* Grid Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                {/* LEFT COLUMN */}
                                <div className="space-y-6">
                                    {/* Notice Board */}
                                    <Card className="bg-white shadow-md">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <span>📢</span> Notice Board
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            {notices.map((notice) => (
                                                <p key={notice.id} className="text-gray-700">
                                                    {notice.message}
                                                </p>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* CENTER COLUMN */}
                                <div className="space-y-">
                                    {/* Team Chat */}
                                    <Card className="bg-white shadow-md">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <span>💬</span> Team Chat
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ChatBox
                                                activeEmployee={activeEmployee}
                                                loggedInUserId={loggedInUserId}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* RIGHT COLUMN */}
                                <div className="space-y-6">
                                    {/* Attendance */}
                                    <Attendance   
                                        loggedInUserId={loggedInUserId}
                                        loggedInUserName={loggedInUserName}
                                    />
                                    <div className="space-y-6 overflow-y-auto max-h-[500px]">
                                        <AttendanceList loggedInUserId={loggedInUserId}
                                            loggedInUserName={loggedInUserName}
                                            role={loggedInUserRole} />
                                    </div>
                                </div>
                                {/* RIGHT COLUMN */}
                                <div className="space-y-6 transparent rounded-lg ">
                                    {/* Attendance */}
                                    
                                    <div className="space-y-6 overflow-y-auto max-h-[693px]">
                                        <Leave loggedInUserId={loggedInUserId}
                                            loggedInUserName={loggedInUserName}
                                            role={loggedInUserRole} />
                                    </div>
                                </div>

                                

                            </div>
                        </main>
                    </div>
                </SidebarProvider>
            </div>
        </>
    );
}
