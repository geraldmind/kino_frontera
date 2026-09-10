"use client";

import { useState, ReactNode } from "react";

export default function Tabs({
  tabs,
}: {
  tabs: { key: string; label: string; content: ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.key);
  return (
    <div>
      <div className="mb-5 flex gap-1 rounded-lg border border-line bg-surface p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`flex-1 rounded-md px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors ${
              active === t.key ? "bg-accent text-white" : "text-inksoft hover:bg-surface2"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.find((t) => t.key === active)?.content}
    </div>
  );
}
