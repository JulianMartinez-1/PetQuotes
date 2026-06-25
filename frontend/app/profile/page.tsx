"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Shield,
  Save,
  CheckCircle,
  Navigation,
  ChevronRight,
  Lock,
  PawPrint,
  AlertCircle,
  Stethoscope,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPets } from "@/components/pets";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/store/auth-state";
import { addActivityEvent } from "@/lib/activity-log";
import {
  getUserProfileSettings,
  saveUserProfileSettings,
} from "@/lib/user-profile";
import { cn } from "@/lib/utils";

/* ── Toggle switch ─────────────────────────────────────────── */
function Toggle({
  checked,
  onChange,
  color = "primary",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  color?: "primary" | "success" | "accent";
}) {
  const track = {
    primary: checked ? "bg-primary-600" : "bg-border",
    success: checked ? "bg-success" : "bg-border",
    accent: checked ? "bg-accent-500" : "bg-border",
  }[color];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        track
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 mt-0.5",
          checked ? "translate-x-5 ml-0.5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

/* ── Avatar initials ────────────────────────────────────────── */
function Avatar({ name, size = "lg" }: { name: string; size?: "sm" | "lg" }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const dim = size === "lg" ? "w-20 h-20 text-2xl" : "w-10 h-10 text-sm";

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center font-bold text-white shrink-0 shadow-lg",
        dim
      )}
    >
      {initials || <User size={size === "lg" ? 28 : 16} />}
    </div>
  );
}

