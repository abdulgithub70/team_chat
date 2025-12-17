"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function Attendance({ loggedInUserId, loggedInUserName }) {
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0); // in seconds
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const intervalRef = useRef(null);

    // Convert seconds → hh:mm:ss
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, "0")}:${m
            .toString()
            .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const handleCheckIn = () => {
        if (isCheckedIn) return;

        const startTime = Date.now(); // current time in milliseconds
        localStorage.setItem("checkInTime", startTime); // ✅ store in localStorage

        setIsCheckedIn(true);

        // Start timer based on actual time difference
        intervalRef.current = setInterval(() => {
            const savedStart = localStorage.getItem("checkInTime");
            if (savedStart) {
                const now = Date.now();
                const diff = Math.floor((now - savedStart) / 1000); // seconds
                setTimeElapsed(diff);
            }
        }, 1000);

        //console.log("✅ Checked In at:", new Date().toLocaleTimeString());
    };

    const handleCheckOut = () => {
        if (!isCheckedIn) return;

        // Get check-in time BEFORE removing it 
        const startTime = localStorage.getItem("checkInTime");
        clearInterval(intervalRef.current);
        setIsCheckedIn(false);
        localStorage.removeItem("checkInTime");

        // ⬇️ Reset timer to 0 
        setTimeElapsed(0);

        const hours = Math.floor(timeElapsed / 3600);
        const minutes = Math.floor((timeElapsed % 3600) / 60);

        //console.log("🕓 Checked Out");
        //console.log(`Total Time Worked: ${hours} hour(s) and ${minutes} minute(s)`);

        const attendanceData = {
            userId: loggedInUserId,
            name: loggedInUserName,
            date: new Date().toISOString().split("T")[0],
            duration: `${hours}h ${minutes}m`,
            checkInTime: new Date(parseInt(startTime)).toLocaleTimeString(),
            checkOutTime: new Date().toLocaleTimeString(),
        };

        //console.log("📤 Data to send:", attendanceData);
        fetch(`${apiUrl}/attendance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(attendanceData),
        });
    };

    // 🔁 Restore timer if page refreshes
    useEffect(() => {
        const savedStart = localStorage.getItem("checkInTime");
        if (savedStart) {
            setIsCheckedIn(true);
            intervalRef.current = setInterval(() => {
                const now = Date.now();
                //const diff = Math.floor((now - savedStart) / 1000);
                const diff = Math.floor((now - parseInt(savedStart)) / 1000);
                setTimeElapsed(diff);
            }, 1000);
        }
        return () => clearInterval(intervalRef.current);
    }, []);

    // check IP address to allow check-in/out only from office
    /*
    useEffect(() => {
        const fetchIP = async () => {
            try {
                const res = await fetch(`${apiUrl}/ip`);
                const data = await res.json();
                const userIP = data.ip;

                const officeIPs = ["49.205.41.34", "49.205.40.185"]; // replace with your real office IPs

                if (officeIPs.includes(userIP)) {
                    setIsOfficeNetwork(true);
                } else {
                    setIsOfficeNetwork(true);//false
                    //alert("⚠️ You are not connected to the office network.");
                    toast.error("You are not connected to the office network.");
                }
            } catch (err) {
                console.error("Error fetching IP:", err);
            }
        };

        //fetchIP();
    }, []);
*/
    return (
        <>
            <div className=''>
                <Card className="bg-white shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <span>📅</span> Attendance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 items-center">
                        <div className="text-2xl font-mono text-blue-600">
                            {formatTime(timeElapsed)}
                        </div>
                        <div className={`flex gap-4 `}>
                            <Button
                                onClick={handleCheckIn}
                                disabled={isCheckedIn}
                                className={`${isCheckedIn
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-green-500 hover:bg-green-600"
                                    } text-white`}
                            >
                                Check In
                            </Button>
                            <Button
                                onClick={handleCheckOut}
                                disabled={!isCheckedIn}
                                className={`${!isCheckedIn
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-red-500 hover:bg-red-600"
                                    } text-white`}
                            >
                                Check Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
