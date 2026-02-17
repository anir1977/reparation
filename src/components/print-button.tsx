"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium hover:bg-zinc-50 active:bg-zinc-100 transition"
    >
      🖨️ Imprimer
    </button>
  );
}
