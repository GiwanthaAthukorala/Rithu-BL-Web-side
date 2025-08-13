import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("adminToken");
      if (storedToken) {
        try {
          // Verify token and get admin data
          const response = await api.get("/api/admin/auth/me");
          setAdmin(response.data.admin);
          setToken(storedToken);
        } catch (error) {
          console.error("Failed to authenticate with stored token:", error);
          localStorage.removeItem("adminToken");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.post("/api/admin/auth/login", credentials);
      setAdmin(response.data.admin);
      setToken(response.data.token);
      localStorage.setItem("adminToken", response.data.token);
      router.push("/admin/dashboard");
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  return useContext(AdminAuthContext);
};
