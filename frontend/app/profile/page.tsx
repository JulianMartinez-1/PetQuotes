"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Shield,
  Save,
  CheckCircle,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPets } from "@/components/pets";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/store/auth-state";
import { addActivityEvent } from "@/lib/activity-log";
import {
  getUserProfileSettings,
  saveUserProfileSettings,
} from "@/lib/user-profile";
import { DURATIONS } from "@/constants/animations";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuthState();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Bogota");
  const [emailReminders, setEmailReminders] = useState(true);
  const [whatsappReminders, setWhatsappReminders] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [reminderHoursBefore, setReminderHoursBefore] = useState<
    2 | 6 | 12 | 24
  >(12);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [locatingCity, setLocatingCity] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const defaults = getUserProfileSettings(
      user.id,
      user.email.split("@")[0]
    );
    setDisplayName(defaults.displayName);
    setPhone(defaults.phone);
    setCity(defaults.city);
    setEmailReminders(defaults.preferences.emailReminders);
    setWhatsappReminders(defaults.preferences.whatsappReminders);
    setMarketingEmails(defaults.preferences.marketingEmails);
    setReminderHoursBefore(defaults.preferences.reminderHoursBefore);
    setSavedAt(
      defaults.updatedAt !== new Date(0).toISOString()
        ? defaults.updatedAt
        : null
    );
  }, [user]);

  if (!user) return null;

  // Función para detectar ciudad desde coordenadas
  const detectCityFromCoordinates = (lat: number, lng: number): string => {
    // Colombia cities with approximate coordinates
    const cities = [
      { name: "Bogota", lat: 4.7110, lng: -74.0721, radius: 0.5 },
      { name: "Medellin", lat: 6.2442, lng: -75.5812, radius: 0.5 },
      { name: "Cali", lat: 3.4372, lng: -76.5197, radius: 0.5 },
    ];

    for (const city of cities) {
      const distance = Math.sqrt(
        Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
      );
      if (distance < city.radius) {
        return city.name;
      }
    }

    return "Bogota"; // Default fallback
  };

  // Función para obtener ubicación del usuario
  const enableGeolocation = async () => {
    setLocatingCity(true);
    setLocationError(null);

    if (!("geolocation" in navigator)) {
      setLocationError("Geolocalización no soportada en tu navegador");
      setLocatingCity(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const detectedCity = detectCityFromCoordinates(latitude, longitude);
        setCity(detectedCity);
        setLocatingCity(false);
        addActivityEvent({
          type: "preferences-updated",
          title: "Ubicación detectada",
          description: `Se detectó tu ubicación en ${detectedCity}`,
        });
      },
      (error) => {
        setLocationError("No se pudo acceder a tu ubicación. Verifica los permisos del navegador.");
        setLocatingCity(false);
      }
    );
  };

  // Función para ir a clínicas de la ciudad seleccionada
  const goToClinicsInCity = () => {
    router.push(`/clinics?city=${city}`);
  };

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
        reminderHoursBefore,
      },
      updatedAt: new Date().toISOString(),
    };

    saveUserProfileSettings(user.id, payload);
    setSavedAt(payload.updatedAt);
    setSaveSuccess(true);

    setTimeout(() => setSaveSuccess(false), 3000);

    addActivityEvent({
      type: "profile-updated",
      title: "Perfil actualizado",
      description: `Actualizaste tu perfil y preferencias de notificación (${payload.city}).`,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: DURATIONS.base / 1000 },
    },
  };

  return (
    <AuthGuard>
      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pt-16 pb-12">
          {/* Background Gradients */}
          <motion.div
            className="absolute inset-0 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute top-20 left-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-dark/40 via-transparent to-transparent" />
          </motion.div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATIONS.base / 1000 }}
            >
              <h1 className={cn(
                "text-5xl sm:text-6xl font-bold mb-6",
                "bg-gradient-to-r from-secondary via-foreground to-accent",
                "bg-clip-text text-transparent"
              )}>
                Mi Perfil
              </h1>

              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                Gestiona tu cuenta, preferencias y notificaciones
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Profile Info Cards */}
            {[
              {
                icon: User,
                title: "Cuenta",
                value: displayName || user.email.split("@")[0],
              },
              {
                icon: Bell,
                title: "Recordatorios",
                value:
                  emailReminders || whatsappReminders
                    ? "Activos"
                    : "Desactivados",
              },
              {
                icon: Shield,
                title: "Última Actualización",
                value: savedAt
                  ? new Date(savedAt).toLocaleDateString("es-CO")
                  : "Sin cambios",
              },
            ].map(({ icon: Icon, title, value }, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Card className="text-center">
                  <Icon size={32} className="mx-auto text-secondary mb-4" />
                  <p className="text-sm font-semibold text-text-tertiary uppercase tracking-wide mb-2">
                    {title}
                  </p>
                  <p className="text-lg font-bold text-text-primary break-words">
                    {value}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Edit Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: DURATIONS.base / 1000 }}
            viewport={{ once: true }}
            className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Personal Information */}
            <Card>
              <h2 className={cn(
                "text-2xl font-bold mb-6",
                "bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent"
              )}>
                📋 Información Personal
              </h2>

              <div className="space-y-4">
                {/* Display Name */}
                <motion.div
                  variants={itemVariants}
                  className="space-y-2"
                >
                  <label className="block text-sm font-semibold text-text-primary">
                    <User className="inline mr-2 text-secondary" size={16} />
                    Nombre para Mostrar
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Tu nombre"
                    variant="default"
                  />
                </motion.div>

                {/* Email (Read-only) */}
                <motion.div
                  variants={itemVariants}
                  className="space-y-2"
                >
                  <label className="block text-sm font-semibold text-text-primary">
                    <Mail className="inline mr-2 text-secondary" size={16} />
                    Correo de Acceso
                  </label>
                  <Input
                    value={user.email}
                    disabled
                    variant="default"
                    className="opacity-50"
                  />
                  <p className="text-xs text-text-tertiary">
                    Este correo no puede cambiar aquí
                  </p>
                </motion.div>

                {/* Phone */}
                <motion.div
                  variants={itemVariants}
                  className="space-y-2"
                >
                  <label className="block text-sm font-semibold text-text-primary">
                    <Phone className="inline mr-2 text-secondary" size={16} />
                    Teléfono de Contacto
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+57 301 2345678"
                    variant="default"
                  />
                </motion.div>

                {/* City */}
                <motion.div
                  variants={itemVariants}
                  className="space-y-2"
                >
                  <label className="block text-sm font-semibold text-text-primary">
                    <MapPin className="inline mr-2 text-secondary" size={16} />
                    Ciudad Principal
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={cn(
                        "flex-1 px-4 py-3 rounded-lg border transition-all",
                        "bg-surface border-border/30 text-text-primary",
                        "hover:border-secondary/50 focus:border-secondary focus:ring-secondary/20",
                        "text-sm font-medium"
                      )}
                    >
                      <option value="Bogota">Bogotá</option>
                      <option value="Medellin">Medellín</option>
                      <option value="Cali">Cali</option>
                    </select>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={enableGeolocation}
                      disabled={locatingCity}
                      className={cn(
                        "px-4 py-3 rounded-lg font-medium transition-all text-sm",
                        "flex items-center justify-center gap-2",
                        locatingCity
                          ? "bg-secondary/20 text-secondary cursor-not-allowed"
                          : "bg-secondary/10 text-secondary border border-secondary/30 hover:bg-secondary/20 hover:border-secondary/50"
                      )}
                    >
                      <MapPin size={16} />
                      {locatingCity ? "Detectando..." : "Mi Ubicación"}
                    </motion.button>
                  </div>
                  {locationError && (
                    <p className="text-xs text-red-500">{locationError}</p>
                  )}
                  <p className="text-xs text-text-tertiary">
                    Selecciona tu ciudad o usa tu ubicación GPS
                  </p>
                </motion.div>
              </div>

              {/* Search Clinics Button */}
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={goToClinicsInCity}
                className={cn(
                  "mt-6 w-full px-4 py-3 rounded-lg font-medium transition-all",
                  "flex items-center justify-center gap-2",
                  "bg-gradient-to-r from-secondary/20 to-accent/20",
                  "border border-secondary/30 hover:border-secondary/50",
                  "text-secondary hover:from-secondary/30 hover:to-accent/30"
                )}
              >
                <MapPin size={18} />
                Buscar Veterinarias en {city}
              </motion.button>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <h2 className={cn(
                "text-2xl font-bold mb-6",
                "bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent"
              )}>
                🔔 Preferencias de Notificaciones
              </h2>

              <div className="space-y-4">
                {/* Email Reminders */}
                <motion.label
                  variants={itemVariants}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                    emailReminders
                      ? "bg-secondary/10 border-secondary/30"
                      : "bg-surface border-border/30 hover:border-secondary/50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={emailReminders}
                    onChange={(e) => setEmailReminders(e.target.checked)}
                    className="w-5 h-5 cursor-pointer rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary">
                      📧 Recordatorios por Correo
                    </p>
                    <p className="text-xs text-text-tertiary">
                      Recibe alertas de tus citas
                    </p>
                  </div>
                  {emailReminders && (
                    <CheckCircle size={20} className="text-secondary" />
                  )}
                </motion.label>

                {/* WhatsApp Reminders */}
                <motion.label
                  variants={itemVariants}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                    whatsappReminders
                      ? "bg-success/10 border-success/30"
                      : "bg-surface border-border/30 hover:border-success/50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={whatsappReminders}
                    onChange={(e) => setWhatsappReminders(e.target.checked)}
                    className="w-5 h-5 cursor-pointer rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary">
                      💬 Recordatorios por WhatsApp
                    </p>
                    <p className="text-xs text-text-tertiary">
                      Notificaciones por mensajería
                    </p>
                  </div>
                  {whatsappReminders && (
                    <CheckCircle size={20} className="text-success" />
                  )}
                </motion.label>

                {/* Marketing Emails */}
                <motion.label
                  variants={itemVariants}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                    marketingEmails
                      ? "bg-accent/10 border-accent/30"
                      : "bg-surface border-border/30 hover:border-accent/50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={marketingEmails}
                    onChange={(e) => setMarketingEmails(e.target.checked)}
                    className="w-5 h-5 cursor-pointer rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-textPrimary">
                      Novedades y Promociones
                    </p>
                    <p className="text-xs text-textTertiary">
                      Recibe ofertas especiales
                    </p>
                  </div>
                  {marketingEmails && (
                    <CheckCircle size={20} className="text-accent" />
                  )}
                </motion.label>

                {/* Reminder Timing */}
                <motion.div
                  variants={itemVariants}
                  className="space-y-2"
                >
                  <label className="block text-sm font-semibold text-text-primary">
                    ⏰ Anticipación del Recordatorio
                  </label>
                  <select
                    value={reminderHoursBefore}
                    onChange={(e) =>
                      setReminderHoursBefore(Number(e.target.value) as 2 | 6 | 12 | 24)
                    }
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border transition-all",
                      "bg-surface border-border/30 text-text-primary",
                      "hover:border-secondary/50 focus:border-secondary focus:ring-secondary/20",
                      "text-sm font-medium"
                    )}
                  >
                    <option value={2}>2 horas antes</option>
                    <option value={6}>6 horas antes</option>
                    <option value={12}>12 horas antes</option>
                    <option value={24}>24 horas antes</option>
                  </select>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* Save Button and Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: DURATIONS.base / 1000 }}
            viewport={{ once: true }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <Button
              onClick={onSaveProfile}
              variant="primary"
              size="lg"
              className="gap-2 group !text-black"
              
            >
              <Save size={20} />
              <span>Guardar Cambios</span>
            </Button>

            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 border border-success/30 text-success text-sm font-semibold"
              >
                <CheckCircle size={18} />
                Cambios guardados correctamente
              </motion.div>
            )}

            {savedAt && (
              <p className="text-sm text-text-tertiary">
                Última actualización:{" "}
                <span className="text-text-primary font-semibold">
                  {new Date(savedAt).toLocaleString("es-CO")}
                </span>
              </p>
            )}
          </motion.div>

          {/* Pets Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: DURATIONS.base / 1000 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <Card>
              {user && <UserPets userId={user.id} />}
            </Card>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: DURATIONS.base / 1000 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <Card className="bg-secondary/5 border-secondary/30">
              <div className="flex gap-4">
                <Shield size={24} className="text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-textPrimary mb-2">
                    Tu información está segura
                  </h3>
                  <p className="text-sm text-textSecondary">
                    Todos tus datos están encriptados y protegidos. Tus preferencias se actualizan inmediatamente.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </section>
      </main>
    </AuthGuard>
  );
}

