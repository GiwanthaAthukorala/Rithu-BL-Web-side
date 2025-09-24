"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminLogin from "@/components/Admin/adminLogin";
import { AdminAuthProvider, useAdminAuth } from "@/Context/AdminAuthContext";

// Wrapper component that uses the hook
function AdminLoginContent() {
  const { isAuthenticated, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated()) {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <AdminLogin />;
}

// Main page component wrapped with provider
export default function AdminLoginPage() {
  return (
    <AdminAuthProvider>
      <AdminLoginContent />
    </AdminAuthProvider>
  );
}