/* ── Section card wrapper ───────────────────────────────────── */
function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-surface rounded-2xl border border-border shadow-sm p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ── Field label ────────────────────────────────────────────── */
function FieldLabel({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-1.5 text-sm font-medium text-text-secondary mb-1.5">
      <Icon size={14} className="text-text-muted" />
      {children}
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════ */
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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [locatingCity, setLocatingCity] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Notification channel (persisted in DB)
  const [notificationChannel, setNotificationChannel] = useState<"EMAIL" | null>(null);
  const [channelSaving, setChannelSaving] = useState(false);
  const [channelSaved, setChannelSaved] = useState(false);
  const [channelError, setChannelError] = useState<string | null>(null);
  const notifSectionRef = useRef<HTMLDivElement>(null);

  const [isNotifyRedirect, setIsNotifyRedirect] = useState(false);
  const [clinicName, setClinicName] = useState<string | null>(null);
  const router = useRouter();

  // Load localStorage settings and DB profile
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
    setSavedAt(
      defaults.updatedAt !== new Date(0).toISOString() ? defaults.updatedAt : null
    );

    // Fetch notification channel from DB
    fetch("/api/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.notificationChannel === "EMAIL") setNotificationChannel("EMAIL");
      })
      .catch(() => null);

    // Fetch clinic name if user is a vet
    if (user.role === "VETERINARY") {
      fetch("/api/proxy/veterinary/my-profile")
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data?.clinic?.name) setClinicName(data.clinic.name);
        })
        .catch(() => null);
    }
  }, [user]);

  // Detect ?notify=1 redirect from booking wizard
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("notify") === "1") {
      setIsNotifyRedirect(true);
      setTimeout(() => {
        notifSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    }
  }, []);

  if (!user) {
    return (
      <AuthGuard>
        <div className="bg-background min-h-screen animate-pulse">
          <div className="bg-surface border-b border-border">
            <div className="page-container py-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-border shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-border rounded w-48" />
                  <div className="h-4 bg-border-light rounded w-64" />
                </div>
              </div>
            </div>
          </div>
          <div className="page-container py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="bg-surface rounded-2xl border border-border h-40" />
                <div className="bg-surface rounded-2xl border border-border h-24" />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-surface rounded-2xl border border-border h-64" />
                <div className="bg-surface rounded-2xl border border-border h-48" />
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const detectCityFromCoordinates = (lat: number, lng: number): string => {
    const cities = [
      { name: "Bogota", lat: 4.711, lng: -74.0721, radius: 0.5 },
      { name: "Medellin", lat: 6.2442, lng: -75.5812, radius: 0.5 },
      { name: "Cali", lat: 3.4372, lng: -76.5197, radius: 0.5 },
    ];
    for (const c of cities) {
      const d = Math.sqrt(Math.pow(lat - c.lat, 2) + Math.pow(lng - c.lng, 2));
      if (d < c.radius) return c.name;
    }
    return "Bogota";
  };

  const enableGeolocation = async () => {
    setLocatingCity(true);
    setLocationError(null);
    if (!("geolocation" in navigator)) {
      setLocationError("Geolocalización no soportada en tu navegador");
      setLocatingCity(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detected = detectCityFromCoordinates(pos.coords.latitude, pos.coords.longitude);
        setCity(detected);
        setLocatingCity(false);
        addActivityEvent({ type: "preferences-updated", title: "Ubicación detectada", description: `Ciudad detectada: ${detected}` });
      },
      () => {
        setLocationError("No se pudo acceder a tu ubicación.");
        setLocatingCity(false);
      }
    );
  };

  const goToClinicsInCity = () => router.push(`/clinics?city=${city}`);

  const onSaveProfile = () => {
    const payload = {
      displayName,
      phone,
      city,
      preferences: { emailReminders, whatsappReminders, marketingEmails, reminderHoursBefore },
      updatedAt: new Date().toISOString(),
    };
    saveUserProfileSettings(user.id, payload);
    setSavedAt(payload.updatedAt);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    addActivityEvent({ type: "profile-updated", title: "Perfil actualizado", description: `Perfil actualizado (${payload.city}).` });
  };

  const saveNotificationChannel = async (channel: "EMAIL" | null) => {
    setChannelSaving(true);
    setChannelError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationChannel: channel }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al guardar");
      }
      setNotificationChannel(channel);
      setChannelSaved(true);
      setTimeout(() => setChannelSaved(false), 3000);
    } catch (e) {
      setChannelError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setChannelSaving(false);
    }
  };

  const cityLabel: Record<string, string> = { Bogota: "Bogotá", Medellin: "Medellín", Cali: "Cali" };

  return (
    <AuthGuard>
      <div className="bg-background min-h-screen">

        {/* ── Page header ─────────────────────────────────────── */}
        <div className="bg-surface border-b border-border">
          <div className="page-container py-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col sm:flex-row sm:items-center gap-5"
            >
              <Avatar name={displayName || user.email} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="text-2xl font-bold text-text-primary truncate">
                    {displayName || user.email.split("@")[0]}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-semibold">
                    <Shield size={11} />
                    Verificado
                  </span>
                  {clinicName && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-50 border border-secondary-200 text-secondary-700 text-xs font-semibold">
                      <Stethoscope size={11} />
                      Dueño de: {clinicName}
                    </span>
                  )}
                </div>
                <p className="text-text-secondary text-sm">{user.email}</p>
                {savedAt && (
                  <p className="text-xs text-text-muted mt-1">
                    Última actualización: {new Date(savedAt).toLocaleString("es-CO")}
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToClinicsInCity}
                  className="gap-1.5"
                >
                  <MapPin size={14} />
                  {cityLabel[city] ?? city}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onSaveProfile}
                  className="gap-1.5"
                >
                  <Save size={14} />
                  Guardar
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────── */}
        <div className="page-container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left sidebar ── */}
            <div className="space-y-4">

              {/* Quick stats */}
              <SectionCard>
                <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">Resumen</h2>
                <div className="space-y-3">
                  {[
                    { icon: User,   label: "Cuenta",         value: displayName || user.email.split("@")[0] },
                    { icon: Bell,   label: "Recordatorios",  value: emailReminders || whatsappReminders ? "Activos" : "Desactivados" },
                    { icon: MapPin, label: "Ciudad",         value: cityLabel[city] ?? city },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                      <div className="w-8 h-8 rounded-lg bg-surface-light flex items-center justify-center shrink-0">
                        <Icon size={15} className="text-text-muted" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-text-muted">{label}</p>
                        <p className="text-sm font-semibold text-text-primary truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Security info */}
              <SectionCard>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <Lock size={16} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary mb-1">Datos protegidos</p>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Tu información está encriptada y no se comparte con terceros.
                    </p>
                  </div>
                </div>
              </SectionCard>

              {/* Search clinics shortcut */}
              <button
                type="button"
                onClick={goToClinicsInCity}
                className="w-full flex items-center justify-between gap-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-2xl p-5 hover:from-primary-700 hover:to-secondary-700 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <PawPrint size={20} className="shrink-0 opacity-90" />
                  <div className="text-left">
                    <p className="font-semibold text-sm">Veterinarias en {cityLabel[city] ?? city}</p>
                    <p className="text-xs opacity-75">Ver clínicas disponibles</p>
                  </div>
                </div>
                <ChevronRight size={18} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* ── Right: forms ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Personal info */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <SectionCard>
                  <h2 className="text-base font-semibold text-text-primary mb-5 flex items-center gap-2">
                    <User size={16} className="text-primary-600" />
                    Información personal
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Display name */}
                    <div>
                      <FieldLabel icon={User}>Nombre para mostrar</FieldLabel>
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Tu nombre"
                        variant="default"
                      />
                    </div>

                    {/* Email — readonly */}
                    <div>
                      <FieldLabel icon={Mail}>Correo de acceso</FieldLabel>
                      <Input
                        value={user.email}
                        disabled
                        variant="default"
                        className="opacity-50 cursor-not-allowed"
                      />
                      <p className="mt-1 text-xs text-text-muted">No se puede cambiar aquí</p>
                    </div>

                    {/* Phone */}
                    <div>
                      <FieldLabel icon={Phone}>Teléfono</FieldLabel>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+57 301 234 5678"
                        variant="default"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <FieldLabel icon={MapPin}>Ciudad</FieldLabel>
                      <div className="flex gap-2">
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="flex-1 h-11 px-3 rounded-lg border border-border bg-surface text-text-primary text-sm outline-none focus:ring-2 focus:ring-secondary-300 focus:border-secondary-500 transition-all"
                        >
                          <option value="Bogota">Bogotá</option>
                          <option value="Medellin">Medellín</option>
                          <option value="Cali">Cali</option>
                        </select>
                        <button
                          type="button"
                          onClick={enableGeolocation}
                          disabled={locatingCity}
                          title="Detectar ubicación"
                          className="w-11 h-11 rounded-lg border border-border bg-surface hover:bg-surface-light flex items-center justify-center text-text-muted hover:text-primary-600 transition-all disabled:opacity-40"
                        >
                          <Navigation size={15} className={locatingCity ? "animate-pulse" : ""} />
                        </button>
                      </div>
                      {locationError && (
                        <p className="mt-1 text-xs text-danger">{locationError}</p>
                      )}
                    </div>
                  </div>
                </SectionCard>
              </motion.div>

              {/* Notifications */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <SectionCard>
                  <h2 className="text-base font-semibold text-text-primary mb-5 flex items-center gap-2">
                    <Bell size={16} className="text-primary-600" />
                    Notificaciones
                  </h2>

                  <div className="space-y-1">
                    {/* Email reminders */}
                    <div className="flex items-center justify-between py-3.5 border-b border-border/30">
                      <div>
                        <p className="text-sm font-medium text-text-primary">Recordatorios por correo</p>
                        <p className="text-xs text-text-muted mt-0.5">Alertas de citas próximas</p>
                      </div>
                      <Toggle checked={emailReminders} onChange={setEmailReminders} color="primary" />
                    </div>

                    {/* WhatsApp reminders */}
                    <div className="flex items-center justify-between py-3.5 border-b border-border/30">
                      <div>
                        <p className="text-sm font-medium text-text-primary">Recordatorios por WhatsApp</p>
                        <p className="text-xs text-text-muted mt-0.5">Notificaciones por mensajería</p>
                      </div>
                      <Toggle checked={whatsappReminders} onChange={setWhatsappReminders} color="success" />
                    </div>

                    {/* Marketing */}
                    <div className="flex items-center justify-between py-3.5">
                      <div>
                        <p className="text-sm font-medium text-text-primary">Novedades y promociones</p>
                        <p className="text-xs text-text-muted mt-0.5">Ofertas especiales y consejos</p>
                      </div>
                      <Toggle checked={marketingEmails} onChange={setMarketingEmails} color="accent" />
                    </div>
                  </div>

                  {/* Reminder timing — pill buttons */}
                  <div className="mt-5 pt-4 border-t border-border/30">
                    <p className="text-sm font-medium text-text-secondary mb-3">Anticipación del recordatorio</p>
                    <div className="flex flex-wrap gap-2">
                      {([2, 6, 12, 24] as const).map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setReminderHoursBefore(h)}
                          className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
                            reminderHoursBefore === h
                              ? "bg-primary-600 border-primary-600 text-white shadow-sm"
                              : "bg-surface border-border text-text-secondary hover:border-primary-300 hover:text-primary-600"
                          )}
                        >
                          {h}h antes
                        </button>
                      ))}
                    </div>
                  </div>
                </SectionCard>
              </motion.div>

              {/* ── Confirmation channel (required for booking) ── */}
              <motion.div
                ref={notifSectionRef}
                id="notificaciones"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
              >
                <SectionCard>
                  <h2 className="text-base font-semibold text-text-primary mb-1 flex items-center gap-2">
                    <Mail size={16} className="text-primary-600" />
                    Canal de confirmación de citas
                  </h2>
                  <p className="text-xs text-text-secondary mb-5">
                    Elige cómo quieres recibir la confirmación cuando el admin apruebe tu reserva.
                    Este paso es obligatorio para poder confirmar una cita.
                  </p>

                  {/* Redirect banner when coming from booking wizard */}
                  {isNotifyRedirect && (
                    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-warning/10 border border-warning/30 mb-5">
                      <AlertCircle size={16} className="text-warning shrink-0 mt-0.5" />
                      <p className="text-sm text-text-secondary">
                        Configura tu canal de confirmación y luego regresa a buscar tu veterinaria para finalizar la reserva.
                      </p>
                    </div>
                  )}

                  {/* Current status */}
                  {notificationChannel ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-success/10 border border-success/25 mb-5">
                      <CheckCircle size={16} className="text-success shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          Recibirás confirmaciones por correo
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5">{user?.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-surface-light border border-border mb-5">
                      <AlertCircle size={16} className="text-text-muted shrink-0 mt-0.5" />
                      <p className="text-sm text-text-secondary">
                        Aún no has elegido un canal. Selecciónalo abajo para poder confirmar reservas.
                      </p>
                    </div>
                  )}

                  {/* Option: Email */}
                  <button
                    type="button"
                    onClick={() => {
                      if (notificationChannel !== "EMAIL") {
                        void saveNotificationChannel("EMAIL");
                      }
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                      notificationChannel === "EMAIL"
                        ? "border-primary-500 bg-primary-50 ring-2 ring-primary-500/20"
                        : "border-border bg-surface hover:border-primary-300 hover:bg-primary-50/30"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      notificationChannel === "EMAIL" ? "bg-primary-100" : "bg-surface-light"
                    )}>
                      <Mail size={18} className={notificationChannel === "EMAIL" ? "text-primary-600" : "text-text-muted"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-semibold", notificationChannel === "EMAIL" ? "text-primary-700" : "text-text-primary")}>
                        Correo electrónico
                      </p>
                      <p className="text-xs text-text-muted truncate mt-0.5">{user?.email}</p>
                    </div>
                    {notificationChannel === "EMAIL" && (
                      <CheckCircle size={18} className="text-primary-600 shrink-0" />
                    )}
                  </button>

                  {/* Save feedback */}
                  <div className="mt-3 min-h-[24px]">
                    <AnimatePresence>
                      {channelSaving && (
                        <motion.p
                          key="saving"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-xs text-text-muted"
                        >
                          Guardando…
                        </motion.p>
                      )}
                      {channelSaved && !channelSaving && (
                        <motion.p
                          key="saved"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-xs text-success font-semibold flex items-center gap-1"
                        >
                          <CheckCircle size={12} />
                          Canal guardado correctamente
                        </motion.p>
                      )}
                      {channelError && !channelSaving && (
                        <motion.p
                          key="error"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-xs text-danger flex items-center gap-1"
                        >
                          <AlertCircle size={12} />
                          {channelError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </SectionCard>
              </motion.div>

              {/* Save row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="flex items-center justify-between gap-4"
              >
                <Button variant="primary" size="lg" onClick={onSaveProfile} className="gap-2">
                  <Save size={16} />
                  Guardar cambios
                </Button>

                <AnimatePresence>
                  {saveSuccess && (
                    <motion.div
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-success/10 border border-success/25 text-success text-sm font-semibold"
                    >
                      <CheckCircle size={16} />
                      Cambios guardados
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          {/* ── Pets ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="mt-6"
          >
            <SectionCard>
              {user && <UserPets userId={user.id} />}
            </SectionCard>
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
}
