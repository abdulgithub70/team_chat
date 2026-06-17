"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Users, UserPlus} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";


export default function AppShell({ children }) {
    const [open, setOpen] = useState(true   );
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [loggedInUserRole, setLoggedInUserRole] = useState(null);
    const [loggedInUserName, setLoggedInUserName] = useState("");

    const router = useRouter();


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
/*
    if (!loggedInUserId) {
        return <DashboardSkeleton />;
    }
*/
    //console.log("Logged in user Appshell:", { loggedInUserId, loggedInUserRole, loggedInUserName });

    


    return (
        <div className="flex h-screen bg-slate-40 ">

            {/* Sidebar */}
            <aside
                className={`bg-white border-r border-slate-200 transition-all duration-300 overflow-hidden
    w-11
    ${open ? "md:w-54" : "md:w-12"}`}
            >
                {/* Logo + Toggle */}
                <div className="h-16 flex items-center justify-between px-2 border-b">
                    <span className="font-bold whitespace-nowrap hidden md:inline">
                        {open && "My App"}
                    </span>
                    <button
                        onClick={() => setOpen(!open)}
                        className="text-sm px-2 py-1 border rounded flex-shrink-0"
                    >
                        ☰
                    </button>
                </div>

                {/* Menu */}
                <nav className="p-2 space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-2 p-2 rounded hover:bg-slate-100 whitespace-nowrap">
                        <span>🏠</span>
                        {open && <span>Dashboard</span>}
                    </Link>
                    <Link href="/Employees" className="flex items-center gap-2 p-2 rounded hover:bg-slate-100 whitespace-nowrap">
                        <span>👥</span>
                        {open && <span>Employees</span>}
                    </Link>
                    
                    <Link href="/Attendance" className="flex items-center gap-2 p-2 rounded hover:bg-slate-100 whitespace-nowrap">📥 
                        {open && <span>Attendance</span>}
                    </Link>
                    <Link href="/leave" className="flex items-center gap-2 p-2 rounded hover:bg-slate-100 whitespace-nowrap">🗓️ {open && <span className="">Leave</span>}</Link>
                    <Link href="/chat" className="flex items-center gap-2 p-2 rounded hover:bg-slate-100 whitespace-nowrap">💬 {open && <span>Chat</span>}</Link>
                   
                    <Link href="/reports" className="flex items-center gap-2 p-2 rounded hover:bg-slate-100 whitespace-nowrap">📊 {open && <span>Reports</span>}</Link>
                    
                    {loggedInUserRole === "admin" && (
                        <Link
                            href="/setting"
                            className="flex items-center gap-2 p-2 rounded hover:bg-slate-100 whitespace-nowrap"
                        >
                            ⚙ {open && <span>Settings</span>}
                        </Link>
                    )}
                    {loggedInUserRole === "admin" && (
                        <Link
                            href="/register"
                            className="flex items-center gap-2 p-2 rounded hover:bg-slate-100 whitespace-nowrap"
                        >
                            <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" /> {open && <span>Add Employee</span>}
                        </Link>
                    )}
                </nav>
            </aside>

            {/* Main Area */}
            <div className="flex flex-col flex-1">

                {/* Top Header */}
                <header className="bg-white border-b px-4 sm:px-6 py-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 bg-white rounded-2xl sm:rounded-full p-3 sm:p-4">
                        <h1 className="text-lg sm:text-2xl font-bold text-sky-500 truncate">
                            BLACKHOLE RETAIL
                        </h1>
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                            <p className="text-sm sm:text-base text-gray-700 truncate">
                                Welcome,{" "}
                                <span className="text-blue-600 font-semibold">
                                    {loggedInUserName}
                                </span>
                            </p>
                            
                           <div className="">
                            <NotificationBell
                                loggedInUserId={loggedInUserId}
                                loggedInUserRole={loggedInUserRole}
                            />
                            </div>
                            <Button
                                size="sm"
                                className="bg-red-500 text-white hover:bg-red-600 flex-shrink-0"
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="overflow-auto">
                    {children}

                </main>

            </div>
        </div>
    );
}