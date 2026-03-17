export default function GlobalLoading() {
  return (
    <main className="page-container py-10" aria-live="polite" aria-busy="true">
      <section className="surface p-6">
        <p className="text-sm font-semibold text-navy">Cargando experiencia...</p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded bg-[#e5edf7]">
          <div className="h-full w-1/3 animate-pulse rounded bg-brand" />
        </div>
      </section>
    </main>
  );
}
