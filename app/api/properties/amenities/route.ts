import { NextResponse } from "next/server";
import { getDistinctAmenities } from "@/lib/properties";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city") || undefined;
    const excludeCity = searchParams.get("excludeCity") || undefined;

    const data = await getDistinctAmenities({ city, excludeCity });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Falha ao listar comodidades",
      },
      { status: 500 }
    );
  }
}
