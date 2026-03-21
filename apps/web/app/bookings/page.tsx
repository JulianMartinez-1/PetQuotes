"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, ClipboardCheck, Timer } from "lucide-react";
import { createAppointment, listAppointmentsByPet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthGuard } from "@/components/auth/auth-guard";
import { addActivityEvent } from "@/lib/activity-log";
import { useAuthState } from "@/store/auth-state";
import { BOOKING_BRANCHES, BOOKING_SERVICES, BOOKING_VETS, listPetsByOwner } from "@/lib/booking-options";

const SLOT_OPTIONS = ["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"];

export default function BookingsPage() {
  const { user } = useAuthState();
  const queryClient = useQueryClient();
  const tomorrow = useMemo(() => {
    const date = new Date(Date.now() + 86_400_000);
    return date.toISOString().slice(0, 10);
  }, []);

  const availablePets = useMemo(() => listPetsByOwner(user?.id), [user?.id]);
  const defaultPetId = availablePets[0]?.id ?? "";

  const [form, setForm] = useState({
    clientId: "",
    petId: "",
    veterinarianId: BOOKING_VETS[0]?.id ?? "",
    serviceId: BOOKING_SERVICES[0]?.id ?? "",
    branchId: BOOKING_BRANCHES[0]?.id ?? "",
    startsAtDate: tomorrow,
    startsAtTime: SLOT_OPTIONS[1],
    notes: "Control anual"
  });

  useEffect(() => {
    setForm((state) => {
      const nextClientId = user?.id ?? "";
      const petStillAvailable = availablePets.some((pet) => pet.id === state.petId);
      const nextPetId = petStillAvailable ? state.petId : defaultPetId;

      if (state.clientId === nextClientId && state.petId === nextPetId) {
        return state;
      }

      return {
        ...state,
        clientId: nextClientId,
        petId: nextPetId
      };
    });
  }, [availablePets, defaultPetId, user?.id]);

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
      addActivityEvent({
        type: "booking-created",
        title: "Reserva creada",
        description: `Nueva cita para ${form.petId} el ${form.startsAtDate} a las ${form.startsAtTime}.`
      });
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
        <section className="surface p-6 md:p-7">
          <h1 className="text-3xl font-extrabold text-navy md:text-4xl">Reservar cita</h1>
          <p className="mt-2 text-soft">Elige fecha y horario, confirma en un clic y sigue todo el historial de tu mascota.</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-white px-4 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-navy"><CalendarClock className="h-4 w-4 text-brand" />Fecha elegida</p>
              <p className="mt-1 text-sm text-soft">{form.startsAtDate}</p>
            </div>
            <div className="rounded-xl border border-line bg-white px-4 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-navy"><Timer className="h-4 w-4 text-brand" />Horario</p>
              <p className="mt-1 text-sm text-soft">{form.startsAtTime}</p>
            </div>
            <div className="rounded-xl border border-line bg-white px-4 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-navy"><ClipboardCheck className="h-4 w-4 text-brand" />Estado</p>
              <p className="mt-1 text-sm text-soft">{mutation.isPending ? "Procesando reserva" : "Lista para confirmar"}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <h2 className="text-lg font-bold text-navy">Datos de la reserva</h2>
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-3 md:grid-cols-2">
                <Input placeholder="ID de cliente" value={form.clientId} readOnly />
                <label className="grid gap-1 text-sm text-soft">
                  Mascota
                  <select
                    className="h-10 rounded-md border border-line bg-white px-3 text-sm text-navy"
                    value={form.petId}
                    onChange={(e) => setForm((s) => ({ ...s, petId: e.target.value }))}
                    required
                  >
                    <option value="" disabled>
                      Selecciona una mascota
                    </option>
                    {availablePets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name} ({pet.species})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm text-soft">
                  Veterinario
                  <select
                    className="h-10 rounded-md border border-line bg-white px-3 text-sm text-navy"
                    value={form.veterinarianId}
                    onChange={(e) => setForm((s) => ({ ...s, veterinarianId: e.target.value }))}
                    required
                  >
                    {BOOKING_VETS.map((vet) => (
                      <option key={vet.id} value={vet.id}>
                        {vet.name} ({vet.specialty})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm text-soft">
                  Servicio
                  <select
                    className="h-10 rounded-md border border-line bg-white px-3 text-sm text-navy"
                    value={form.serviceId}
                    onChange={(e) => setForm((s) => ({ ...s, serviceId: e.target.value }))}
                    required
                  >
                    {BOOKING_SERVICES.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm text-soft">
                  Sede
                  <select
                    className="h-10 rounded-md border border-line bg-white px-3 text-sm text-navy"
                    value={form.branchId}
                    onChange={(e) => setForm((s) => ({ ...s, branchId: e.target.value }))}
                    required
                  >
                    {BOOKING_BRANCHES.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.label}
                      </option>
                    ))}
                  </select>
                </label>
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

              <Input placeholder="Notas para la clinica (opcional)" value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} />
              <Button disabled={mutation.isPending}>{mutation.isPending ? "Confirmando reserva..." : "Confirmar cita"}</Button>
            </form>

            {availablePets.length === 0 && (
              <p className="text-sm text-red-600">No hay mascotas asociadas a tu usuario. Contacta al administrador para registrar una mascota.</p>
            )}
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
                <p className="text-sm font-semibold text-green-700">Reserva confirmada con exito.</p>
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
            <p className="mt-1 text-sm text-soft">Consulta rapida por ID de mascota: {form.petId}</p>

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
