"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Helper: convert "2h 30m" to total minutes
const toMinutes = (duration) => {
    const [h, m] = duration.split("h");
    const hours = parseInt(h.trim()) || 0;
    const minutes = parseInt(m.replace("m", "").trim()) || 0;
    return hours * 60 + minutes;
};

// Helper: convert total minutes back to "xh ym"
const toHourMinute = (totalMinutes) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
};

export default function AttendanceList({ loggedInUserId, loggedInUserName, role }) {
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
   


    // 🧑‍💼 Logged in user details (from localStorage)
    //const loggedInUser = JSON.parse(localStorage.getItem("user")) || null;
    console.log("Logged in user:", { loggedInUserId, loggedInUserName, role });

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await fetch(`${apiUrl}/attendance`);
                const data = await res.json();
                setRecords(data);
                setFilteredRecords(data);
                console.log("✅ Fetched attendance records:", data);    
            } catch (err) {
                console.error("❌ Error fetching attendance:", err);
            }
        };

        fetchAttendance();
    }, []);

    // 🔍 Filter logic
    const handleFilter = () => {
        const filtered = records.filter((r) => {
            const matchName = searchName
                ? r.name.toLowerCase().includes(searchName.toLowerCase())
                : true;
            const matchDate = searchDate ? r.date === searchDate : true;
            return matchName && matchDate;
        });
        setFilteredRecords(filtered);
    };

    // 🧮 Calculate total duration for each record
    const getTotalDuration = (durations) => {
        if (!durations || durations.length === 0) return "-";
        const totalMinutes = durations.reduce(
            (sum, d) => sum + toMinutes(d),
            0
        );
        return toHourMinute(totalMinutes);
    };

    

console.log("User role in AttendanceList:", role);
    return (
        <>
            {role !== "admin" ? (
                <Card className="bg-white shadow-md mt-6 p-6 text-center text-gray-600">
                    
                    
                    {/* 📋 Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className="p-2 border">#</th>
                                    <th className="p-2 border">Name</th>
                                    <th className="p-2 border">Date</th>
                                    <th className="p-2 border">Check In</th>
                                    <th className="p-2 border">Check Out</th>
                                    <th className="p-2 border">Total Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.length > 0 ? (
                                    filteredRecords.map((item, index) => {
                                        // 🔍 Show only data of logged-in user
                                        if (item.name !== loggedInUserName) return null;

                                        return (
                                            <tr key={item._id} className="hover:bg-gray-50">
                                                <td className="p-2 border">{index + 1}</td>
                                                <td className="p-2 border">{item.name}</td>
                                                <td className="p-2 border">{item.date}</td>
                                                <td className="p-2 border">{item.checkInTime}</td>
                                                <td className="p-2 border">{item.checkOutTime}</td>
                                                <td className="p-2 border font-medium">
                                                    {getTotalDuration(item.durations)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center p-4 text-gray-500">
                                            No attendance records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    </div>
                </Card>
            ) : (
                <Card className="bg-white shadow-md mt-6">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            🗓 Attendance Records (Admin)
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {/* 🔍 Filters */}
                        <div className="flex flex-wrap gap-3 mb-4">
                            {/* Name Filter 
                            <Input
                                type="text"
                                placeholder="Search by name..."
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                className="max-w-xs"
                            />
                            
                            */}
                            
                            <Input
                                type="date"
                                value={searchDate}
                                onChange={(e) => setSearchDate(e.target.value)}
                                className="max-w-xs"
                            />
                            <Button onClick={handleFilter}>Filter</Button>
                        </div>

                        {/* 📋 Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 text-left">
                                        <th className="p-2 border">#</th>
                                        <th className="p-2 border">Name</th>
                                        <th className="p-2 border">Date</th>
                                        <th className="p-2 border">Check In</th>
                                        <th className="p-2 border">Check Out</th>
                                        <th className="p-2 border">Total Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.length > 0 ? (
                                        filteredRecords.map((item, index) => (
                                            <tr key={item._id} className="hover:bg-gray-50">
                                                <td className="p-2 border">{index + 1}</td>
                                                <td className="p-2 border">{item.name}</td>
                                                <td className="p-2 border">{item.date}</td>
                                                <td className="p-2 border">{item.checkInTime}</td>
                                                <td className="p-2 border">{item.checkOutTime}</td>
                                                <td className="p-2 border font-medium">
                                                    {getTotalDuration(item.durations)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center p-4 text-gray-500">
                                                No attendance records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    )
}
