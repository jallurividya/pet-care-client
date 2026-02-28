import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import api from "../api/api.js";

const AuthContext = createContext(null);

// Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore auth on refresh
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser);

        setToken(savedToken);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to restore auth:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  // LOGIN
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, data } = res.data;

      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data));

      // Update state
      setToken(token);
      setUser(data);

      return data;
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  };

  // SIGNUP
  const signup = async (name, email, password, phone) => {
    try {
      const res = await api.post("/auth/signup", {
        name,
        email,
        password,
        phone,
      });

      return res.data;
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);
      throw error;
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    signup,
    logout,
    isAuthenticated: !!token,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};