"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Leave({ loggedInUserId, loggedInUserName, role, mode = "list" }) {
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
            toast.error("Please fill all fields");
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
            toast.success("Leave applied successfully");
        } catch (err) {
            console.error(err);
            toast.error("Failed to apply leave");
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
            toast.error("Failed to update leave status");
        }
    };

    // ── FORM MODE ──────────────────────────────────────────────────────────
    if (mode === "form") {
        if (role === "admin") return null; // admins don't see the form

        return (
            <div className="space-y-3">
                <div className="space-y-1.5">
                    <label htmlFor="start-date" className="text-sm font-medium text-muted-foreground">From</label>
                    <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="end-date" className="text-sm font-medium text-muted-foreground">To</label>
                    <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Reason</label>
                    <textarea
                        placeholder="Reason for leave"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px] resize-none"
                    />
                </div>
                <Button onClick={handleApply} className="w-full">Apply for leave</Button>
            </div>
        );
    }

    // ── LIST MODE ─────────────────────────────────────────────────────────
    return (
        <div className="space-y-3">
            {leaves.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No leave requests found</p>
            )}
            {leaves.map((l) => {
                const start = new Date(l.startDate).toLocaleDateString("en-US", {
                    day: "2-digit", month: "short", year: "numeric",
                });
                const end = new Date(l.endDate).toLocaleDateString("en-US", {
                    day: "2-digit", month: "short", year: "numeric",
                });
                return (
                    <Card key={l._id} className="p-3 border border-border/50 shadow-none flex justify-between items-start gap-3">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">{l.employeeName}</p>
                            <p className="text-xs text-blue-600">Leave from {start} to {end}</p>
                            <p className="text-xs text-muted-foreground">{l.reason}</p>
                            <p className={`text-xs font-medium ${l.status === "approved" ? "text-green-600"
                                    : l.status === "denied" ? "text-red-600"
                                        : "text-amber-600"
                                }`}>
                                Status: {l.status || "pending"}
                            </p>
                        </div>

                        {role === "admin" && l.status === "pending" && (
                            <div className="flex gap-2 flex-shrink-0">
                                <Button
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                    onClick={() => handleStatus(l._id, "approved")}
                                >
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
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
    );
}