"use client";

import { useEffect, useState } from "react";
import type { Produit, RefItem, Vente } from "@/types";

export default function SaleForm({
  structures,
  moyens,
  equipe,
  onCreated,
}: {
  structures: RefItem[];
  moyens: RefItem[];
  equipe: RefItem[];
  onCreated: (v: Vente) => void;
}) {
  const [structureId, setStructureId] = useState(structures[0]?.id ?? "");
  const [produits, setProduits] = useState<Produit[]>([]);
  const [produitId, setProduitId] = useState("");
  const [montant, setMontant] = useState("");
  const [moyenId, setMoyenId] = useState(moyens[0]?.id ?? "");
  const [vendeurId, setVendeurId] = useState(equipe[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!structureId) return;
    fetch(`/api/produits?structureId=${structureId}`)
      .then((r) => r.json())
      .then((data: Produit[]) => {
        setProduits(Array.isArray(data) ? data : []);
        setProduitId("");
        setMontant("");
      });
  }, [structureId]);

  function handleProduitChange(id: string) {
    setProduitId(id);
    const p = produits.find((p) => p.id === id);
    if (p?.prixParDefaut != null) setMontant(String(p.prixParDefaut));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!produitId || !montant || !moyenId || !vendeurId) {
      setError("Choisis un produit, un montant, un moyen de paiement et un vendeur.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/ventes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produitId,
          montant: Number(montant),
          moyenPaiementId: moyenId,
          vendeurId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");
      onCreated(data as Vente);
      setSuccess(true);
      setProduitId("");
      setMontant("");
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

      <Field label="Produit">
        <select
          className="input"
          value={produitId}
          onChange={(e) => handleProduitChange(e.target.value)}
        >
          <option value="">— Choisir —</option>
          {produits.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom}
            </option>
          ))}
        </select>
        {produits.length === 0 && (
          <p className="mt-1 text-xs text-inksoft">
            Aucun produit actif pour cette enseigne — ajoute-le dans Airtable, table Produits.
          </p>
        )}
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

      <Field label="Vendeur">
        <select className="input" value={vendeurId} onChange={(e) => setVendeurId(e.target.value)}>
          <option value="">— Choisir —</option>
          {equipe.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom}
            </option>
          ))}
        </select>
      </Field>

      {error && <p className="text-sm text-outcome">{error}</p>}
      {success && <p className="text-sm text-income">Vente enregistrée ✓</p>}

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? "Enregistrement…" : "Enregistrer la vente"}
      </button>
    </form>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-inksoft">{label}</span>
      {children}
    </label>
  );
}

export function ChipGroup({
  items,
  value,
  onChange,
}: {
  items: RefItem[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          type="button"
          key={it.id}
          onClick={() => onChange(it.id)}
          className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
            value === it.id
              ? "border-accent bg-accent text-white"
              : "border-line bg-surface text-ink hover:border-linestrong"
          }`}
        >
          {it.nom}
        </button>
      ))}
    </div>
  );
}
