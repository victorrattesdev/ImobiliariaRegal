import dotenv from "dotenv";
dotenv.config({ override: true });

import { readFileSync, existsSync } from "fs";
import path from "path";
import { hashPassword } from "../lib/password";
import {
  createProperty,
  createUser,
  getProperties,
  getUserByUsername,
} from "../lib/properties";

async function seed() {
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const existing = await getUserByUsername("admin");

  if (!existing) {
    await createUser({
      username: "admin",
      email: "admin@regal.com.br",
      password: await hashPassword(adminPassword),
      firstName: "Admin",
      lastName: "Regal",
      role: "admin",
    });
    console.log(`Usuário admin criado (senha: ${adminPassword})`);
  } else {
    console.log("Usuário admin já existe");
  }

  const current = await getProperties({ includeInactive: true, limit: 200 });
  const existingTitles = new Set(current.map((p) => p.title));

  const candidates = [
    path.resolve(process.cwd(), "data/properties.json"),
    path.resolve(process.cwd(), "../data/properties.json"),
  ];
  const source = candidates.find((p) => existsSync(p));
  if (!source) {
    console.log("Nenhum properties.json para importar.");
    return;
  }

  const rows = JSON.parse(readFileSync(source, "utf-8")) as Record<
    string,
    unknown
  >[];
  let imported = 0;

  for (const row of rows) {
    if (existingTitles.has(String(row.title))) continue;
    try {
      const priceNum = Number(row.price);
      const iptuNum = row.iptu != null ? Number(row.iptu) : null;
      // decimal(15,2) — evita overflow de dados de teste absurdos
      const price =
        Number.isFinite(priceNum) && Math.abs(priceNum) < 1e13
          ? priceNum.toFixed(2)
          : "0.00";
      const iptu =
        iptuNum != null && Number.isFinite(iptuNum) && Math.abs(iptuNum) < 1e13
          ? iptuNum.toFixed(2)
          : null;

      await createProperty({
        title: String(row.title),
        description: (row.description as string) ?? null,
        price,
        location: String(row.location),
        address: (row.address as string) ?? null,
        city: String(row.city),
        state: String(row.state),
        zipCode: (row.zipCode as string) ?? (row.zip_code as string) ?? null,
        propertyType: String(row.propertyType ?? row.property_type),
        listingType: String(row.listingType ?? row.listing_type),
        bedrooms: Number(row.bedrooms),
        bathrooms: Number(row.bathrooms),
        sqft: Number(row.sqft),
        parking: (row.parking as number) ?? 0,
        images: (row.images as string[]) ?? [],
        amenities: (row.amenities as string[]) ?? [],
        carSpaces:
          (row.carSpaces as number) ?? (row.car_spaces as number) ?? 1,
        strongPoints:
          (row.strongPoints as string[]) ??
          (row.strong_points as string[]) ??
          [],
        iptu,
        mapEmbedUrl:
          (row.mapEmbedUrl as string) ??
          (row.map_embed_url as string) ??
          null,
        featured: Boolean(row.featured),
        status: String(row.status ?? "active"),
      });
      imported += 1;
    } catch (err) {
      console.warn(
        `Falha ao importar "${row.title}":`,
        err instanceof Error ? err.message : err
      );
    }
  }

  console.log(`Importados ${imported} imóveis do JSON para o Neon.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
