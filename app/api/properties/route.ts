import { NextRequest, NextResponse } from "next/server";
import { forbidden, requireAdmin } from "@/lib/auth";
import {
  createProperty,
  getProperties,
  parsePropertyFilters,
} from "@/lib/properties";
import { insertPropertySchema } from "@/shared/schema";

export async function GET(req: NextRequest) {
  try {
    const filters = parsePropertyFilters(req.nextUrl.searchParams);

    if (filters.includeInactive) {
      const admin = await requireAdmin();
      if (!admin) {
        delete filters.includeInactive;
      }
    }

    const data = await getProperties(filters);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao buscar imóveis" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return forbidden();

    const body = await req.json();
    const validation = insertPropertySchema.safeParse(body);
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

    const property = await createProperty(validation.data);
    return NextResponse.json(
      { success: true, data: property },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao criar imóvel" },
      { status: 500 }
    );
  }
}
