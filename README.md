# Harmonie au manche

Un atelier d'harmonie pour guitare, en un seul fichier HTML : carte des
fonctions d'une tonalité, réseau complet des accords, dictionnaire de doigtés,
travail des gammes sur le manche, boucle rythmique et métronome.

- `harmonie-guitare.html` — l'application entière. Aucune dépendance, aucun
  outil de build : ouverte telle quelle dans un navigateur, elle marche déjà.
- `netlify/functions/grilles.mjs` — l'API qui enregistre chemins et grilles
  dans Airtable, **côté serveur**.
- `netlify.toml` — configuration du déploiement.

## Les trois façons dont la page enregistre

La page choisit son dos au chargement, du meilleur au plus modeste :

| Contexte | Mémoire | Le jeton Airtable vit… |
|---|---|---|
| Le site Netlify | `/api/grilles` → Airtable | dans une variable d'environnement Netlify |
| L'aperçu en artefact Claude | le connecteur Airtable du lecteur | nulle part, ce sont ses identifiants |
| Fichier ouvert seul, réseau coupé | `localStorage` du navigateur | — |

Le même fichier sert dans les trois cas : rien à modifier entre les deux.

**Un jeton Airtable ne doit jamais se retrouver dans le HTML.** La page est
téléchargée par le navigateur : tout ce qu'elle contient est lisible par qui
ouvre l'adresse. C'est la raison d'être de la fonction serverless.

## Mettre le site en ligne

### 1. Un nouveau jeton Airtable

https://airtable.com/create/tokens → *Create new token*

- Portées : `data.records:read` et `data.records:write`
- Accès : la base **Guitare — Harmonie** uniquement
- Copie le jeton, il ne s'affiche qu'une fois

### 2. Brancher le dépôt sur Netlify

https://app.netlify.com → *Add new site* → *Import an existing project* →
GitHub → ce dépôt → branche `main`.

Netlify lit `netlify.toml`, il n'y a rien à saisir : la commande de build, le
dossier publié et le dossier des fonctions y sont déjà.

### 3. Les variables d'environnement

*Site configuration* → *Environment variables* → *Add a variable* :

| Nom | Valeur | Obligatoire |
|---|---|---|
| `AIRTABLE_TOKEN` | le jeton de l'étape 1 | oui |
| `AIRTABLE_BASE` | `appnzisvARTfJG5di` | non (valeur par défaut) |
| `AIRTABLE_TABLE` | `tbl23cy3ggY7kLm3s` | non (valeur par défaut) |
| `APP_KEY` | un mot de passe de ton choix | non — voir ci-dessous |

Puis *Deploys* → *Trigger deploy* pour que le site reprenne les variables.

### 4. Le nom du site

*Site configuration* → *Change site name* → par exemple `harmonie-au-manche`,
ce qui donne `https://harmonie-au-manche.netlify.app`. Un vrai domaine se
branche plus tard dans *Domain management*, sans rien casser.

## Qui peut écrire dans la base

Par défaut, l'API est ouverte à qui connaît l'adresse du site : c'est un site
public, et n'importe qui pourrait enregistrer ou supprimer un chemin. Pour un
outil personnel c'est généralement sans conséquence, mais si tu veux fermer :

1. Mets une valeur dans `APP_KEY` côté Netlify.
2. Dans `harmonie-guitare.html`, fonction `apiCall`, ajoute l'en-tête
   `"x-app-key": "<la même valeur>"`.

Attention : cette clé est alors dans la page, donc lisible. Elle arrête les
robots et les curieux, pas quelqu'un de déterminé. Une vraie fermeture passe
par l'authentification Netlify Identity, à faire le jour où ça compte.

## Travailler dessus en local

```sh
npx netlify-cli dev      # sert la page et les fonctions sur http://localhost:8888
```

Sans la CLI, ouvrir `harmonie-guitare.html` directement dans un navigateur
suffit pour tout sauf l'enregistrement, qui bascule alors sur le navigateur.

## La suite : de vrais échantillons sonores

Aujourd'hui les six timbres sont synthétisés (corde de Karplus-Strong pour les
guitares et la basse, synthèse additive pour le piano, oscillateurs filtrés
pour le violon et la trompette). Un site lève la contrainte qui l'imposait :
une page hébergée peut charger ses propres fichiers audio.

Pour y passer : déposer les échantillons dans `public/samples/<instrument>/`
(les banques **VSCO2 Community Edition** et **VCSL** sont en CC0, donc
utilisables sans condition), puis remplacer `toneBuffer()` par un chargement
`fetch` + `decodeAudioData`, avec transposition par `playbackRate` entre deux
notes échantillonnées. Prévoir trois à quatre notes par octave pour que la
transposition reste naturelle. L'en-tête de cache pour `/samples/*` est déjà
posé dans `netlify.toml`.
