import AdminLinkManagement from "@/components/Admin/AdminLinkManagement";
import { useAuth } from "@/Context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLinksPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push("/admin/login");
    }
  }, [user, router]);

  if (!user?.isAdmin) {
    return null; // Will redirect
  }

  return <AdminLinkManagement />;
}
