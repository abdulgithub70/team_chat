"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

// Temporary dummy users (for frontend testing)
export default function LoginPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { username, password } = formData;

        // Validation
        if (!username || !password) {
            toast.error("Please fill all fields!");
            return;
        }

        // Store form data as object
        const loginData = { username, password };
        console.log("Login Data:", loginData);

        try {
            // ------------------------
            // Backend API call
            // ------------------------
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
            });

            const data = await res.json();

            if (!res.ok) {
                //toast.error(data.message || "Login failed!");
                alert(data.message || "Login failed!");
                return;
            }

            // Save user ID and role in localStorage
            localStorage.setItem("userId", data.user._id);
            localStorage.setItem("userName", data.user.name);  // <- add this
            localStorage.setItem("role", data.user.role);

            //console.log("Logged in user ID:", data.user._id);
            toast.success("Login successful!");

            // Redirect to dashboard
            router.push("/dashboard");
        } catch (err) {
            console.error("Login error:", err);
            toast.error("Network error while logging in!");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
            <Card className="w-[400px] shadow-2xl border-0 bg-white/95 backdrop-blur-lg">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-semibold">
                        Login to your account
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Username</Label>
                            <Input
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter your username"
                            />
                        </div>

                        <div>
                            <Label>Password</Label>
                            <Input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                            />
                        </div>

                        <Button type="submit" className="w-full mt-2">
                            Login
                        </Button>
                    </form>
                </CardContent>
                <div className="text-center mt-1">
                    <p className="text-sm">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-blue-500 hover:underline">
                            Register
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
}
