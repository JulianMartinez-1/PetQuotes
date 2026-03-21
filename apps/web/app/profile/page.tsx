"use client";

import { useEffect, useState } from "react";
import { BellRing, CircleUserRound, ShieldCheck } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/store/auth-state";
import { addActivityEvent } from "@/lib/activity-log";
import { getUserProfileSettings, saveUserProfileSettings } from "@/lib/user-profile";

export default function ProfilePage() {
  const { user } = useAuthState();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Bogota");
  const [emailReminders, setEmailReminders] = useState(true);
  const [whatsappReminders, setWhatsappReminders] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [reminderHoursBefore, setReminderHoursBefore] = useState<2 | 6 | 12 | 24>(12);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const defaults = getUserProfileSettings(user.id, user.email.split("@")[0]);
    setDisplayName(defaults.displayName);
    setPhone(defaults.phone);
    setCity(defaults.city);
    setEmailReminders(defaults.preferences.emailReminders);
    setWhatsappReminders(defaults.preferences.whatsappReminders);
    setMarketingEmails(defaults.preferences.marketingEmails);
    setReminderHoursBefore(defaults.preferences.reminderHoursBefore);
    setSavedAt(defaults.updatedAt !== new Date(0).toISOString() ? defaults.updatedAt : null);
  }, [user]);

  if (!user) return null;

  const onSaveProfile = () => {
    const payload = {
      displayName,
      phone,
      city,
      preferences: {
        emailReminders,
        whatsappReminders,
        marketingEmails,
        reminderHoursBefore
      },
      updatedAt: new Date().toISOString()
    };

    saveUserProfileSettings(user.id, payload);
    setSavedAt(payload.updatedAt);

    addActivityEvent({
      type: "profile-updated",
      title: "Perfil actualizado",
      description: `Actualizaste tu perfil y preferencias de notificación (${payload.city}).`
    });
  };

  return (
    <AuthGuard>
      <main className="page-container py-4">
        <section className="surface p-6 md:p-7">
          <h1 className="text-3xl font-extrabold text-navy md:text-4xl">Mi perfil</h1>
          <p className="mt-2 text-soft">Mantén tus datos al dia y personaliza como quieres recibir cada aviso.</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-white px-4 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-navy"><CircleUserRound className="h-4 w-4 text-brand" />Cuenta</p>
              <p className="mt-1 text-sm text-soft">{displayName || user.email.split("@")[0]}</p>
            </div>
            <div className="rounded-xl border border-line bg-white px-4 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-navy"><BellRing className="h-4 w-4 text-brand" />Recordatorios</p>
              <p className="mt-1 text-sm text-soft">{emailReminders || whatsappReminders ? "Activos" : "Desactivados"}</p>
            </div>
            <div className="rounded-xl border border-line bg-white px-4 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-navy"><ShieldCheck className="h-4 w-4 text-brand" />Última actualización</p>
              <p className="mt-1 text-sm text-soft">{savedAt ? new Date(savedAt).toLocaleDateString("es-CO") : "Sin cambios"}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="text-lg font-bold text-navy">Perfil editable</h2>
            <div className="mt-4 grid gap-3">
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nombre para mostrar" />
              <Input value={user.email} disabled placeholder="Correo de acceso" />
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefono de contacto" />
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ciudad principal" />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-navy">Preferencias de notificaciones</h2>
            <div className="mt-4 grid gap-3 text-sm text-soft">
              <label className="flex items-center gap-2"><input type="checkbox" checked={emailReminders} onChange={(e) => setEmailReminders(e.target.checked)} />Recordatorios por correo</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={whatsappReminders} onChange={(e) => setWhatsappReminders(e.target.checked)} />Recordatorios por WhatsApp</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={marketingEmails} onChange={(e) => setMarketingEmails(e.target.checked)} />Novedades y promociones</label>

              <label className="grid gap-1">
                <span className="font-semibold text-navy">Anticipación del recordatorio</span>
                <select className="h-11 rounded-xl border border-line bg-white px-3" value={reminderHoursBefore} onChange={(e) => setReminderHoursBefore(Number(e.target.value) as 2 | 6 | 12 | 24)}>
                  <option value={2}>2 horas antes</option>
                  <option value={6}>6 horas antes</option>
                  <option value={12}>12 horas antes</option>
                  <option value={24}>24 horas antes</option>
                </select>
              </label>
            </div>
          </Card>
        </section>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button onClick={onSaveProfile}>Guardar preferencias</Button>
          {savedAt && <p className="text-sm text-soft">Última actualización: {new Date(savedAt).toLocaleString("es-CO")}</p>}
        </div>
      </main>
    </AuthGuard>
  );
}
