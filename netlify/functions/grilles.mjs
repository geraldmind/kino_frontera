/**
 * /api/grilles — mémoire des chemins et des grilles, adossée à Airtable.
 *
 * Le jeton Airtable vit ici, côté serveur, dans une variable d'environnement.
 * Il n'est jamais envoyé au navigateur : la page appelle cette fonction, la
 * fonction appelle Airtable. C'est la seule façon correcte de faire, un jeton
 * dans du HTML étant lisible par tout le monde.
 *
 * Variables d'environnement (Netlify › Site configuration › Environment variables) :
 *   AIRTABLE_TOKEN  (obligatoire) jeton d'accès personnel, portées data.records:read
 *                   et data.records:write sur la base « Guitare — Harmonie »
 *   AIRTABLE_BASE   (facultatif)  appnzisvARTfJG5di par défaut
 *   AIRTABLE_TABLE  (facultatif)  tbl23cy3ggY7kLm3s par défaut
 *   APP_KEY         (facultatif)  si défini, chaque requête doit porter
 *                   l'en-tête x-app-key ; sinon l'API est ouverte à qui
 *                   connaît l'URL du site.
 */

const BASE  = process.env.AIRTABLE_BASE  || "appnzisvARTfJG5di";
const TABLE = process.env.AIRTABLE_TABLE || "tbl23cy3ggY7kLm3s";

/* Identifiants de champs relevés sur la base — stables même si tu renommes
   les colonnes dans Airtable. */
const F = {
  nom:       "fldzzmFKhw34Vxgf9",
  resume:    "fldyGMCDmOZcAL6tY",
  tonique:   "fldIFK6OLzTDKxwBy",
  mode:      "fldPXqsKnYfyIOPvU",
  tempo:     "fldqzbmaYNATiG3Ek",
  accords:   "fld6tGANI4kwrhene",
  notes:     "fldJ62kd9jV7Do9XN",
  cree:      "fldrQ7MTEkN2YFJph",
  type:      "fldzvnALAQlpNnrdl",
  createur:  "fldw8cBgQkQIYmafW",
  favori:    "fldKEEcrVrrPFFN88"
};
const CREATEURS = ["Gérald", "Axel", "Jean-Louis Durand"];

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });

