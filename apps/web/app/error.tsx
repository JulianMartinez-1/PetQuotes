"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Global app error", error);
  }, [error]);

  return (
    <main className="page-container py-10">
      <section className="surface p-6">
        <h1 className="text-2xl font-extrabold text-navy">Tuvimos un problema inesperado</h1>
        <p className="mt-2 text-sm text-soft">Recarga esta seccion para continuar. Si el error persiste, contacta al equipo de soporte.</p>
        <pre className="mt-4 overflow-auto rounded-lg bg-[#f2f6fb] p-3 text-xs text-soft">{error.message}</pre>
        <div className="mt-4">
          <Button type="button" onClick={reset}>Volver a intentar</Button>
        </div>
      </section>
    </main>
  );
}
