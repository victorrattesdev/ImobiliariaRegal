import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { forbidden, requireAdmin } from "@/lib/auth";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/constants";

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return forbidden();

    const formData = await req.formData();
    const files = formData
      .getAll("images")
      .filter((f): f is File => f instanceof File);

    if (!files.length) {
      return NextResponse.json(
        { success: false, error: "Nenhuma imagem enviada" },
        { status: 400 }
      );
    }

    if (files.length > 20) {
      return NextResponse.json(
        { success: false, error: "Máximo de 20 imagens por envio" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "properties");
    await mkdir(uploadDir, { recursive: true });

    const imageUrls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Tipo de arquivo não permitido: ${file.type || "desconhecido"}`,
          },
          { status: 400 }
        );
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { success: false, error: "Cada imagem deve ter no máximo 5MB" },
          { status: 400 }
        );
      }

      const ext = EXT_BY_MIME[file.type] || ".jpg";
      const filename = `property-${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, filename), buffer);
      imageUrls.push(`/uploads/properties/${filename}`);
    }

    return NextResponse.json({
      success: true,
      data: { imageUrls, count: imageUrls.length },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Falha no upload das imagens" },
      { status: 500 }
    );
  }
}
