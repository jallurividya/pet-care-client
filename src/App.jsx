import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Pets from "./pages/Pets";
import Activities from "./pages/Activities";
import Health from "./pages/Health";
import Appointments from "./pages/Appointments";
import Vaccinations from "./pages/Vaccinations";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Expenses from "./pages/Expenses";
import Insurance from "./pages/Insurance";
import Home from "./pages/Home";
import AdminLayout from "./components/layout/AdminLayout";
import AdminInsurance from "./pages/AdminInsurance"
import AdminDashboard from "./pages/AdminDashboard";
import SocialPage from "./pages/SocialPage";

const queryClient = new QueryClient();

function App() {
  const { theme } = useTheme();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>

            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme={theme}
            />

            <BrowserRouter>
              <Routes>

                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/insurance" element={<AdminInsurance />} />
                </Route>

                {/* Protected Routes */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={["user"]}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/pets" element={<Pets />} />
                  <Route path="/activities" element={<Activities />} />
                  <Route path="/health" element={<Health />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/vaccinations" element={<Vaccinations />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/insurance" element={<Insurance />} />
                  <Route path="/social" element={<SocialPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />

              </Routes>
            </BrowserRouter>

          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;