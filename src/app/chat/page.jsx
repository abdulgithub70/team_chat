"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import EmployeeList from "@/components/EmployeeList";
import ChatBox from "@/components/ChatBox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
export default function ChatPage() {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const loggedInUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    const router = useRouter();

    return (
        <div className="flex h-screen relative bg-gray-300">

            {/* =============================
            MOBILE TOP BAR WITH HAMBURGER
        ============================== */}
            <div className="lg:hidden w-full p-4 border-b flex items-center justify-between bg-white shadow-md fixed top-0 left-0 z-40">
                <Menu
                    size={28}
                    onClick={() => setSidebarOpen(true)}
                    className="cursor-pointer text-gray-700"
                />

                <h2 className="text-lg font-semibold">Chat</h2>

                
            </div>

            {/* ======================================
            SIDEBAR — DESKTOP (always visible)
        ======================================= */}
            <div className="hidden lg:block w-1/4 border-r bg-white">
                <EmployeeList
                    loggedInUserId={loggedInUserId}
                    onSelectEmployee={setSelectedEmployee}
                />
            </div>

            {/* ======================================
            SIDEBAR — MOBILE (Slide-in)
        ======================================= */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div
                        className="flex-1 bg-black/40"
                        onClick={() => setSidebarOpen(false)}
                    ></div>

                    <div className="w-3/4 max-w-[280px] bg-white shadow-xl h-full p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-semibold">Employees</h2>

                            {/* BACK BUTTON INSIDE DRAWER */}
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
                            >
                                Back
                            </button>
                        </div>

                        <EmployeeList
                            loggedInUserId={loggedInUserId}
                            onSelectEmployee={(emp) => {
                                setSelectedEmployee(emp);
                                setSidebarOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* ======================================
              CHATBOX AREA
        ======================================= */}
            <div className="flex-1 lg:m-8 mt-16 lg:mt-0  flex flex-col bg-white shadow-sm">

                {/* CHAT HEADER (DESKTOP) */}
                <div className="flex justify-between items-center  px-4 py-3 border-b ">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        💬 Team Chat
                    </div>

                    {/* BACK BUTTON (DESKTOP) */}
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                <div className="flex-1 overflow-hidden">
                    <ChatBox
                        activeEmployee={selectedEmployee}
                        loggedInUserId={loggedInUserId}
                    />
                </div>
            </div>
        </div>
    );

}
