"use client";

import { User } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

export function AppSidebar({ onSelectEmployee, loggedInUserId }) {
    const [employees, setEmployees] = useState([]);
    const [loggedInUserRole, setLoggedInUserRole] = useState(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        // Get role from localStorage on client-side
        const role = localStorage.getItem("role");
        setLoggedInUserRole(role);
    }, []);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch(`${apiUrl}/auth/employees`);
                const data = await response.json();
                setEmployees(data);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };

        fetchEmployees();
    }, []);

    // Filter employees based on role
    const filteredEmployees = employees
        .filter(emp => emp._id !== loggedInUserId) // remove logged-in user
        .filter(emp => {
            if (loggedInUserRole === "admin") return true; // admin sees all
            return emp.role === "admin"; // normal user sees only admins
        });

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Employees</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {filteredEmployees.map(emp => (
                                <SidebarMenuItem key={emp._id}>
                                    <SidebarMenuButton
                                        asChild
                                        onClick={() => onSelectEmployee(emp)}
                                    >
                                        <button className="flex items-center space-x-2 w-full text-left p-2 hover:bg-gray-200 rounded">
                                            <User className="w-4 h-4" />
                                            <span>{emp.name}</span>
                                        </button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
