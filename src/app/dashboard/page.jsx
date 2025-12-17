"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Leave from "@/components/Leave";
import Attendance from "@/components/Attendance";
import AttendanceList from "@/components/AttendanceList";
import NoticeBoard from "@/components/NoticeBoard";




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

    useEffect(() => {
        if (typeof window !== "undefined") {
            const uid = localStorage.getItem("userId");
            const role = localStorage.getItem("role");
            const uname = localStorage.getItem("userName");

            if (!uid) return router.push("/login");

            setLoggedInUserId(uid);
            setLoggedInUserRole(role);
            setLoggedInUserName(uname);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.clear();
        router.push("/login");
    };

    if (!loggedInUserId) {
        return <DashboardSkeleton />;
    }


    return (
        <div className="min-h-screen p-6 bg-gray-100">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Employee Dashboard</h1>

                <div className="flex items-center gap-4">
                    <p className="text-gray-700">
                        Welcome,{" "}
                        <span className="text-blue-600 font-semibold">
                            {loggedInUserName}
                        </span>
                    </p>

                    <Button
                        className="bg-red-500 text-white hover:bg-red-600"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </div>
            </div>

            {/* MAIN GRID — 4 columns but using 3 for now */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* COLUMN 1 — Notice + Chat Button */}
                <div className="space-y-6">
                    {/* COLUMN 4 — Empty for now (future use) */}
                    <div className="space-y-6 text-gray-400 text-center italic">

                        <NoticeBoard
                            role={loggedInUserRole}
                            userName={loggedInUserName}
                        />

                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Chat</CardTitle>
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
                
                {/* COLUMN 2 — Attendance + Attendance List */}
                <div className="space-y-6">
                    <Attendance
                        loggedInUserId={loggedInUserId}
                        loggedInUserName={loggedInUserName}
                    />

                    <div className="overflow-y-auto max-h-[500px]">
                        <AttendanceList
                            loggedInUserId={loggedInUserId}
                            loggedInUserName={loggedInUserName}
                            role={loggedInUserRole}
                        />
                    </div>
                </div>

                {/* COLUMN 3 — Leave Apply + Leave List */}
                <div className="space-y-6 overflow-y-auto max-h-[700px]">
                    <Leave
                        loggedInUserId={loggedInUserId}
                        loggedInUserName={loggedInUserName}
                        role={loggedInUserRole}
                    />

                    <div className="overflow-y-auto max-h-[500px]">
                        {/* Leave List already shown inside Leave component 
                            If it's missing, we can add LeaveList component here separately */}
                    </div>
                </div>

                
            </div>
        </div>
    );
}
