"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        mobile: "",
        password: "",
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);

        // Validation
        if (
            !formData.name ||
            !formData.username ||
            !formData.email ||
            !formData.mobile ||
            !formData.password
        ) {
            toast.error("Please fill all fields!");
            return;
        }

        // Store data in an object
        const userData = { ...formData };
        console.log("User Registered:", userData);

        try {
            // Send data to backend API
            const res = await fetch(`${apiUrl}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            const data = await res.json();

            if (!res.ok) {
                //toast.error(data.message || "Registration failed!");
                alert(data.message || "Registration failed!");
                return;
            } else {
                toast.success("Registered Successfully!");

                // Clear inputs
                setFormData({
                    name: "",
                    username: "",
                    email: "",
                    mobile: "",
                    password: "",
                });
            }
        } catch (err) {
            console.error(err);
            toast.error("Server error. Try again later!");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600">
            <Card className="w-[400px] shadow-2xl border-0 bg-white/90 backdrop-blur-lg">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-semibold">
                        Create Account
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Name</Label>
                            <Input
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div>
                            <Label>Username</Label>
                            <Input
                                name="username"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Choose a username"
                            />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                            />
                        </div>
                        <div>
                            <Label>Mobile No.</Label>
                            <Input
                                type="number"
                                name="mobile"
                                required
                                value={formData.mobile}
                                onChange={handleChange}
                                placeholder="Enter your mobile number"
                            />
                        </div>
                        <div>
                            <Label>Password</Label>
                            <Input
                                type="password"
                                name="password"
                                required
                                minLength="8" 
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                            />
                        </div>
                        <Button type="submit" className="w-full mt-2">
                            Register
                        </Button>
                    </form>
                </CardContent>
                <div className="text-center mt-4">
                    <p className="text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue-500 hover:underline">
                            Login
                        </Link>
                    </p>
                </div>
            </Card>
            
        </div>
    );
}
