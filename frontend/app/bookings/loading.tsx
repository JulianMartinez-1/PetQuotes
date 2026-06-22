export default function BookingsLoading() {
  return (
    <main className="page-container py-6">
      <section className="animate-pulse rounded-2xl border border-border bg-surface p-6">
        <div className="h-8 w-56 rounded bg-surface-2" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-surface-light" />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="h-20 rounded-xl bg-surface-light" />
          <div className="h-20 rounded-xl bg-surface-light" />
          <div className="h-20 rounded-xl bg-surface-light" />
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="animate-pulse rounded-2xl border border-border bg-surface p-6">
          <div className="h-6 w-48 rounded bg-surface-2" />
          <div className="mt-4 space-y-3">
            <div className="h-10 rounded bg-surface-light" />
            <div className="h-10 rounded bg-surface-light" />
            <div className="h-10 rounded bg-surface-light" />
            <div className="h-10 rounded bg-surface-light" />
          </div>
        </div>

        <div className="animate-pulse rounded-2xl border border-border bg-surface p-6">
          <div className="h-6 w-36 rounded bg-surface-2" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full rounded bg-surface-light" />
            <div className="h-4 w-10/12 rounded bg-surface-light" />
            <div className="h-4 w-8/12 rounded bg-surface-light" />
          </div>
        </div>
      </section>
    </main>
  );
}
