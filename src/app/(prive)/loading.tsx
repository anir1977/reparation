export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-600"></div>
        <p className="text-sm font-medium text-zinc-600">Chargement...</p>
      </div>
    </div>
  );
}
