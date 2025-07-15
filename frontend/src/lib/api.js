import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message =
        error.response.data?.message ||
        (error.response.status === 400 ? "Invalid request" : "Request failed");
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(
        new Error("No response from server. Please check your connection.")
      );
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const register = async (userData) => {
  try {
    const response = await api.post("/users/register", userData);

    if (response.data.success) {
      return response.data;
    } else {
      // Handle specific backend validation errors
      const error = new Error(response.data.message || "Registration failed");
      error.errorType = response.data.errorType;
      throw error;
    }
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);

    // Enhance error with server response if available
    if (error.response?.data) {
      const serverError = new Error(
        error.response.data.message || "Registration failed"
      );
      serverError.errorType = error.response.data.errorType;
      throw serverError;
    }

    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post("/users/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get("/users/profile");
    return response.data;
  } catch (error) {
    console.error("Profile error:", error);
    throw error;
  }
};
