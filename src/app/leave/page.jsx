"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Leave from "@/components/Leave";
import { useRouter } from "next/navigation";

export default function LeavePage() {
    const router = useRouter();

    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [loggedInUserName, setLoggedInUserName] = useState("");
    const [role, setRole] = useState("");

    const [showForm, setShowForm] = useState(false);

    // ✅ Fetch user info from localStorage (client-side only)
    useEffect(() => {
        if (typeof window !== "undefined") {
            const userId = localStorage.getItem("userId");
            const name = localStorage.getItem("userName");
            const userRole = localStorage.getItem("role");

            if (!userId) {
                router.push("/login"); // redirect if not logged in
                return;
            }

            setLoggedInUserId(userId);
            setLoggedInUserName(name);
            setRole(userRole);
        }
    }, [router]);

    // Loader while fetching user data
    if (!loggedInUserId || !role) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-600">
                Loading leave data...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>

                {/* Toggle leave form */}
                {role !== "admin" && (
                    <Button
                        className="bg-teal-500 hover:bg-teal-600 text-white"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? "Hide Form" : "Apply for Leave"}
                    </Button>
                )}
            </div>

            {/* Apply Leave Form Section */}
            {showForm && role !== "admin" && (
                <Card className="p-4 bg-white shadow-md">
                    <h2 className="font-semibold text-gray-800 mb-3">
                        Apply for Leave
                    </h2>
                    <Leave
                        loggedInUserId={loggedInUserId}
                        loggedInUserName={loggedInUserName}
                        role={role}
                    />
                </Card>
            )}

            {/* Leave List (Always visible with scroll) */}
            <Card className="p-4 bg-white shadow-md">
                <h2 className="font-bold mb-4 text-gray-800">
                    {role === "admin" ? "All Leave Requests" : "Your Leave Requests"}
                </h2>

                {/* Scrollable container */}
                <div className="max-h-[50px] overflow-y-auto">
                    {/* ✅ Reuse same Leave component for listing */}
                    <Leave
                        loggedInUserId={loggedInUserId}
                        loggedInUserName={loggedInUserName}
                        role={role}
                    />
                </div>
            </Card>

        </div>
    );
}
