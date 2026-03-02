import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, PawPrint, Activity, HeartPulse,
  CalendarDays, Syringe, Settings, Menu, X, Receipt, ShieldCheck, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "My Pets", path: "/pets", icon: PawPrint },
  { title: "Activities", path: "/activities", icon: Activity },
  { title: "Health", path: "/health", icon: HeartPulse },
  { title: "Appointments", path: "/appointments", icon: CalendarDays },
  { title: "Vaccinations", path: "/vaccinations", icon: Syringe },
  { title: "Expenses", path: "/expenses", icon: Receipt },
  { title: "Insurance", path: "/insurance", icon: ShieldCheck },
  { title: "Social", path: "/social", icon: Users }, 
  { title: "Settings", path: "/settings", icon: Settings },
  
];

export function AppSidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-sidebar-border px-6 py-5">
          <PawPrint className="h-7 w-7 text-primary" />
          <span className="text-xl font-heading font-bold text-foreground">PetCare</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-muted-foreground text-center">© 2026 PetCare App</p>
        </div>
      </aside>
    </>
  );
}
