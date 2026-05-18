"use client";

import { Button } from "@/components/ui/button";

export default function BookingsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="page-container py-6">
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-2xl font-bold text-red-800">No pudimos cargar el modulo de reservas</h1>
        <p className="mt-2 text-sm text-red-700">
          Ocurrio un error inesperado al cargar esta seccion. Puedes reintentar sin perder tu sesion.
        </p>
        <p className="mt-3 rounded-lg bg-white px-3 py-2 text-xs text-red-700">Detalle: {error.message}</p>
        <div className="mt-4">
          <Button onClick={reset}>Reintentar</Button>
        </div>
      </section>
    </main>
  );
}
