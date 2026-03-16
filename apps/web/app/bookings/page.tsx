"use client";

import { useMutation } from "@tanstack/react-query";
import { createAppointment } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";

export default function BookingsPage() {
  const [form, setForm] = useState({
    clientId: "client-demo-1",
    petId: "pet-demo-1",
    veterinarianId: "vet-demo-1",
    serviceId: "service-consulta",
    branchId: "branch-norte",
    startsAt: new Date(Date.now() + 86_400_000).toISOString().slice(0, 16),
    notes: "Control anual"
  });

  const mutation = useMutation({
    mutationFn: () =>
      createAppointment({
        ...form,
        startsAt: new Date(form.startsAt).toISOString()
      })
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await mutation.mutateAsync();
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-extrabold text-navy">Reservar cita</h1>
      <p className="mt-2 text-soft">Ejemplo funcional conectado al API Gateway.</p>

      <Card className="mt-6">
        <form className="grid gap-4" onSubmit={onSubmit}>
          <Input placeholder="ID Cliente" value={form.clientId} onChange={(e) => setForm((s) => ({ ...s, clientId: e.target.value }))} />
          <Input placeholder="ID Mascota" value={form.petId} onChange={(e) => setForm((s) => ({ ...s, petId: e.target.value }))} />
          <Input placeholder="ID Veterinaria" value={form.veterinarianId} onChange={(e) => setForm((s) => ({ ...s, veterinarianId: e.target.value }))} />
          <Input placeholder="ID Servicio" value={form.serviceId} onChange={(e) => setForm((s) => ({ ...s, serviceId: e.target.value }))} />
          <Input placeholder="ID Sucursal" value={form.branchId} onChange={(e) => setForm((s) => ({ ...s, branchId: e.target.value }))} />
          <Input type="datetime-local" value={form.startsAt} onChange={(e) => setForm((s) => ({ ...s, startsAt: e.target.value }))} />
          <Input placeholder="Notas" value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} />
          <Button disabled={mutation.isPending}>{mutation.isPending ? "Reservando..." : "Confirmar reserva"}</Button>
        </form>
      </Card>

      {mutation.isSuccess && (
        <Card className="mt-4 border-green-200">
          <h2 className="font-bold text-navy">Cita creada correctamente</h2>
          <pre className="mt-2 overflow-auto text-xs text-soft">{JSON.stringify(mutation.data, null, 2)}</pre>
        </Card>
      )}

      {mutation.isError && (
        <Card className="mt-4 border-red-200">
          <p className="text-sm text-red-600">{(mutation.error as Error).message}</p>
        </Card>
      )}
    </main>
  );
}
