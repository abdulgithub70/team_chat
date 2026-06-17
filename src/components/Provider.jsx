"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAppStore from "@/store/appStore";

export default function Providers({ children }) {
    const { setLoggedInUser, setEmployees, setAllAttendance, setAllLeaves } = useAppStore();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        // ── User from localStorage ────────────────────────────
        if (typeof window !== "undefined") {
            const uid = localStorage.getItem("userId");
            if (!uid) return; // login page handle karega redirect

            setLoggedInUser({
                loggedInUserId: uid,
                loggedInUserName: localStorage.getItem("userName"),
                loggedInUserRole: localStorage.getItem("role"),
                loggedInSalary: localStorage.getItem("salary"),
                loggedInDepartment: localStorage.getItem("department"),
                loggedInDesignation: localStorage.getItem("designation"),
                loggedInJoiningDate: localStorage.getItem("joiningDate"),
            });

            // ── API calls — sirf ek baar ─────────────────────
            const fetchAll = async () => {
                try {
                    const [empRes, attRes, leaveRes] = await Promise.all([
                        fetch(`${apiUrl}/auth/employees`),
                        fetch(`${apiUrl}/attendance`),
                        fetch(`${apiUrl}/leave?role=admin`),
                    ]);
                    const [empData, attData, leaveData] = await Promise.all([
                        empRes.json(),
                        attRes.json(),
                        leaveRes.json(),
                    ]);
                    setEmployees(Array.isArray(empData) ? empData : []);
                    setAllAttendance(Array.isArray(attData) ? attData : []);
                    setAllLeaves(Array.isArray(leaveData) ? leaveData : []);
                } catch (err) {
                    console.error("Global fetch error:", err);
                }
            };
            fetchAll();
        }
    }, []);

    return <>{children}</>;
}