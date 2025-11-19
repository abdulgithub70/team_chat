"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Leave({ loggedInUserId, loggedInUserName, role }) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");
    const [leaves, setLeaves] = useState([]);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Fetch leaves
    useEffect(() => {
        if (!loggedInUserId) return;

        const fetchLeaves = async () => {
            try {
                const res = await fetch(
                    `${apiUrl}/leave?userId=${loggedInUserId}&role=${role}`
                );
                const data = await res.json();
                setLeaves(data);
            } catch (err) {
                console.error("Failed to fetch leaves:", err);
            }
        };

        fetchLeaves();
    }, [loggedInUserId, role]);

    // Apply leave
    const handleApply = async () => {
        if (!startDate || !endDate || !reason.trim()) {
            alert("Please fill all fields");
            return;
        }

        try {
            const res = await fetch(`${apiUrl}/leave/apply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employeeId: loggedInUserId,
                    employeeName: loggedInUserName,
                    startDate,
                    endDate,
                    reason,
                }),
            });

            if (!res.ok) throw new Error("Failed to apply leave");

            const newLeave = await res.json();
            setLeaves((prev) => [newLeave, ...prev]);
            setStartDate("");
            setEndDate("");
            setReason("");
        } catch (err) {
            console.error(err);
            alert("Failed to apply leave");
        }
    };

    // Admin approve/deny
    const handleStatus = async (id, status) => {
        try {
            const res = await fetch(`${apiUrl}/leave/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) throw new Error("Failed to update status");

            const updatedLeave = await res.json();
            setLeaves((prev) =>
                prev.map((l) => (l._id === id ? updatedLeave : l))
            );
        } catch (err) {
            console.error(err);
            alert("Failed to update leave status");
        }
    };


    return (
        <div className="space-y-2 col-gap-2">
            {/* Employee Leave Form */}
            {role !== "admin" && (
                <Card className="p-2 m-0 bg-white shadow-md">
                    <h2 className="font-bold mb-0">Apply Leave</h2>
                    <label htmlFor="start-date" className="m-0">From</label>
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mb-0"
                        placeholder="Start Date"
                    />
                    <label htmlFor="end-date">To</label>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mb-0"
                    />
                    <textarea
                        placeholder="Reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full  p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px] resize-none"
                    ></textarea>
                    <Button onClick={handleApply}>Apply for Leave</Button>
                </Card>
            )}

            {/* Leave List */}
            <Card className="p-4 bg-white shadow-md mt-4">
                <h2 className="font-bold mb-2">Leave Requests</h2>
                {leaves.length === 0 && <p className="text-gray-500">No leaves found</p>}
                <div className="">
                    {leaves.map((l) => {
                        // Format start and end date
                        const start = new Date(l.startDate).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        });
                        const end = new Date(l.endDate).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        });

                        return (
                            <Card key={l._id} className="p-2 border rounded flex justify-between items-center">
                                <div>
                                    <p>
                                        <strong>{l.employeeName}</strong> 
                                    </p>
                                    <p className="text-sky-400">Leave From {start} To {end}  </p>
                                    <p className="text-gray-600">{l.reason}</p>
                                    <p className={`mt-1 font-semibold ${l.status === "approved"
                                        ? "text-green-600"
                                        : l.status === "denied"
                                            ? "text-red-600"
                                            : "text-yellow-600"
                                        }`}>
                                        Status: {l.status || "pending"}
                                    </p>
                                </div>

                                {/* Admin action buttons */}
                                {role === "admin" && l.status === "pending" && (
                                    <div className="flex space-x-2">
                                        <Button
                                            className="bg-green-500 hover:bg-green-600 text-white"
                                            onClick={() => handleStatus(l._id, "approved")}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            className="bg-red-500 hover:bg-red-600 text-white"
                                            onClick={() => handleStatus(l._id, "denied")}
                                        >
                                            Deny
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>  

            </Card>
        </div>
    );
}
