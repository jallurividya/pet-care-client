import { Heart, Calendar, Activity, ShieldCheck, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4 rounded-xl"
      >
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </Button>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Smart Pet Care Made Simple 🐾
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage your pet's health, activities, appointments and more — all in one place.
          Stay organized and give your furry friend the care they deserve.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => navigate("/signup")}
          >
            Get Started
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/40 py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6">

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 text-center">
              <Heart className="mx-auto mb-4 text-emerald-600" size={36} />
              <h3 className="font-semibold text-lg">Health Tracking</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Record medical history, vaccinations and monitor your pet’s wellbeing.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 text-center">
              <Calendar className="mx-auto mb-4 text-emerald-600" size={36} />
              <h3 className="font-semibold text-lg">Appointments</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Schedule vet visits and never miss important dates again.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 text-center">
              <Activity className="mx-auto mb-4 text-emerald-600" size={36} />
              <h3 className="font-semibold text-lg">Activity Log</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Track daily walks, meals and exercise routines easily.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 text-center">
              <ShieldCheck className="mx-auto mb-4 text-emerald-600" size={36} />
              <h3 className="font-semibold text-lg">Secure & Reliable</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Your data is safe and accessible anytime from anywhere.
              </p>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center px-6">
        <h2 className="text-3xl font-bold">
          Give Your Pet the Best Care ❤️
        </h2>
        <p className="mt-4 text-muted-foreground">
          Start managing your pet’s life in a smarter way today.
        </p>

        <Button
          size="lg"
          className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => navigate("/signup")}
        >
          Create Free Account
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Pet Care App. All rights reserved.
      </footer>

    </div>
  );
}