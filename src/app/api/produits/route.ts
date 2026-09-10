import { NextRequest, NextResponse } from "next/server";
import { airtableList, AirtableConfigError } from "@/lib/airtable";
import { TABLES } from "@/lib/schema";
import { mapProduit } from "@/lib/mappers";

export async function GET(req: NextRequest) {
  try {
    const records = await airtableList(TABLES.produits);
    let produits = records.map(mapProduit);
    const structureId = req.nextUrl.searchParams.get("structureId");
    if (structureId) {
      produits = produits.filter((p) => p.structureIds.includes(structureId));
    }
    produits.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
    return NextResponse.json(produits);
  } catch (e) {
    if (e instanceof AirtableConfigError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
