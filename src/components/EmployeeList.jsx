"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";

export default function EmployeeList({ onSelectEmployee, loggedInUserId }) {
    const [employees, setEmployees] = useState([]);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch(`${apiUrl}/auth/employees`);
                const data = await res.json();
                setEmployees(data);
            } catch (error) {
                console.log("Error fetching employees:", error);
            }
        };

        fetchEmployees();
    }, []);

    return (
        <div className="p-4 space-y-4 bg-gray-700 h-full border-r shadow-md">

            <h2 className="text-xl font-semibold text-white  pb-2 border-b">
                Employees
            </h2>

            <div className="space-y-2">
                {employees
                    .filter(emp => emp._id !== loggedInUserId)
                    .map(emp => (
                        <button
                            key={emp._id}
                            onClick={() => onSelectEmployee(emp)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl 
                               bg-gray-50 hover:bg-gray-100 active:bg-gray-200
                               transition-all duration-200 shadow-sm border border-gray-200"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 
                                    flex items-center justify-center text-white font-semibold shadow">
                                {emp.name?.charAt(0)}
                            </div>

                            <span className="text-gray-800 font-medium text-[15px]">
                                {emp.name}
                            </span>
                        </button>
                    ))}
            </div>

        </div>

    );
}
