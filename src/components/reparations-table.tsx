"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { StatutReparation } from "@/lib/types";

type Row = {
  id: string;
  client_nom: string;
  client_telephone: string | null;
  atelier: string;
  date_reception_client: string;
  date_retour_atelier: string | null;
  date_livraison_client: string | null;
  prix_reparation: number;
  urgent?: boolean;
  statut: StatutReparation;
  bijoux_count?: number;
};

function formatDate(dateValue: string | null) {
  if (!dateValue) return "—";
  return new Date(dateValue).toLocaleDateString("fr-FR");
}

function formatPrix(prix: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(prix);
}

import { EyeIcon, PencilSquareIcon, PrinterIcon, TrashIcon } from "@heroicons/react/24/outline";

export function ReparationsTable({ rows, title }: { rows: Row[]; title: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return rows;
    }
    return rows.filter((row) => {
      const name = row.client_nom.toLowerCase();
      const phone = (row.client_telephone ?? "").toLowerCase();
      return name.includes(normalized) || phone.includes(normalized);
    });
  }, [query, rows]);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette reparation ?")) {
      return;
    }
    setDeletingId(id);
    try {
      await fetch("/api/reparations/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="rounded-2xl border border-amber-100 bg-white p-5 shadow-lg">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-amber-900">{title}</h2>
        <div className="w-full sm:max-w-xs">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Recherche client..."
            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm outline-none transition focus:border-amber-400"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm rounded-xl overflow-hidden">
          <thead className="sticky top-0 z-10 bg-gradient-to-b from-amber-50 to-white border-b border-amber-100">
            <tr className="text-left text-amber-800 font-semibold">
              <th className="px-3 py-3">Client</th>
              <th className="px-3 py-3">Téléphone</th>
              <th className="px-3 py-3">Bijoux</th>
              <th className="px-3 py-3">Atelier</th>
              <th className="px-3 py-3">Réception</th>
              <th className="px-3 py-3">Retour atelier</th>
              <th className="px-3 py-3">Livraison</th>
              <th className="px-3 py-3">Prix</th>
              <th className="px-3 py-3">Statut</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, idx) => (
              <tr
                key={row.id}
                className={
                  `align-top transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-amber-50"} hover:bg-amber-100/70 border-b border-amber-50 last:border-b-0`
                }
              >
                <td className="px-3 py-3 font-medium text-zinc-900">{row.client_nom}</td>
                <td className="px-3 py-3 text-zinc-700">{row.client_telephone ?? "—"}</td>
                <td className="px-3 py-3 text-center">{row.bijoux_count ?? 0}</td>
                <td className="px-3 py-3">{row.atelier}</td>
                <td className="px-3 py-3">{formatDate(row.date_reception_client)}</td>
                <td className="px-3 py-3">{formatDate(row.date_retour_atelier)}</td>
                <td className="px-3 py-3">{formatDate(row.date_livraison_client)}</td>
                <td className="px-3 py-3 font-semibold text-amber-900">{formatPrix(row.prix_reparation)} DH</td>
                <td className="px-3 py-3">
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800 shadow-sm">
                    {row.statut}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    {row.urgent ? (
                      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm">
                        Urgent
                      </span>
                    ) : null}
                    <Link
                      href={`/reparation/${row.id}`}
                      className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 hover:border-zinc-300"
                      title="Voir la fiche"
                    >
                      <EyeIcon className="h-4 w-4" /> Fiche
                    </Link>
                    <Link
                      href={`/reparation/${row.id}/recu`}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50 hover:border-emerald-300"
                      title="Imprimer le recu"
                    >
                      <PrinterIcon className="h-4 w-4" /> Recu
                    </Link>
                    <Link
                      href={`/nouvelle-reparation?edit=${row.id}`}
                      className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-sm transition hover:bg-amber-50 hover:border-amber-400"
                      title="Modifier"
                    >
                      <PencilSquareIcon className="h-4 w-4" /> Modifier
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(row.id)}
                      disabled={deletingId === row.id}
                      className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-50 hover:border-red-400 disabled:opacity-60"
                      title="Supprimer"
                    >
                      <TrashIcon className="h-4 w-4" />
                      {deletingId === row.id ? "Suppression..." : "Supprimer"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredRows.length ? (
              <tr>
                <td className="px-3 py-8 text-center text-zinc-500" colSpan={10}>
                  Aucune réparation trouvée.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
