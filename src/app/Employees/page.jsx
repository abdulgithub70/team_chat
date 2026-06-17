"use client";

import { useEffect, useState, useMemo } from "react";
import EmpDetailsList from "@/components/EmpDetailsList";
import { Card, CardContent } from "@/components/ui/card";
import EmployeeAttendanceAnalytics from "@/components/EmployeeAttendanceAnalytics";
import { User, CalendarDays, IndianRupee, Clock } from "lucide-react";
//import AppShell from "@/components/AppShell";
import { useRouter } from "next/navigation";



export default function Employees({
    loggedInUserId,
    //loggedInUserName,
    loggedInUserRole,
    //loggedInJoiningDate,
    //loggedInDepartment,
    //loggedInDesignation,
    //loggedInSalary
}) {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [allAttendance, setAllAttendance] = useState([]);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const router = useRouter();

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // 📡 Fetch all attendance once
    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await fetch(`${apiUrl}/attendance`);
                const data = await res.json();
                setAllAttendance(data);
            } catch (err) {
                console.error("Error fetching attendance:", err);
            }
        };
        fetchAttendance();
    }, []);

    // Helper: ["9h 20m"] → minutes
    const durationsToMinutes = (durations) => {
        if (!durations?.length) return 0;
        const match = durations[0].match(/(\d+)h\s*(\d+)m/);
        if (!match) return 0;
        return parseInt(match[1]) * 60 + parseInt(match[2]);
    };

    // 🔍 Filtered attendance for selected employee (current month)
    const attendanceRecordsForSelectedEmployee = useMemo(() => {
        if (!selectedEmployee) return [];

        const currentMonth = new Date().toISOString().slice(0, 7); // "2026-06"

        return allAttendance
            .filter(r =>
                r.userId === selectedEmployee._id &&
                r.date?.startsWith(currentMonth)
            )
            .map(r => ({
                date: r.date,
                totalMinutes: r.totalMinutes || durationsToMinutes(r.durations),
                overtimeMinutes: r.overtimeMinutes || 0,
            }));
    }, [allAttendance, selectedEmployee]);

    // selectedEmployee ke current month present days
    const presentDays = useMemo(() => {
        if (!selectedEmployee || !allAttendance.length) return 0;
        const currentMonth = new Date().toISOString().slice(0, 7);

        const filtered = allAttendance.filter(r =>
            r.userId === selectedEmployee._id &&
            r.date?.startsWith(currentMonth)
        );

        console.log("Filtered records for", selectedEmployee?.name, ":", filtered);
        return filtered.length;
    }, [allAttendance, selectedEmployee]);
    console.log("Present days for", selectedEmployee?.name, ":", presentDays);

    const overtimeHours = useMemo(() => {
        if (!selectedEmployee || !allAttendance.length) return "0h 0m";
        const currentMonth = new Date().toISOString().slice(0, 7);

        const totalOvertimeMinutes = allAttendance
            .filter(r =>
                r.userId === selectedEmployee._id &&
                r.date?.startsWith(currentMonth)
            )
            .reduce((sum, r) => sum + (r.overtimeMinutes || 0), 0);

        const h = Math.floor(totalOvertimeMinutes / 60);
        const m = totalOvertimeMinutes % 60;
        return `${h}h ${m}m`;
    }, [allAttendance, selectedEmployee]);


    useEffect(() => {
        if (typeof window !== "undefined") {
            const uid = localStorage.getItem("userId");
            const role = localStorage.getItem("role");
            const uname = localStorage.getItem("userName");
            const joiningDate = localStorage.getItem("joiningDate");
            const department = localStorage.getItem("department");
            const designation = localStorage.getItem("designation");
            const salary = localStorage.getItem("salary");

            if (!uid) return router.push("/login");



        }
    }, [router]);


    return (
        <>


            <div className="flex gap-6 h-[calc(100vh-120px)] m-2">

                {/* Left Employee List */}
                <div className="w-[180px] md:w-[280px] ">
                    <EmpDetailsList
                        loggedInUserId={loggedInUserId}
                        loggedInUserRole={loggedInUserRole}
                        onSelectEmployee={(emp) => setSelectedEmployee(emp)}
                    />
                </div>

                {/* Right Details */}
                <div className="flex-1">

                    {!selectedEmployee ? (
                        <Card className="h-full flex items-center justify-center">
                            <CardContent>
                                <p className="text-gray-500 text-lg">
                                    Select an employee to view details
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">

                            {/* Employee Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-70 md:w-full">
                                <Card>
                                    <CardContent className="p-4">

                                        <div className="flex items-center  gap-4">

                                            <div
                                                className="w-16 h-16 rounded-full
                                        bg-gradient-to-r from-indigo-500 to-purple-500
                                        flex items-center justify-center
                                        text-white text-2xl font-bold"
                                            >
                                                {selectedEmployee.name?.charAt(0)}
                                            </div>

                                            <div>
                                                <h2 className="text-2xl font-bold">
                                                    {selectedEmployee.name}
                                                </h2>

                                                <p className="text-gray-500">
                                                    Employee ID : {selectedEmployee._id}
                                                </p>
                                            </div>


                                        </div>

                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4 w-full">
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm">
                                                    Department :
                                                </p>
                                                <h3 className="font-bold">
                                                    {selectedEmployee.department}
                                                </h3>
                                            </div>
                                            <CalendarDays />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm">
                                                    Designation :
                                                </p>
                                                <h3 className="font-bold">
                                                    {selectedEmployee.designation}
                                                </h3>
                                            </div>
                                            <CalendarDays />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4
                             w-70 md:w-full">

                                <Card className="border-0 shadow-md hover:shadow-lg transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm">
                                                    Joining Date :
                                                </p>
                                                <h3 className="text-3xl font-bold text-purple-600 mt-1">
                                                    {formatDate(selectedEmployee.joiningDate)}
                                                </h3>
                                            </div>
                                            <CalendarDays />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-md hover:shadow-lg transition-all">
                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between">

                                            <div>
                                                <p className="text-sm text-slate-500">
                                                    Monthly Salary
                                                </p>

                                                <h2 className="text-3xl font-bold text-green-600 mt-1">
                                                    ₹ {Number(selectedEmployee.salary || 0).toLocaleString("en-IN")}
                                                </h2>
                                            </div>

                                            <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                                                <IndianRupee className="h-6 w-6 text-green-600" />
                                            </div>

                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-md hover:shadow-lg transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm">
                                                    Present Days
                                                </p>
                                                <h3 className="text-3xl font-bold text-sky-600 mt-1">
                                                    {presentDays} days
                                                </h3>
                                            </div>
                                            <User />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-md hover:shadow-lg transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm">
                                                    Overtime
                                                </p>
                                                <h3 className="text-3xl font-bold text-amber-600 mt-1">
                                                    {overtimeHours}
                                                </h3>
                                            </div>
                                            <Clock />
                                        </div>
                                    </CardContent>
                                </Card>

                            </div>

                            {/* Monthly Attendance Graph and Salary graph */}
                            <Card className="w-70 md:w-full">
                                <div className="grid gap-4 p-6 ">
                                    <EmployeeAttendanceAnalytics
                                        employee={selectedEmployee}
                                        attendanceData={attendanceRecordsForSelectedEmployee}
                                    />
                                </div>

                            </Card>

                        </div>
                    )}
                </div>

            </div>
        </>
    );
}