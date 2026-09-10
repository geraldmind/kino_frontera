import { NextRequest, NextResponse } from "next/server";
import { airtableCreate, airtableList, AirtableConfigError } from "@/lib/airtable";
import { FIELDS, TABLES } from "@/lib/schema";
import { mapVente } from "@/lib/mappers";

export async function GET() {
  try {
    const records = await airtableList(TABLES.ventes);
    return NextResponse.json(records.map(mapVente));
  } catch (e) {
    if (e instanceof AirtableConfigError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { produitId, montant, moyenPaiementId, vendeurId, note } = body as {
      produitId: string;
      montant: number;
      moyenPaiementId: string;
      vendeurId: string;
      note?: string;
    };

    if (!produitId || !montant || !moyenPaiementId || !vendeurId) {
      return NextResponse.json({ error: "Produit, montant, moyen de paiement et vendeur sont requis." }, { status: 400 });
    }

    const record = await airtableCreate(TABLES.ventes, {
      [FIELDS.ventes.dateHeure]: new Date().toISOString(),
      [FIELDS.ventes.produit]: [produitId],
      [FIELDS.ventes.montant]: montant,
      [FIELDS.ventes.moyenPaiement]: [moyenPaiementId],
      [FIELDS.ventes.vendeur]: [vendeurId],
      ...(note ? { [FIELDS.ventes.note]: note } : {}),
    });

    return NextResponse.json(mapVente(record), { status: 201 });
  } catch (e) {
    if (e instanceof AirtableConfigError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
