# Gym Chaloklum — suivi ventes & dépenses

Mini-application Next.js branchée sur la base Airtable "Gym Chaloklum" :

- **/staff** — vue équipe, calée sur la date du jour (Asia/Bangkok), pour déclarer une vente ou une dépense en quelques secondes.
- **/admin** — tableau de bord : income / outcome par semaine, mois, trimestre, année, comparaison avec la période précédente, et comparaison jours de semaine / week-end. Montants toujours affichés en ฿ THB avec l'équivalent $ USD et € EUR.

## Configuration

1. Copier `.env.example` en `.env.local`.
2. Créer un Personal Access Token Airtable (https://airtable.com/create/tokens) avec les scopes `data.records:read`, `data.records:write`, `schema.bases:read`, limité à la base "Gym Chaloklum".
3. Coller ce token dans `AIRTABLE_TOKEN` de `.env.local`. Ce fichier n'est jamais commité (voir `.gitignore`).

## Lancer en local

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000 — redirige vers `/staff`.

Tant que `AIRTABLE_TOKEN` n'est pas configuré, l'app affiche un message de configuration au lieu de planter.
