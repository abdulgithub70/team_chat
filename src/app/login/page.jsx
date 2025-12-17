"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { useEffect } from "react";

// Temporary dummy users (for frontend testing)
export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);


    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    useEffect(() => {
        fetch(`${apiUrl}/health`).catch(() => { });
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();

        const { username, password } = formData;

        // 🔍 Basic validation
        if (!username || !password) {
            toast.error("Please fill all fields!");
            return;
        }

        try {
            setLoading(true);
            // 🔐 Login API call
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok || data.success === false) {

                //alert(data.message || "Login failed");
                toast.error(data.message || "Login failed");

                setLoading(false);
                return;
            }


            // ✅ Save auth data
            localStorage.setItem("userId", data.user._id);
            localStorage.setItem("userName", data.user.name);
            localStorage.setItem("role", data.user.role);

            toast.success("Login successful!");

            // 🚀 Instant redirect
            router.replace("/dashboard");

        } catch (error) {
            //console.error("Login error:", error);
            toast.error("Server is waking up, please wait...");
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-1">
            <Card className="w-[400px] shadow-2xl border-0 bg-white/95 backdrop-blur-lg">
                <CardHeader>
                    <CardTitle className="text-center text-2xl text-black font-semibold">
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

                        <Button type="submit" className="w-full mt-2" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
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
