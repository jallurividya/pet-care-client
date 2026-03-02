import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// 🔐 Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚫 Prevent multiple session expired toasts
let isSessionExpiredShown = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // ✅ Handle 401 globally
    if (status === 401) {
      if (!isSessionExpiredShown) {
        toast.error("Session expired. Please login again.");
        isSessionExpiredShown = true;

        localStorage.removeItem("token");

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }

      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default api;