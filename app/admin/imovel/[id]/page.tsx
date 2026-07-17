import { notFound, redirect } from "next/navigation";
import { PropertyEditor } from "@/components/admin/property-editor";
import { requireAdmin } from "@/lib/auth";
import { getProperty } from "@/lib/properties";

type Props = { params: Promise<{ id: string }> };

export const metadata = {
  title: "Editar imóvel",
};

export default async function EditPropertyPage({ params }: Props) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  return <PropertyEditor initialProperty={property} />;
}
