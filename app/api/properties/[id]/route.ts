import { NextRequest, NextResponse } from "next/server";
import { forbidden, requireAdmin } from "@/lib/auth";
import {
  deleteProperty,
  getProperty,
  updateProperty,
} from "@/lib/properties";
import { updatePropertySchema } from "@/shared/schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const property = await getProperty(id);
    if (!property) {
      return NextResponse.json(
        { success: false, error: "Imóvel não encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao buscar imóvel" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    if (!admin) return forbidden();

    const { id } = await params;
    const body = await req.json();
    const validation = updatePropertySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados do imóvel inválidos",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const property = await updateProperty(id, validation.data);
    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    console.error("Error updating property:", error);
    const message =
      error instanceof Error && error.message.includes("não encontrado")
        ? "Imóvel não encontrado"
        : "Falha ao atualizar imóvel";
    return NextResponse.json(
      { success: false, error: message },
      { status: message.includes("não encontrado") ? 404 : 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    if (!admin) return forbidden();

    const { id } = await params;
    const existing = await getProperty(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Imóvel não encontrado" },
        { status: 404 }
      );
    }
    await deleteProperty(id);
    return NextResponse.json({
      success: true,
      message: "Imóvel excluído com sucesso",
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao excluir imóvel" },
      { status: 500 }
    );
  }
}
