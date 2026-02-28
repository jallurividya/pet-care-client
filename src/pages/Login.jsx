import { useState } from "react";
import { motion } from "framer-motion";
import { PawPrint, Mail, Lock, Eye, EyeOff, Moon, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext"

export default function LoginPage() {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const user = await login(formData.email, formData.password);
            toast.success("Login Successful")

            if (user.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/dashboard");
            }

        } catch (err) {
            const message = err?.message || "Invalid email or password";
            setError(message);
            toast.error("Login Failed")
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 relative">
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="absolute top-4 right-4 rounded-xl"
            >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </Button>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                <Card className="rounded-2xl shadow-lg border-border/50">
                    <CardHeader className="text-center space-y-3 pb-2">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                            <PawPrint className="h-8 w-8 text-primary" />
                        </div>

                        <CardTitle className="text-2xl font-bold">
                            PetCare Login
                        </CardTitle>

                        <CardDescription>
                            Access your pet’s health & care dashboard
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="pl-9 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="pl-9 pr-9 rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-destructive font-medium">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl h-11 text-base font-semibold"
                            >
                                {loading ? "Logging in..." : "Log In"}
                            </Button>
                        </form>
                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <button
                                onClick={() => navigate("/signup")}
                                className="font-semibold text-primary hover:underline"
                            >
                                Sign up
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}