import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://rithu-bl-web-side.vercel.app/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    console.log(
      `Making ${config.method?.toUpperCase()} request to:`,
      config.url
    );
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error("Response interceptor error:", error.response || error);

    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          // Only redirect if not already on login page
          if (!window.location.pathname.includes("login")) {
            window.location.href = "/LoginPage/page";
          }
        }
      }

      // Extract error message from response
      const errorMessage =
        error.response?.data?.message ||
        error.response?.statusText ||
        error.message ||
        "Request failed";

      const customError = new Error(errorMessage);
      customError.status = error.response.status;
      customError.errorType = error.response?.data?.errorType;
      return Promise.reject(customError);
    }

    // Network or other errors
    if (error.code === "ECONNABORTED") {
      return Promise.reject(
        new Error("Request timeout. Please check your connection.")
      );
    }

    return Promise.reject(error);
  }
);

export const endpoints = {
  login: "/users/login",
  register: "/users/register",
  profile: "/users/profile",
  submissions: "/submissions",
  earnings: "/earnings",
  youtubeSubmission: "/youtubeSubmissions",
  fbReviews: "/fb-reviews",
};

// Register function
export const register = async (userData) => {
  try {
    console.log("Registering user with data:", {
      ...userData,
      password: "***hidden***",
    });

    const response = await api.post("/users/register", userData);

    console.log("Registration response:", response.data);

    if (response.data.success) {
      return response.data;
    } else {
      const error = new Error(response.data.message || "Registration failed");
      error.errorType = response.data.errorType;
      throw error;
    }
  } catch (error) {
    console.error("Registration error:", error);

    // Re-throw with enhanced error information
    if (error.response?.data) {
      const serverError = new Error(
        error.response.data.message || "Registration failed"
      );
      serverError.errorType = error.response.data.errorType;
      serverError.errors = error.response.data.errors;
      throw serverError;
    }

    throw error;
  }
};

// Login function
export const login = async (credentials) => {
  try {
    console.log("Attempting login for:", credentials.email);

    const response = await api.post("/users/login", credentials);

    console.log("Login response:", response.data);

    if (response.data.success !== false) {
      // Store token
      if (response.data.token && typeof window !== "undefined") {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Get profile function
export const getProfile = async () => {
  try {
    const response = await api.get("/users/profile");

    if (response.data.success !== false) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to get profile");
    }
  } catch (error) {
    console.error("Profile error:", error);
    throw error;
  }
};

export default api;
