"use client";

import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, FileText, X } from "lucide-react";
import { Send } from "lucide-react";

//const socket = io("http://localhost:5000");
const socket = io(process.env.NEXT_PUBLIC_API_URL.replace("/api", ""));

export default function ChatBox({ activeEmployee, loggedInUserId }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const messagesContainerRef = useRef(null);


    useEffect(() => {
        if (loggedInUserId) socket.emit("registerUser", loggedInUserId);
    }, [loggedInUserId]);

    useEffect(() => {
        if (!activeEmployee) return;
        setMessages([]);

        const fetchMessages = async () => {
            try {
                const res = await fetch(
                    `${apiUrl}/messages?senderId=${loggedInUserId}&receiverId=${activeEmployee._id}`
                );
                const data = await res.json();
                setMessages(data || []);
            } catch (err) {
                console.error("Failed to load messages:", err);
            }
        };

        fetchMessages();
    }, [activeEmployee, loggedInUserId]);

    useEffect(() => {
        const audio = new Audio("/notificationRing.mp3");
        if (Notification.permission !== "granted") Notification.requestPermission();

        socket.on("receiveMessage", (data) => {
            if (
                data.senderId === activeEmployee?._id ||
                data.receiverId === activeEmployee?._id
            ) {
                setMessages((prev) => [...prev, data]);
                if (data.senderId !== loggedInUserId) {
                    audio.play().catch(() => { });
                    if (document.hidden) {
                        new Notification("New message!", {
                            body: data.message || "You received a new message",
                            icon: "/chat-icon.png",
                        });
                    }
                }
            }
        });

        return () => socket.off("receiveMessage");
    }, [activeEmployee, loggedInUserId]);

    

    // 2️⃣ Auto scroll effect
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight; // scroll to bottom
        }
    }, [messages]); // jab messages update ho


    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            if (selected.type.startsWith("image/")) {
                setPreview(URL.createObjectURL(selected));
            } else {
                setPreview(null);
            }
        }
    };

    const handleSend = async () => {
        if ((!message.trim() && !file) || !activeEmployee) return;

        let fileUrl = null;

        // ✅ Upload file if present
        if (file) {
            const formData = new FormData();
            formData.append("file", file);

            try {
                const uploadRes = await fetch(`${apiUrl}/upload`, {
                    method: "POST",
                    body: formData,
                });
                console.log("Upload response:", formData.get("file"));
                const uploadData = await uploadRes.json();
                fileUrl = uploadData.fileUrl; // your backend must return { url: "uploaded_link" }
                console.log("File uploaded to:", fileUrl, uploadData);
            } catch (err) {
                console.error("File upload failed:", err);
            }
        }

        const newMessage = {
            senderId: loggedInUserId,
            receiverId: activeEmployee._id,
            text: message,
            fileUrl: fileUrl || null,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setMessage("");
        setFile(null);
        setPreview(null);

        socket.emit("sendMessage", newMessage);

        try {
            await fetch(`${apiUrl}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMessage),
            });
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    return (
        <section className="w-full h-full flex flex-col min-h-0">

            {activeEmployee ? (
                <Card
                    className="flex flex-col h-full w-full bg-gradient-to-r from-indigo-300 to-orange-300 bg-opacity-20 border-2 border-black"
                    style={{ backgroundImage: "url('/bgImg.png')", backgroundSize: "cover" }}
                >

                    <CardHeader className="shrink-0">
                        <CardTitle >Chat with {activeEmployee.name}</CardTitle>
                    </CardHeader>

                    {/* ============================
                MESSAGES AREA - FULL HEIGHT
            ============================= */}
                    <div
                        ref={messagesContainerRef}
                        className="flex flex-col flex-1 overflow-y-auto p-3 space-y-2 min-h-0"
                    >

                        {messages.length > 0 ? (
                            <>
                                {messages.map((msg, index) => {
                                    const isSender = msg.senderId === loggedInUserId;

                                    return (
                                        <div
                                            key={index}
                                            className={`max-w-[60%] ${isSender
                                                    ? "self-end text-white font-lato text-[15px] leading-snug tracking-tight bg-gradient-to-r from-[#5851DB] via-[#833AB4] to-[#C13584] shadow-md rounded-2xl"
                                                    : "self-start bg-[#EFEFEF] text-gray-900 font-lato text-[15px] leading-snug tracking-tight shadow-sm rounded-2xl"
                                                }`}
                                        >
                                            {msg.fileUrl ? (
                                                msg.fileUrl.match(/\.(jpg|jpeg|png|gif|pdf)$/i) ? (
                                                    <img
                                                        src={msg.fileUrl}
                                                        alt="sent-img"
                                                        className="w-40 h-45 md:w-70 md:h-70 m-0 object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <a
                                                        href={msg.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 underline text-sm p-2"
                                                    >
                                                        <FileText size={16} /> {msg.fileUrl.split("/").pop()}
                                                    </a>
                                                )
                                            ) : (
                                                <p className="px-3 py-1 rounded-2xl break-words">{msg.text}</p>
                                            )}
                                        </div>
                                    );

                                })}
                            </>
                        ) : (
                            <div className="text-gray-500">Chat messages will appear here...</div>
                        )}
                    </div>

                    {/* ============================
                FILE PREVIEW (optional)
            ============================= */}
                    {file && (
                        <div className="flex items-center gap-3 px-4 py-2 bg-white border-t">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="preview"
                                    className="w-16 h-16 object-cover rounded-md"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-gray-700">
                                    <FileText size={18} />
                                    {file.name}
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    setFile(null);
                                    setPreview(null);
                                }}
                            >
                                <X size={18} className="text-red-500" />
                            </button>
                        </div>
                    )}

                    {/* ============================
                INPUT AREA — ALWAYS BOTTOM
            ============================= */}
                    <CardContent className="flex gap-2 p-3 border-t border-gray-500 ml-2 mr-6 md:ml-18 md:mr-16">
                        <Input
                            placeholder="Type a message..."
                            className="text-white"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        />

                        <label className="cursor-pointer text-gray-600 hover:text-gray-800">
                            <Paperclip size={22} className="mt-1" />
                            <input
                                type="file"
                                accept="image/*,.pdf,.doc,.docx"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>

                        <Button
                            onClick={handleSend}
                            size="icon"
                            className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white"
                        >
                            <Send className="h-5 w-5" />
                        </Button>

                    </CardContent>

                </Card>
            ) : (
                <div className="text-gray-500 h-full flex items-center justify-center">
                    Select an employee to start chatting
                </div>
            )}

        </section>

    );
}
