import { NextRequest, NextResponse } from "next/server";
import { getProperties, parsePropertyFilters } from "@/lib/properties";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q");
    if (!q?.trim()) {
      return NextResponse.json(
        { success: false, error: "Parâmetro de busca (q) é obrigatório" },
        { status: 400 }
      );
    }

    const filters = parsePropertyFilters(req.nextUrl.searchParams);
    filters.q = q.trim();
    const data = await getProperties(filters);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error searching properties:", error);
    return NextResponse.json(
      { success: false, error: "Falha na busca de imóveis" },
      { status: 500 }
    );
  }
}
