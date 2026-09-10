import { NextResponse } from "next/server";
import { airtableList, AirtableConfigError } from "@/lib/airtable";
import { TABLES, FIELDS } from "@/lib/schema";
import { mapRef } from "@/lib/mappers";

export async function GET() {
  try {
    const records = await airtableList(TABLES.equipe);
    const equipe = records.map(mapRef(FIELDS.equipe.nom)).sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
    return NextResponse.json(equipe);
  } catch (e) {
    if (e instanceof AirtableConfigError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
