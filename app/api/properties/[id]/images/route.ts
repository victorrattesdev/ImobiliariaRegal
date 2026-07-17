import { NextRequest, NextResponse } from "next/server";
import { forbidden, requireAdmin } from "@/lib/auth";
import { updateProperty } from "@/lib/properties";
import { z } from "zod";

const bodySchema = z.object({
  images: z.array(z.string().min(1)).max(50),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    if (!admin) return forbidden();

    const { id } = await params;
    const json = await req.json();
    const validation = bodySchema.safeParse(json);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Lista de imagens inválida" },
        { status: 400 }
      );
    }

    // Only allow local upload paths to prevent SSRF/XSS via remote scripts
    const safeImages = validation.data.images.filter((url) =>
      url.startsWith("/uploads/properties/")
    );

    const property = await updateProperty(id, { images: safeImages });
    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    console.error("Error updating images:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao atualizar imagens" },
      { status: 500 }
    );
  }
}
