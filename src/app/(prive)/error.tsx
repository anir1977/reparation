'use client';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4 p-6">
        <div className="text-6xl">⚠️</div>
        <h2 className="text-2xl font-bold text-zinc-900">Une erreur est survenue</h2>
        <p className="text-zinc-600 max-w-md">
          Désolé, quelque chose s'est mal passé. Essayez de rafraîchir la page.
        </p>
        <button
          onClick={reset}
          className="rounded-xl bg-amber-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-amber-700 active:scale-95 transition-all"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
