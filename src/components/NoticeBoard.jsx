"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function NoticeBoard({ role, userName }) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [notices, setNotices] = useState([]);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const isAdmin = role === "admin";

    /* 🔹 Fetch Notices */
    const fetchNotices = async () => {
        try {
            const res = await fetch(`${apiUrl}/notices`);
            const data = await res.json();
            setNotices(data);
        } catch {
            toast.error("Failed to load notices");
        }
    };

    /* 🔹 Add Notice (Admin) */
    const handleAddNotice = async () => {
        if (!title || !message) {
            toast.error("All fields required");
            return;
        }

        try {
            const res = await fetch(`${apiUrl}/notices`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, message, createdBy: userName }),
            });

            if (!res.ok) throw new Error();

            toast.success("Notice added");
            setTitle("");
            setMessage("");
            fetchNotices();
        } catch {
            toast.error("Failed to add notice");
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>📢 Notice Board</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                

                {/* 🔹 Notices List */}
                <div className="space-y-2">
                    {notices.length === 0 && (
                        <p className="text-gray-500 text-sm">No notices available</p>
                    )}

                    {notices.map((n) => (
                        <div key={n._id} className="border-b pb-2">
                            <p className="font-semibold">{n.title}</p>
                            <p className="text-sm text-gray-700">{n.message}</p>
                            <p className="text-xs text-gray-400">
                                {new Date(n.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>


                {/* 🔹 Admin Form */}
                {isAdmin && (
                    <div className="space-y-2 border p-3 rounded-md">
                        <Input
                            placeholder="Notice title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <Textarea
                            placeholder="Notice message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button onClick={handleAddNotice}>Add Notice</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