async function airtable(path, init = {}) {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) throw Object.assign(new Error("AIRTABLE_TOKEN absent"), { status: 503 });
  const r = await fetch(`https://api.airtable.com/v0/${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...(init.headers || {})
    }
  });
  const text = await r.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
  if (!r.ok) {
    const msg = body?.error?.message || body?.error?.type || `Airtable a répondu ${r.status}`;
    throw Object.assign(new Error(msg), { status: r.status === 401 || r.status === 403 ? 502 : r.status });
  }
  return body;
}

/* Un champ « choix unique » revient en objet, s'écrit en chaîne. */
const name = v => (v && typeof v === "object" ? v.name : v) || "";

/* Ceinture et bretelles : on lit indifféremment les champs indexés par
   identifiant ou par nom, selon ce que renvoie l'API. */
const BY_NAME = { nom:"Nom", resume:"Résumé", tonique:"Tonique", mode:"Mode",
  tempo:"Tempo", accords:"Accords", notes:"Notes", cree:"Créé le",
  type:"Type", createur:"Créateur", favori:"Favori" };

function toItem(rec) {
  const raw = rec.fields || {};
  const f = new Proxy({}, { get: (_, k) => {
    const hit = Object.keys(F).find(n => F[n] === k);
    return raw[k] !== undefined ? raw[k] : (hit ? raw[BY_NAME[hit]] : undefined);
  }});
  let accords = [];
  try { accords = JSON.parse(f[F.accords] || "[]"); } catch { accords = []; }
  return {
    id: rec.id,
    nom: f[F.nom] || "sans nom",
    resume: f[F.resume] || "",
    tonique: f[F.tonique] || "",
    mode: name(f[F.mode]) === "mineur" ? "min" : "maj",
    kind: name(f[F.type]) || "grille",
    createur: name(f[F.createur]),
    favori: !!f[F.favori],
    tempo: f[F.tempo] || null,
    notes: f[F.notes] || "",
    accords
  };
}

/* On n'écrit que ce que la page a le droit d'écrire, et on borne les tailles :
   le corps de la requête vient du navigateur, il n'est pas digne de confiance. */
function toFields(body, { partial } = {}) {
  const f = {};
  const str = (v, max) => String(v ?? "").slice(0, max);
  if (body.nom !== undefined) f[F.nom] = str(body.nom, 120);
  if (body.resume !== undefined) f[F.resume] = str(body.resume, 500);
  if (body.tonique !== undefined) f[F.tonique] = str(body.tonique, 8);
  if (body.mode !== undefined) f[F.mode] = body.mode === "min" ? "mineur" : "majeur";
  if (body.kind !== undefined) f[F.type] = ["chemin","grille","accord"].includes(body.kind) ? body.kind : "grille";
  if (body.createur !== undefined && CREATEURS.includes(body.createur)) f[F.createur] = body.createur;
  if (body.favori !== undefined) f[F.favori] = !!body.favori;
  if (body.notes !== undefined) f[F.notes] = str(body.notes, 4000);
  if (body.tempo !== undefined) {
    const t = Number(body.tempo);
    if (Number.isFinite(t)) f[F.tempo] = Math.min(300, Math.max(20, Math.round(t)));
  }
  if (body.accords !== undefined) {
    if (!Array.isArray(body.accords)) throw Object.assign(new Error("accords doit être une liste"), { status: 400 });
    if (body.accords.length > 64) throw Object.assign(new Error("64 accords au maximum"), { status: 400 });
    const packed = JSON.stringify(body.accords);
    if (packed.length > 90000) throw Object.assign(new Error("chemin trop lourd"), { status: 400 });
    f[F.accords] = packed;
  }
  if (!partial) f[F.cree] = new Date().toISOString();
  if (!Object.keys(f).length) throw Object.assign(new Error("rien à écrire"), { status: 400 });
  return f;
}

export default async (req) => {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  const key = process.env.APP_KEY;
  if (key && req.headers.get("x-app-key") !== key) return json({ error: "Clé d'accès manquante." }, 401);

  try {
    if (req.method === "GET") {
      /* Sans returnFieldsByFieldId, Airtable renvoie les champs indexés par
         NOM — alors qu'on les écrit par identifiant. Les deux doivent
         concorder, sinon tout revient vide. */
      const qs = new URLSearchParams({ pageSize: "100", returnFieldsByFieldId: "true" });
      qs.append("sort[0][field]", F.cree);
      qs.append("sort[0][direction]", "desc");
      const data = await airtable(`${BASE}/${TABLE}?${qs}`);
      const items = (data.records || []).map(toItem);
      items.sort((a, b) => (b.favori ? 1 : 0) - (a.favori ? 1 : 0));
      return json({ items });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const data = await airtable(`${BASE}/${TABLE}`, {
        method: "POST",
        body: JSON.stringify({ records: [{ fields: toFields(body) }], returnFieldsByFieldId: true, typecast: true })
      });
      return json({ item: toItem(data.records[0]) }, 201);
    }

    if (req.method === "PATCH") {
      if (!id) return json({ error: "id manquant" }, 400);
      const body = await req.json();
      const data = await airtable(`${BASE}/${TABLE}`, {
        method: "PATCH",
        body: JSON.stringify({ records: [{ id, fields: toFields(body, { partial: true }) }], returnFieldsByFieldId: true, typecast: true })
      });
      return json({ item: toItem(data.records[0]) });
    }

    if (req.method === "DELETE") {
      if (!id) return json({ error: "id manquant" }, 400);
      await airtable(`${BASE}/${TABLE}?records[]=${encodeURIComponent(id)}`, { method: "DELETE" });
      return json({ deleted: id });
    }

    return json({ error: "Méthode non gérée" }, 405);
  } catch (e) {
    return json({ error: e.message || "Erreur inattendue" }, e.status || 500);
  }
};

export const config = { path: "/api/grilles" };
