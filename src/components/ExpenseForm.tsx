"use client";

import { useState } from "react";
import type { RefItem } from "@/types";
import { DEPENSES_CATEGORIES } from "@/lib/schema";
import { Field, ChipGroup } from "@/components/SaleForm";

export default function ExpenseForm({
  structures,
  moyens,
  equipe,
  onCreated,
}: {
  structures: RefItem[];
  moyens: RefItem[];
  equipe: RefItem[];
  onCreated: () => void;
}) {
  const [structureId, setStructureId] = useState(structures[0]?.id ?? "");
  const [montant, setMontant] = useState("");
  const [categorie, setCategorie] = useState<string>(DEPENSES_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [moyenId, setMoyenId] = useState(moyens[0]?.id ?? "");
  const [enregistreParId, setEnregistreParId] = useState(equipe[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!montant || !categorie || !moyenId || !structureId || !enregistreParId) {
      setError("Montant, catégorie, enseigne, moyen de paiement et déclarant sont requis.");
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.set("montant", montant);
      form.set("categorie", categorie);
      form.set("description", description);
      form.set("moyenPaiementId", moyenId);
      form.set("structureId", structureId);
      form.set("enregistreParId", enregistreParId);
      if (file) form.set("justificatif", file);

      const res = await fetch("/api/depenses", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");

      onCreated();
      setSuccess(true);
      setMontant("");
      setDescription("");
      setFile(null);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-line bg-surface p-5">
      <Field label="Enseigne">
        <ChipGroup items={structures} value={structureId} onChange={setStructureId} />
      </Field>

      <Field label="Catégorie">
        <select className="input" value={categorie} onChange={(e) => setCategorie(e.target.value)}>
          {DEPENSES_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Qu'est-ce qui a été acheté ?">
        <input
          className="input"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex. Recharge savon douches"
        />
      </Field>

      <Field label="Montant (฿)">
        <input
          className="input tabular-nums"
          type="number"
          inputMode="decimal"
          min={0}
          step={1}
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          placeholder="0"
        />
      </Field>

      <Field label="Moyen de paiement">
        <ChipGroup items={moyens} value={moyenId} onChange={setMoyenId} />
      </Field>

      <Field label="Déclaré par">
        <select className="input" value={enregistreParId} onChange={(e) => setEnregistreParId(e.target.value)}>
          <option value="">— Choisir —</option>
          {equipe.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Justificatif (photo de la facture, optionnel)">
        <input
          className="input file:mr-3 file:rounded file:border-0 file:bg-surface2 file:px-3 file:py-1.5 file:text-xs"
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </Field>

      {error && <p className="text-sm text-outcome">{error}</p>}
      {success && <p className="text-sm text-income">Dépense enregistrée ✓</p>}

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? "Enregistrement…" : "Enregistrer la dépense"}
      </button>
    </form>
  );
}
