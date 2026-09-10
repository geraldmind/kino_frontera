const API_ROOT = "https://api.airtable.com/v0";
const CONTENT_ROOT = "https://content.airtable.com/v0";

const BASE_ID = process.env.AIRTABLE_BASE_ID || "appZCohU29ZReNAgx";

export class AirtableConfigError extends Error {
  constructor() {
    super(
      "AIRTABLE_TOKEN manquant. Ajoute-le dans .env.local (voir .env.example)."
    );
    this.name = "AirtableConfigError";
  }
}

function token(): string {
  const t = process.env.AIRTABLE_TOKEN;
  if (!t) throw new AirtableConfigError();
  return t;
}

export interface AirtableRecord<F = Record<string, unknown>> {
  id: string;
  createdTime: string;
  fields: F;
}

// Les réponses sont demandées avec les champs indexés par fieldId (plutôt
// que par nom) pour matcher les constantes de src/lib/schema.ts.
export async function airtableList<F = Record<string, unknown>>(
  tableId: string,
  filterByFormula?: string
): Promise<AirtableRecord<F>[]> {
  const records: AirtableRecord<F>[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`${API_ROOT}/${BASE_ID}/${tableId}`);
    url.searchParams.set("returnFieldsByFieldId", "true");
    url.searchParams.set("pageSize", "100");
    if (filterByFormula) url.searchParams.set("filterByFormula", filterByFormula);
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token()}` },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Airtable ${tableId} list a échoué (${res.status}): ${await res.text()}`);
    }
    const data = await res.json();
    records.push(...data.records);
    offset = data.offset;
  } while (offset);

  return records;
}

export async function airtableCreate<F = Record<string, unknown>>(
  tableId: string,
  fields: Record<string, unknown>
): Promise<AirtableRecord<F>> {
  const res = await fetch(`${API_ROOT}/${BASE_ID}/${tableId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ records: [{ fields }], returnFieldsByFieldId: true }),
  });
  if (!res.ok) {
    throw new Error(`Airtable ${tableId} create a échoué (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return data.records[0];
}

export async function airtableUploadAttachment(
  recordId: string,
  fieldId: string,
  filename: string,
  contentType: string,
  base64: string
): Promise<void> {
  const res = await fetch(
    `${CONTENT_ROOT}/${BASE_ID}/${recordId}/${fieldId}/uploadAttachment`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contentType, filename, file: base64 }),
    }
  );
  if (!res.ok) {
    throw new Error(`Upload du justificatif échoué (${res.status}): ${await res.text()}`);
  }
}
