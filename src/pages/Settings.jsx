import { useEffect, useState } from "react";
import { Moon, Sun, User, Bell, Pencil, Loader2 } from "lucide-react";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageTransition } from "@/components/PageTransition";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "react-toastify";
export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  // ✅ Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setUser(res.data);
        setOriginalUser(res.data);
      } catch (error) {
        toast("Failed to load user details",);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);
  const isChanged =
    user?.name !== originalUser?.name ||
    user?.email !== originalUser?.email;

  // ✅ Handle profile update
  const handleSave = async () => {
    if (!isChanged) return;

    try {
      setSaving(true);

      const res = await api.put("/users/me", {
        name: user.name,
        email: user.email,
      });

      setUser(res.data);
      setOriginalUser(res.data);
      setIsEditing(false);

      toast.success("Profile updated successfully!");
    } catch {
      toast("Failed to update profile",);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setUser(originalUser);
    setIsEditing(false);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <PageTransition>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-heading font-bold">Settings</h1>

        {/* Profile */}
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-heading font-bold">
                Profile
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={user?.name || ""}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setUser({ ...user, name: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={user?.email || ""}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setUser({ ...user, email: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              {!isEditing ? (
                <Button
                  className="rounded-xl flex items-center gap-2"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                  Edit Changes
                </Button>
              ) : (
                <>
                  <Button
                    className="rounded-xl flex items-center gap-2"
                    onClick={handleSave}
                    disabled={!isChanged || saving}
                  >
                    {saving && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {saving ? "Saving..." : "Save"}
                  </Button>

                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              {theme === "light" ? (
                <Sun className="h-5 w-5 text-accent" />
              ) : (
                <Moon className="h-5 w-5 text-accent" />
              )}
              <h2 className="text-lg font-heading font-bold">
                Appearance
              </h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground">
                  Toggle dark theme
                </p>
              </div>

              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-heading font-bold">
                Notifications
              </h2>
            </div>

            {[
              "Appointment Reminders",
              "Vaccination Alerts",
              "Activity Summaries",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between"
              >
                <p className="text-sm font-medium">{item}</p>
                <Switch defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}