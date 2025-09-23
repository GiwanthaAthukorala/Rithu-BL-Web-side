"use client";
import AdminDashboard from "@/components/Admin/AdminDashboard";
import { useAuth } from "@/Context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      router.push("/admin/login");
    }
  }, [user, router]);

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return <div>Redirecting...</div>;
  }

  return <AdminDashboard />;
}
