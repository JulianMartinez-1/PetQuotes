import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CLINIC_CATALOG } from "@/lib/clinic-catalog";

type ClinicDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClinicDetailPage({ params }: ClinicDetailPageProps) {
  const { id } = await params;
  const clinic = CLINIC_CATALOG.find((item) => item.id === id);
  if (!clinic) {
    notFound();
  }

  return (
    <main className="page-container py-4">
      <Card className="overflow-hidden p-0">
        <Image src={clinic.image} alt={clinic.name} width={1400} height={800} className="h-64 w-full object-cover" />
        <div className="p-6">
          <p className="text-sm font-semibold text-brand">{clinic.city} · {clinic.neighborhood}</p>
          <h1 className="mt-1 text-3xl font-extrabold text-navy">{clinic.name}</h1>
          <p className="mt-3 max-w-3xl text-soft">{clinic.description} Agenda con informacion clara, tiempos visibles y confirmacion inmediata.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-sky/40 p-3">
              <p className="text-xs font-semibold text-soft">Rating</p>
              <p className="text-lg font-bold text-navy">{clinic.rating}</p>
            </div>
            <div className="rounded-xl border border-line bg-sky/40 p-3">
              <p className="text-xs font-semibold text-soft">Distancia</p>
              <p className="text-lg font-bold text-navy">{clinic.distanceKm.toFixed(1)} km</p>
            </div>
            <div className="rounded-xl border border-line bg-sky/40 p-3">
              <p className="text-xs font-semibold text-soft">Estado</p>
              <p className="text-lg font-bold text-navy">{clinic.openNow ? "Abierta ahora" : "Cerrada ahora"}</p>
            </div>
          </div>

          <h2 className="mt-6 text-lg font-bold text-navy">Servicios disponibles</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {clinic.services.map((service) => (
              <span key={service} className="rounded-full bg-sky px-3 py-1 text-sm font-semibold text-navy">
                {service}
              </span>
            ))}
          </div>

          <div className="mt-6 flex gap-2">
            <Link href="/bookings">
              <Button>Reservar en esta clinica</Button>
            </Link>
            <Link href="/clinics">
              <Button variant="ghost">Volver al catalogo</Button>
            </Link>
          </div>
        </div>
      </Card>
    </main>
  );
}
