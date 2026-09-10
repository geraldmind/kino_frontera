"use client";

import { useEffect, useMemo, useState } from "react";
import type { Depense, Produit, RefItem, Vente } from "@/types";
import { nowBangkok, toBangkok } from "@/lib/dates";
import { formatTHB } from "@/lib/format";
import DateBadge from "@/components/DateBadge";
import Tabs from "@/components/Tabs";
import SaleForm from "@/components/SaleForm";
import ExpenseForm from "@/components/ExpenseForm";
import ConfigBanner from "@/components/ConfigBanner";

function byId(items: RefItem[]) {
  const map = new Map(items.map((i) => [i.id, i.nom]));
  return (ids: string[]) => ids.map((id) => map.get(id) ?? "?").join(", ");
}

export default function StaffApp() {
  const [structures, setStructures] = useState<RefItem[]>([]);
  const [moyens, setMoyens] = useState<RefItem[]>([]);
  const [equipe, setEquipe] = useState<RefItem[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [configError, setConfigError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    const endpoints = ["/api/structures", "/api/moyens-paiement", "/api/equipe", "/api/produits", "/api/ventes", "/api/depenses"];
    const results = await Promise.all(endpoints.map((url) => fetch(url).then(async (r) => ({ ok: r.ok, status: r.status, data: await r.json() }))));
    const cfgError = results.find((r) => r.status === 503);
    if (cfgError) {
      setConfigError(cfgError.data.error);
      setLoading(false);
      return;
    }
    setStructures(results[0].data);
    setMoyens(results[1].data);
    setEquipe(results[2].data);
    setProduits(results[3].data);
    setVentes(results[4].data);
    setDepenses(results[5].data);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const todayVentes = useMemo(() => {
    const start = nowBangkok().startOf("day");
    return ventes
      .filter((v) => toBangkok(v.dateHeure).isAfter(start))
      .sort((a, b) => (a.dateHeure < b.dateHeure ? 1 : -1));
  }, [ventes]);

  const todayDepenses = useMemo(() => {
    const todayStr = nowBangkok().format("YYYY-MM-DD");
    return depenses.filter((d) => d.date === todayStr);
  }, [depenses]);

  const structureName = byId(structures);
  const moyenName = byId(moyens);
  const vendeurName = byId(equipe);
  const produitName = byId(produits.map((p) => ({ id: p.id, nom: p.nom })));

  if (loading) return <p className="text-inksoft">Chargement…</p>;
  if (configError) return <ConfigBanner message={configError} />;

  return (
    <div>
      <DateBadge />
      <Tabs
        tabs={[
          {
            key: "ventes",
            label: "Ventes",
            content: (
              <div className="space-y-5">
                <SaleForm
                  structures={structures}
                  moyens={moyens}
                  equipe={equipe}
                  onCreated={(v) => setVentes((prev) => [v, ...prev])}
                />
                <div>
                  <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-inksoft">
                    Ventes du jour ({todayVentes.length})
                  </h2>
                  <ul className="space-y-1.5">
                    {todayVentes.map((v) => (
                      <li
                        key={v.id}
                        className="flex items-center justify-between rounded-md border border-line bg-surface px-3 py-2 text-sm"
                      >
                        <span>
                          <span className="font-mono text-xs text-inksoft">{toBangkok(v.dateHeure).format("HH:mm")}</span>{" "}
                          {produitName(v.produitIds)} · {structureName(v.structureLookup)} · {moyenName(v.moyenPaiementIds)} ·{" "}
                          {vendeurName(v.vendeurIds)}
                        </span>
                        <span className="tabular-nums font-medium text-income">{formatTHB(v.montant)}</span>
                      </li>
                    ))}
                    {todayVentes.length === 0 && <p className="text-sm text-inksoft">Aucune vente enregistrée aujourd&rsquo;hui.</p>}
                  </ul>
                </div>
              </div>
            ),
          },
          {
            key: "depenses",
            label: "Dépenses",
            content: (
              <div className="space-y-5">
                <ExpenseForm
                  structures={structures}
                  moyens={moyens}
                  equipe={equipe}
                  onCreated={loadAll}
                />
                <div>
                  <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-inksoft">
                    Dépenses du jour ({todayDepenses.length})
                  </h2>
                  <ul className="space-y-1.5">
                    {todayDepenses.map((d) => (
                      <li
                        key={d.id}
                        className="flex items-center justify-between rounded-md border border-line bg-surface px-3 py-2 text-sm"
                      >
                        <span>
                          {d.categorie} · {d.description || "—"} · {structureName(d.structureIds)} ·{" "}
                          {moyenName(d.moyenPaiementIds)}
                          {d.justificatif.length > 0 && (
                            <a href={d.justificatif[0].url} target="_blank" className="ml-2 text-accent underline">
                              justificatif
                            </a>
                          )}
                        </span>
                        <span className="tabular-nums font-medium text-outcome">{formatTHB(d.montant)}</span>
                      </li>
                    ))}
                    {todayDepenses.length === 0 && <p className="text-sm text-inksoft">Aucune dépense enregistrée aujourd&rsquo;hui.</p>}
                  </ul>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
