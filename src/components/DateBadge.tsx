"use client";

import { useEffect, useState } from "react";
import { nowBangkok } from "@/lib/dates";

export default function DateBadge() {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const update = () => setLabel(nowBangkok().format("dddd D MMMM YYYY · HH:mm"));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mb-5 flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-3">
      <span className="h-2 w-2 rounded-full bg-accent" />
      <span className="font-mono text-xs uppercase tracking-wide text-inksoft">Aujourd&rsquo;hui</span>
      <span className="font-display text-base font-medium capitalize">{label || "…"}</span>
    </div>
  );
}
