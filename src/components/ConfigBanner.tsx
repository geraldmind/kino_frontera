export default function ConfigBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-outcome bg-outcomebg px-4 py-3 text-sm text-outcome">
      <p className="font-medium">Configuration Airtable manquante</p>
      <p className="mt-1 text-inksoft">{message} Voir le fichier README.md pour créer le token.</p>
    </div>
  );
}
