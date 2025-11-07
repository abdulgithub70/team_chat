"use client";

import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const socket = io("http://localhost:5000");

export default function ChatBox({ activeEmployee, loggedInUserId }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null); // 👈 NEW

    useEffect(() => {
        if (loggedInUserId) {
            socket.emit("registerUser", loggedInUserId);
        }
    }, [loggedInUserId]);

    useEffect(() => {
        if (!activeEmployee) return;

        setMessages([]);

        const fetchMessages = async () => {
            try {
                const res = await fetch(
                    `http://localhost:5000/api/messages?senderId=${loggedInUserId}&receiverId=${activeEmployee._id}`
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

        // Ask notification permission once
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        socket.on("receiveMessage", (data) => {
            if (
                data.senderId === activeEmployee?._id ||
                data.receiverId === activeEmployee?._id
            ) {
                setMessages((prev) => [...prev, data]);

                // Play sound only if message is from another user
                if (data.senderId !== loggedInUserId) {
                    audio.play().catch(err => console.log("Audio blocked:", err));

                    // ✅ If window/tab not focused, show desktop notification
                    if (document.hidden) {
                        new Notification("New message!", {
                            body: data.message || "You received a new message",
                            icon: "/chat-icon.png", // optional icon
                        });
                    }
                }
            }
        });

        return () => socket.off("receiveMessage");
    }, [activeEmployee, loggedInUserId]);


    // ✅ Auto scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!message.trim() || !activeEmployee) return;

        const newMessage = {
            senderId: loggedInUserId,
            receiverId: activeEmployee._id,
            text: message,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setMessage("");

        socket.emit("sendMessage", newMessage);

        try {
            await fetch("http://localhost:5000/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMessage),
            });
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    return (
        <section>
            {activeEmployee ? (
                <Card className="bg-gradient-to-r from-indigo-300 to-orange-300">
                    <CardHeader>
                        <CardTitle>Chat with {activeEmployee.name}</CardTitle>
                    </CardHeader>

                    <CardContent className="flex flex-col space-y-2 h-[300px] overflow-auto">
                        {messages.length > 0 ? (
                            <>
                                {messages.map((msg, index) => {
                                    const isSender = msg.senderId === loggedInUserId;
                                    return (
                                        <div
                                            key={index}
                                            className={`max-w-[60%] p-2 rounded-3xl break-words ${isSender
                                                    ? "self-end bg-orange-400 text-white"
                                                    : "self-start bg-gray-200 text-gray-800"
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    );
                                })}
                                {/* 👇 Scroll target */}
                                <div ref={messagesEndRef} />
                            </>
                        ) : (
                            <div className="text-gray-500">
                                Chat messages will appear here...
                            </div>
                        )}
                    </CardContent>

                    <CardContent className="flex space-x-2 mt-2">
                        <Input
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        />
                        <Button onClick={handleSend}>Send</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="text-gray-500">Select an employee to start chatting</div>
            )}
        </section>
    );
}
