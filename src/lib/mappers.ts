import { FIELDS } from "@/lib/schema";
import type { AirtableRecord } from "@/lib/airtable";
import type { Depense, Produit, RefItem, Vente } from "@/types";

export function mapRef(nomFieldId: string) {
  return (r: AirtableRecord<any>): RefItem => ({
    id: r.id,
    nom: r.fields[nomFieldId] ?? "",
  });
}

export function mapProduit(r: AirtableRecord<any>): Produit {
  const f = r.fields;
  return {
    id: r.id,
    nom: f[FIELDS.produits.nom] ?? "",
    prixParDefaut: f[FIELDS.produits.prixParDefaut] ?? null,
    categorieIds: f[FIELDS.produits.categorie] ?? [],
    structureIds: f[FIELDS.produits.structure] ?? [],
  };
}

export function mapVente(r: AirtableRecord<any>): Vente {
  const f = r.fields;
  return {
    id: r.id,
    dateHeure: f[FIELDS.ventes.dateHeure] ?? "",
    produitIds: f[FIELDS.ventes.produit] ?? [],
    montant: f[FIELDS.ventes.montant] ?? 0,
    moyenPaiementIds: f[FIELDS.ventes.moyenPaiement] ?? [],
    vendeurIds: f[FIELDS.ventes.vendeur] ?? [],
    note: f[FIELDS.ventes.note] ?? "",
    categorieLookup: f[FIELDS.ventes.categorieLookup] ?? [],
    structureLookup: f[FIELDS.ventes.structureLookup] ?? [],
  };
}

export function mapDepense(r: AirtableRecord<any>): Depense {
  const f = r.fields;
  const atts = (f[FIELDS.depenses.justificatif] ?? []) as Array<{ url: string; filename: string }>;
  return {
    id: r.id,
    date: f[FIELDS.depenses.date] ?? "",
    montant: f[FIELDS.depenses.montant] ?? 0,
    categorie: f[FIELDS.depenses.categorie] ?? null,
    description: f[FIELDS.depenses.description] ?? "",
    enregistreParIds: f[FIELDS.depenses.enregistrePar] ?? [],
    moyenPaiementIds: f[FIELDS.depenses.moyenPaiement] ?? [],
    structureIds: f[FIELDS.depenses.structure] ?? [],
    justificatif: atts.map((a) => ({ url: a.url, filename: a.filename })),
  };
}
