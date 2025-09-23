"use client";
import AdminLogin from "@/components/Admin/AdminLogin";
import { useAuth } from "@/Context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "superadmin")) {
      router.push("/admin/dashboard");
    }
  }, [user, router]);

  return <AdminLogin />;
}
