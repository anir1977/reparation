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

import { EyeIcon, PencilSquareIcon, PrinterIcon, TrashIcon, PhoneIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

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
    <section className="rounded-2xl border border-amber-100 bg-white p-3 sm:p-5 shadow-lg">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg sm:text-xl font-bold text-amber-900">{title}</h2>
        <div className="w-full sm:max-w-xs">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Recherche client..."
            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm outline-none transition focus:border-amber-400"
          />
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredRows.length ? (
          filteredRows.map((row) => (
            <article
              key={row.id}
              className="rounded-xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/30 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-zinc-900 text-base truncate">{row.client_nom}</h3>
                  {row.client_telephone && (
                    <a 
                      href={`tel:${row.client_telephone}`}
                      className="flex items-center gap-1 text-sm text-amber-700 hover:text-amber-900 mt-1"
                    >
                      <PhoneIcon className="h-3.5 w-3.5" />
                      {row.client_telephone}
                    </a>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {row.urgent && (
                    <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                      URGENT
                    </span>
                  )}
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    {row.statut}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-xs">
                <div className="flex items-center gap-1 text-zinc-600">
                  <WrenchScrewdriverIcon className="h-3.5 w-3.5 text-amber-600" />
                  <span className="font-medium">{row.atelier}</span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-500">Bijoux: </span>
                  <span className="font-semibold text-zinc-900">{row.bijoux_count ?? 0}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3 text-xs text-zinc-600 bg-amber-50/50 rounded-lg p-2">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Réception</div>
                  <div className="font-medium">{formatDate(row.date_reception_client)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Retour</div>
                  <div className="font-medium">{formatDate(row.date_retour_atelier)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Livraison</div>
                  <div className="font-medium">{formatDate(row.date_livraison_client)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3 pb-3 border-b border-amber-100">
                <span className="text-xs text-zinc-500">Prix de réparation</span>
                <span className="font-bold text-amber-900 text-base">{formatPrix(row.prix_reparation)} DH</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/reparation/${row.id}`}
                  className="flex items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition active:bg-zinc-50"
                >
                  <EyeIcon className="h-3.5 w-3.5" /> Fiche
                </Link>
                <Link
                  href={`/reparation/${row.id}/recu`}
                  className="flex items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm transition active:bg-emerald-50"
                >
                  <PrinterIcon className="h-3.5 w-3.5" /> Reçu
                </Link>
                <Link
                  href={`/nouvelle-reparation?edit=${row.id}`}
                  className="flex items-center justify-center gap-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-800 shadow-sm transition active:bg-amber-50"
                >
                  <PencilSquareIcon className="h-3.5 w-3.5" /> Modifier
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(row.id)}
                  disabled={deletingId === row.id}
                  className="flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 shadow-sm transition active:bg-red-50 disabled:opacity-60"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  {deletingId === row.id ? "..." : "Suppr."}
                </button>
              </div>
            </article>
          ))
        ) : (
          <p className="text-center py-8 text-zinc-500 text-sm">Aucune réparation trouvée.</p>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
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
