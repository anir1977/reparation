"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { StatutReparation } from "@/lib/types";
import { markAsDeliveredAction } from "@/app/actions/reparations";

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

function getStatutBadgeClasses(statut: StatutReparation) {
  switch (statut) {
    case "en cours":
      return "border-orange-300 bg-orange-100 text-orange-800";
    case "prêt":
      return "border-blue-300 bg-blue-100 text-blue-800";
    case "livré":
      return "border-green-400 bg-green-100 text-green-800";
    default:
      return "border-zinc-300 bg-zinc-100 text-zinc-800";
  }
}

import { EyeIcon, PencilSquareIcon, PrinterIcon, TrashIcon, PhoneIcon, WrenchScrewdriverIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export function ReparationsTable({ rows, title }: { rows: Row[]; title: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deliveringId, setDeliveringId] = useState<string | null>(null);

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

  const handleMarkAsDelivered = async (id: string) => {
    if (!confirm("Marquer cette réparation comme livrée ?")) {
      return;
    }
    setDeliveringId(id);
    try {
      const formData = new FormData();
      formData.append("id", id);
      await markAsDeliveredAction(formData);
      router.refresh();
    } finally {
      setDeliveringId(null);
    }
  };

  return (
    <section className="rounded-2xl border-2 border-amber-100/50 bg-white p-4 md:p-6 shadow-lg">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-zinc-900">{title}</h2>
        <div className="w-full md:max-w-xs">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="🔍 Rechercher un client..."
            className="w-full rounded-xl border-2 border-amber-200 bg-amber-50/30 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-amber-400 focus:bg-white focus:shadow-md"
          />
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredRows.length ? (
          filteredRows.map((row) => (
            <article
              key={row.id}
              className="rounded-2xl border-2 border-amber-100/50 bg-gradient-to-br from-white via-amber-50/10 to-white p-4 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-zinc-900 text-lg truncate">{row.client_nom}</h3>
                  {row.client_telephone && (
                    <a 
                      href={`tel:${row.client_telephone}`}
                      className="flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-900 mt-1.5 font-semibold"
                    >
                      <PhoneIcon className="h-4 w-4" />
                      {row.client_telephone}
                    </a>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {row.urgent && (
                    <span className="rounded-full border-2 border-red-300 bg-red-100 px-2.5 py-1 text-[10px] font-black text-red-700 uppercase tracking-wide shadow-sm">
                      Urgent
                    </span>
                  )}
                  <span className={`rounded-full border-2 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide shadow-sm ${getStatutBadgeClasses(row.statut)}`}>
                    {row.statut}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-700 bg-zinc-50 rounded-lg px-2.5 py-2">
                  <WrenchScrewdriverIcon className="h-4 w-4 text-amber-600" />
                  <span className="font-bold">{row.atelier}</span>
                </div>
                <div className="flex items-center justify-between bg-zinc-50 rounded-lg px-2.5 py-2">
                  <span className="text-zinc-600 font-semibold">Bijoux:</span>
                  <span className="font-black text-zinc-900">{row.bijoux_count ?? 0}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-zinc-600 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-3 border border-amber-100">
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold mb-0.5">Réception</div>
                  <div className="font-bold text-zinc-900">{formatDate(row.date_reception_client)}</div>
                </div>
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold mb-0.5">Retour</div>
                  <div className="font-bold text-zinc-900">{formatDate(row.date_retour_atelier)}</div>
                </div>
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold mb-0.5">Livraison</div>
                  <div className="font-bold text-zinc-900">{formatDate(row.date_livraison_client)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-amber-100">
                <span className="text-xs text-zinc-600 font-bold uppercase tracking-wide">Prix</span>
                <span className="font-black text-amber-900 text-lg">{formatPrix(row.prix_reparation)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/reparation/${row.id}`}
                  className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-zinc-200 bg-white px-3 py-2.5 text-xs font-bold text-zinc-700 shadow-sm transition-all active:scale-95 hover:shadow-md"
                >
                  <EyeIcon className="h-4 w-4" /> Fiche
                </Link>
                <Link
                  href={`/reparation/${row.id}/recu`}
                  className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700 shadow-sm transition-all active:scale-95 hover:shadow-md"
                >
                  <PrinterIcon className="h-4 w-4" /> Reçu
                </Link>
                {row.statut === "prêt" && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsDelivered(row.id)}
                    disabled={deliveringId === row.id}
                    className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-green-200 bg-green-50 px-3 py-2.5 text-xs font-bold text-green-700 shadow-sm transition-all active:scale-95 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    {deliveringId === row.id ? "..." : "Livré"}
                  </button>
                )}
                <Link
                  href={`/nouvelle-reparation?edit=${row.id}`}
                  className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-800 shadow-sm transition-all active:scale-95 hover:shadow-md"
                >
                  <PencilSquareIcon className="h-4 w-4" /> Modifier
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(row.id)}
                  disabled={deletingId === row.id}
                  className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-700 shadow-sm transition-all active:scale-95 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrashIcon className="h-4 w-4" />
                  {deletingId === row.id ? "..." : "Suppr."}
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-12 text-center">
            <p className="text-zinc-500 font-bold text-base">Aucune réparation trouvée</p>
            <p className="text-sm text-zinc-400 mt-1">Essayez une autre recherche</p>
          </div>
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
                <td className="px-3 py-3 font-semibold text-amber-900">{formatPrix(row.prix_reparation)}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-full border px-2 py-1 text-xs font-bold shadow-sm ${getStatutBadgeClasses(row.statut)}`}>
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
                    {row.statut === "prêt" && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsDelivered(row.id)}
                        disabled={deliveringId === row.id}
                        className="inline-flex items-center gap-1 rounded-full border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-800 shadow-sm transition hover:bg-green-100 hover:border-green-400 disabled:opacity-60"
                        title="Marquer comme livré"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        {deliveringId === row.id ? "..." : "Livré"}
                      </button>
                    )}
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
