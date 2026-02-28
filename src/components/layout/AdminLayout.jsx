import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  PawPrint,
  Activity,
  ShieldCheck,
  BarChart3,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext"; // assuming you have this

export default function AdminLayout() {
  const { logout } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Insurance", path: "/admin/insurance", icon: ShieldCheck },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">

      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40 flex flex-col">
        <div className="p-6 text-xl font-bold tracking-tight">
          Admin Panel
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-xl transition 
                  ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "hover:bg-muted"
                  }`
                }
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600"
            onClick={logout}
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>

    </div>
  );
}