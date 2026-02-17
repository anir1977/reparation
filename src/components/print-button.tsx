"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md border border-zinc-200 px-3 py-1 text-sm font-medium"
    >
      Imprimer
    </button>
  );
}
