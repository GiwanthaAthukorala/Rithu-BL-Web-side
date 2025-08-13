import { useEffect } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/Admin/AdminLayout";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminDashboard() {
  const { admin, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) {
      router.push("/admin/login");
    }
  }, [admin, loading, router]);

  if (loading || !admin) {
    return <div>Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p>Welcome, {admin.email}</p>
        {/* Dashboard content */}
      </div>
    </AdminLayout>
  );
}
