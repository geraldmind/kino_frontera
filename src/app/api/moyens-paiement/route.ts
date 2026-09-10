import { NextResponse } from "next/server";
import { airtableList, AirtableConfigError } from "@/lib/airtable";
import { TABLES, FIELDS } from "@/lib/schema";
import { mapRef } from "@/lib/mappers";

export async function GET() {
  try {
    const records = await airtableList(TABLES.moyensPaiement);
    const moyens = records.map(mapRef(FIELDS.moyensPaiement.nom));
    return NextResponse.json(moyens);
  } catch (e) {
    if (e instanceof AirtableConfigError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
