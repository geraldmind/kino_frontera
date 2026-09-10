import { NextRequest, NextResponse } from "next/server";
import {
  airtableCreate,
  airtableList,
  airtableUploadAttachment,
  AirtableConfigError,
} from "@/lib/airtable";
import { FIELDS, TABLES } from "@/lib/schema";
import { mapDepense } from "@/lib/mappers";
import { nowBangkok } from "@/lib/dates";

export async function GET() {
  try {
    const records = await airtableList(TABLES.depenses);
    return NextResponse.json(records.map(mapDepense));
  } catch (e) {
    if (e instanceof AirtableConfigError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// multipart/form-data : champs texte + fichier "justificatif" optionnel,
// pour pouvoir joindre une photo de facture en un seul appel depuis le formulaire.
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const montant = Number(form.get("montant"));
    const categorie = String(form.get("categorie") ?? "");
    const description = String(form.get("description") ?? "");
    const moyenPaiementId = String(form.get("moyenPaiementId") ?? "");
    const structureId = String(form.get("structureId") ?? "");
    const enregistreParId = String(form.get("enregistreParId") ?? "");
    const file = form.get("justificatif");

    if (!montant || !categorie || !moyenPaiementId || !structureId || !enregistreParId) {
      return NextResponse.json(
        { error: "Montant, catégorie, structure, moyen de paiement et déclarant sont requis." },
        { status: 400 }
      );
    }

    const record = await airtableCreate(TABLES.depenses, {
      [FIELDS.depenses.date]: nowBangkok().format("YYYY-MM-DD"),
      [FIELDS.depenses.montant]: montant,
      [FIELDS.depenses.categorie]: categorie,
      ...(description ? { [FIELDS.depenses.description]: description } : {}),
      [FIELDS.depenses.moyenPaiement]: [moyenPaiementId],
      [FIELDS.depenses.structure]: [structureId],
      [FIELDS.depenses.enregistrePar]: [enregistreParId],
    });

    if (file instanceof File && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      await airtableUploadAttachment(
        record.id,
        FIELDS.depenses.justificatif,
        file.name || "justificatif",
        file.type || "application/octet-stream",
        buffer.toString("base64")
      );
    }

    return NextResponse.json({ id: record.id }, { status: 201 });
  } catch (e) {
    if (e instanceof AirtableConfigError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
