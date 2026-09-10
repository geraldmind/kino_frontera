// IDs figés de la base Airtable "Gym Chaloklum" (appZCohU29ZReNAgx).
// Regénérer ce fichier si des tables/champs sont recréés côté Airtable.

export const TABLES = {
  produits: "tblE1Xxsin4o6Zd5h",
  equipe: "tblYQcI13lhWxrypv",
  ventes: "tblomtifEoEOPoh4t",
  depenses: "tblR4WJK0VmYXCXEg",
  categories: "tblOmcsJvUd0t30Ad",
  moyensPaiement: "tblF6yhzA1NSlSSbg",
  structures: "tblTw3oxKQ5XyD76D",
} as const;

export const FIELDS = {
  produits: {
    nom: "fldx2M7xB2f8yUO54",
    prixParDefaut: "fldifQ4R4adbi2akb",
    actif: "fldgUWXHsZKpHn7PE",
    categorie: "fldMQ5EukbyX1SrRa",
    structure: "fldbZaez9M2FCC0f5",
  },
  equipe: {
    nom: "fldJVKq7LyVRciEaf",
    role: "fldYNv3DASes2erPy",
  },
  ventes: {
    dateHeure: "fld3DvTpS76QaLhT2",
    produit: "fldg1J878xkdOLRcy",
    montant: "fldNWR5hzr99YHT4G",
    moyenPaiement: "fldtONmScHLsjx29D",
    vendeur: "fldWtJxplxXyV1kDd",
    note: "fldrnSoBhGFQ8I34C",
    categorieLookup: "fldqGuAlLVqlbIbFb",
    structureLookup: "fldZLqC7jylhd1u2d",
  },
  depenses: {
    date: "fldTBOLgaGmfLv8l4",
    montant: "fldIUF2Sd9glIO5a1",
    categorie: "fldmJmDrt96CCp8Mr",
    description: "fldVnhR6P1Gaam3qe",
    enregistrePar: "fldlZP75WAug5cj77",
    moyenPaiement: "fld4hYTFLc3wargi5",
    structure: "fldtn9GWtx7rr77OB",
    justificatif: "fldZjBOhMYP5GxHIH",
  },
  categories: { nom: "fldtif75DzlrF6E1d" },
  moyensPaiement: { nom: "fldM0kLI1Z6zNEZcj" },
  structures: { nom: "fldJJcMVVv7raRMx1" },
} as const;

export const DEPENSES_CATEGORIES = [
  "Loyer",
  "Salaires",
  "Fournitures",
  "Entretien",
  "Retrait de caisse",
  "Autre",
] as const;
