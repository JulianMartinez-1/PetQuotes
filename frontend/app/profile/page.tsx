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
            <div className="absolute top-20 left-10 w-96 h-96 bg-cyan/15 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-magenta/15 rounded-full blur-3xl" />
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
                "bg-gradient-to-r from-cyan via-text-primary to-magenta",
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
                  <Icon size={32} className="mx-auto text-cyan mb-4" />
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
                "bg-gradient-to-r from-cyan to-magenta bg-clip-text text-transparent"
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
                    <User className="inline mr-2 text-cyan" size={16} />
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
                    <Mail className="inline mr-2 text-cyan" size={16} />
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
                    <Phone className="inline mr-2 text-cyan" size={16} />
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
                    <MapPin className="inline mr-2 text-cyan" size={16} />
                    Ciudad Principal
                  </label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bogotá"
                    variant="default"
                  />
                </motion.div>
              </div>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <h2 className={cn(
                "text-2xl font-bold mb-6",
                "bg-gradient-to-r from-cyan to-magenta bg-clip-text text-transparent"
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
                      ? "bg-cyan/10 border-cyan/30"
                      : "bg-surface border-border/30 hover:border-cyan/50"
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
                    <CheckCircle size={20} className="text-cyan" />
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
                      ? "bg-magenta/10 border-magenta/30"
                      : "bg-surface border-border/30 hover:border-magenta/50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={marketingEmails}
                    onChange={(e) => setMarketingEmails(e.target.checked)}
                    className="w-5 h-5 cursor-pointer rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary">
                      🎁 Novedades y Promociones
                    </p>
                    <p className="text-xs text-text-tertiary">
                      Recibe ofertas especiales
                    </p>
                  </div>
                  {marketingEmails && (
                    <CheckCircle size={20} className="text-magenta" />
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
                      "hover:border-cyan/50 focus:border-cyan focus:ring-cyan/20",
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
              className="gap-2 group"
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

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: DURATIONS.base / 1000 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <Card className="bg-cyan/5 border-cyan/30">
              <div className="flex gap-4">
                <Shield size={24} className="text-cyan flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">
                    🔒 Tu información está segura
                  </h3>
                  <p className="text-sm text-text-secondary">
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
