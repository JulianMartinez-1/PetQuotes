"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAppointment, listAppointmentsByPet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthGuard } from "@/components/auth/auth-guard";

const SLOT_OPTIONS = ["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"];

export default function BookingsPage() {
  const queryClient = useQueryClient();
  const tomorrow = useMemo(() => {
    const date = new Date(Date.now() + 86_400_000);
    return date.toISOString().slice(0, 10);
  }, []);

  const [form, setForm] = useState({
    clientId: "client-demo-1",
    petId: "pet-demo-1",
    veterinarianId: "vet-demo-1",
    serviceId: "service-consulta",
    branchId: "branch-norte",
    startsAtDate: tomorrow,
    startsAtTime: SLOT_OPTIONS[1],
    notes: "Control anual"
  });

  const historyQuery = useQuery({
    queryKey: ["appointments-history", form.petId],
    queryFn: () => listAppointmentsByPet(form.petId),
    enabled: Boolean(form.petId)
  });

  const mutation = useMutation({
    mutationFn: () => {
      const appointmentIso = `${form.startsAtDate}T${form.startsAtTime}:00.000Z`;
      return createAppointment({
        clientId: form.clientId,
        petId: form.petId,
        veterinarianId: form.veterinarianId,
        serviceId: form.serviceId,
        branchId: form.branchId,
        startsAt: new Date(appointmentIso).toISOString(),
        notes: form.notes
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["appointments-history", form.petId] });
    }
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await mutation.mutateAsync();
  };

  return (
    <AuthGuard>
      <main className="page-container py-4">
        <h1 className="text-3xl font-extrabold text-navy">Reservar cita</h1>
        <p className="mt-2 text-soft">Selecciona fecha y horario, confirma y revisa el historial de tu mascota.</p>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-3 md:grid-cols-2">
                <Input placeholder="ID Cliente" value={form.clientId} onChange={(e) => setForm((s) => ({ ...s, clientId: e.target.value }))} />
                <Input placeholder="ID Mascota" value={form.petId} onChange={(e) => setForm((s) => ({ ...s, petId: e.target.value }))} />
                <Input placeholder="ID Veterinaria" value={form.veterinarianId} onChange={(e) => setForm((s) => ({ ...s, veterinarianId: e.target.value }))} />
                <Input placeholder="ID Servicio" value={form.serviceId} onChange={(e) => setForm((s) => ({ ...s, serviceId: e.target.value }))} />
                <Input placeholder="ID Sucursal" value={form.branchId} onChange={(e) => setForm((s) => ({ ...s, branchId: e.target.value }))} />
                <Input type="date" value={form.startsAtDate} onChange={(e) => setForm((s) => ({ ...s, startsAtDate: e.target.value }))} />
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-navy">Horarios disponibles</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {SLOT_OPTIONS.map((slot) => {
                    const active = form.startsAtTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        className={`rounded-lg border px-2 py-2 text-sm font-semibold transition ${
                          active ? "border-brand bg-sky text-navy" : "border-line bg-white text-soft hover:text-navy"
                        }`}
                        onClick={() => setForm((s) => ({ ...s, startsAtTime: slot }))}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Input placeholder="Notas" value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} />
              <Button disabled={mutation.isPending}>{mutation.isPending ? "Reservando..." : "Confirmar reserva"}</Button>
            </form>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-navy">Resumen de reserva</h2>
            <div className="mt-3 grid gap-2 text-sm text-soft">
              <p><span className="font-semibold text-navy">Mascota:</span> {form.petId}</p>
              <p><span className="font-semibold text-navy">Veterinaria:</span> {form.veterinarianId}</p>
              <p><span className="font-semibold text-navy">Servicio:</span> {form.serviceId}</p>
              <p><span className="font-semibold text-navy">Fecha:</span> {form.startsAtDate}</p>
              <p><span className="font-semibold text-navy">Hora:</span> {form.startsAtTime}</p>
            </div>

            {mutation.isSuccess && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3">
                <p className="text-sm font-semibold text-green-700">Reserva creada correctamente.</p>
              </div>
            )}

            {mutation.isError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{(mutation.error as Error).message}</p>
              </div>
            )}
          </Card>
        </section>

        <section className="mt-6">
          <Card>
            <h2 className="text-lg font-bold text-navy">Historial de citas</h2>
            <p className="mt-1 text-sm text-soft">Vista rápida por ID de mascota: {form.petId}</p>

            {historyQuery.isLoading && <p className="mt-3 text-sm text-soft">Cargando historial...</p>}

            {historyQuery.isError && (
              <p className="mt-3 text-sm text-red-600">No se pudo cargar el historial: {(historyQuery.error as Error).message}</p>
            )}

            {historyQuery.isSuccess && historyQuery.data.length === 0 && (
              <p className="mt-3 text-sm text-soft">Aún no hay citas para esta mascota.</p>
            )}

            {historyQuery.isSuccess && historyQuery.data.length > 0 && (
              <div className="mt-4 grid gap-3">
                {historyQuery.data.map((appointment) => (
                  <div key={appointment.id} className="rounded-xl border border-line bg-white p-3">
                    <p className="text-sm font-semibold text-navy">{appointment.id}</p>
                    <p className="text-sm text-soft">{new Date(appointment.startsAt).toLocaleString("es-CO")}</p>
                    <p className="text-xs text-soft">Estado: {appointment.status ?? "PENDING"}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      </main>
    </AuthGuard>
  );
}
