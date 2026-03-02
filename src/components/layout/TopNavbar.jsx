import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Sun, Moon, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/services/api";

export function TopNavbar() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [openDropdown, setOpenDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const username = localStorage.getItem("name") || "User";

  // Fetch Notifications (only unread should come from backend)
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const unreadCount = notifications.length;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== id)
      );
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      navigate("/login");
    }
  };

  //  Auto refresh every 10 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  //  Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end border-b bg-background px-6 shadow-sm">
      <div className="flex items-center gap-4">

        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        {/*  Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon" onClick={handleToggle}>
            <Bell size={20} />
          </Button>

          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}

          {isOpen && (
            <div className="absolute right-0 top-12 w-80 rounded-xl border bg-popover text-popover-foreground shadow-xl z-50">

              <div className="p-3 border-b font-semibold text-sm">
                Notifications
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() =>
                        handleNotificationClick(notification.id)
                      }
                      className="p-3 text-sm border-b cursor-pointer 
              transition-colors 
              hover:bg-accent 
              data-[unread=true]:bg-accent"
                      data-unread={!notification.is_read}
                    >
                      <p className="font-medium">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 5 && (
                <div className="p-2 text-center">
                  <button
                    onClick={() => navigate("/notifications")}
                    className="text-sm text-primary hover:underline"
                  >
                    View All
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 👤 Profile Dropdown */}
      <div className="relative ml-6" ref={dropdownRef}>
        <button
          onClick={() => setOpenDropdown(!openDropdown)}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-accent transition"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
            {username.charAt(0).toUpperCase()}
          </div>

          <span className="hidden md:block text-sm font-medium">
            {username}
          </span>

          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${openDropdown ? "rotate-180" : ""
              }`}
          />
        </button>

        {openDropdown && (
          <div className="absolute right-0 mt-2 w-40 rounded-xl border bg-popover shadow-lg p-2">
            <button
              onClick={() => {
                navigate("/settings");
                setOpenDropdown(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              <User size={14} />
              Profile
            </button>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-accent"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}