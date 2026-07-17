import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { requireAdmin } from "@/lib/auth";

export const metadata = {
  title: "Administração",
};

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");
  return <AdminDashboard />;
}
