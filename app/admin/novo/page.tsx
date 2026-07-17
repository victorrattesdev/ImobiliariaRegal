import { redirect } from "next/navigation";
import { PropertyEditor } from "@/components/admin/property-editor";
import { requireAdmin } from "@/lib/auth";

export const metadata = {
  title: "Novo imóvel",
};

export default async function NewPropertyPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");
  return <PropertyEditor />;
}
