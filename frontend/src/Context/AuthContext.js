"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  login as apiLogin,
  getProfile,
  register as apiRegister,
} from "@/lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      setIsAuthLoading(true);
      try {
        const storedToken =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (storedToken) {
          try {
            const userData = await getProfile();
            setUser(userData);
            setToken(storedToken);
            console.log("User authenticated from stored token:", userData._id);
          } catch (error) {
            console.error("Failed to authenticate with stored token:", error);
            if (typeof window !== "undefined") {
              localStorage.removeItem("token");
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
        setIsAuthLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setIsAuthLoading(true);
      console.log("AuthContext: Starting login process");

      const userData = await apiLogin(credentials);

      console.log("AuthContext: Login successful, setting user data");

      setUser({
        _id: userData._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        bankName: userData.bankName,
        bankBranch: userData.bankBranch,
        bankAccountNo: userData.bankAccountNo,
      });

      setToken(userData.token);

      if (typeof window !== "undefined") {
        localStorage.setItem("token", userData.token);
        if (credentials.rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }
      }

      return userData;
    } catch (error) {
      console.error("AuthContext: Login failed:", error);
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsAuthLoading(true);
      console.log("AuthContext: Starting registration process");

      const response = await apiRegister(userData);

      if (response && response.success) {
        console.log(
          "AuthContext: Registration successful, attempting auto-login"
        );

        // Automatically log in after registration
        await login({
          email: userData.email,
          password: userData.password,
          rememberMe: true,
        });

        return response;
      } else {
        throw new Error(response?.message || "Registration failed");
      }
    } catch (error) {
      console.error("AuthContext: Registration failed:", error);
      const enhancedError = new Error(error.message);
      enhancedError.errorType = error.errorType;
      enhancedError.errors = error.errors;
      throw enhancedError;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("rememberMe");
    }
    router.push("/LoginPage/page");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        register,
        loading,
        isAuthLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
