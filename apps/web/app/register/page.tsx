"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { registerRequest } from "@/lib/auth-api";
import { useAuthState } from "@/store/auth-state";
import { DURATIONS } from "@/constants/animations";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthState();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validations, setValidations] = useState({
    name: false,
    email: false,
    password: false,
  });

  const checkValidations = (fullName: string, email: string, password: string) => {
    setValidations({
      name: fullName.length >= 3,
      email: email.length > 0 && email.includes("@"),
      password: password.length >= 8,
    });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    };

    if (payload.fullName.length < 3) {
      setError("Tu nombre debe tener al menos 3 caracteres.");
      return;
    }

    if (payload.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerRequest(payload);
      login({ user: response.user });
      router.push("/bookings");
    } catch (err) {
      setError((err as Error).message || "No fue posible crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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

  const isFormValid =
    validations.name && validations.email && validations.password;

  return (
    <main className="min-h-screen relative flex items-center justify-center pt-16 pb-12 px-4">
      {/* Background Gradients */}
      <motion.div
        className="absolute inset-0 -z-10 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-magenta/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan/20 rounded-full blur-3xl" />
      </motion.div>

      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: DURATIONS.fast / 1000 }}
          className="mb-8"
        >
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-text-secondary">
              <ArrowLeft size={16} />
              Volver
            </Button>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="backdrop-blur-xl">
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="mb-4">
                <Badge className="px-3 py-1 bg-magenta/20 border-magenta/50 inline-block">
                  ✨ Nuevo Registro
                </Badge>
              </div>
              <h1 className={cn(
                "text-4xl font-bold mb-3",
                "bg-gradient-to-r from-magenta to-cyan bg-clip-text text-transparent"
              )}>
                Crea Tu Cuenta
              </h1>
              <p className="text-text-secondary text-lg">
                Únete a miles de dueños que cuidan a sus mascotas con PetQuotes
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              variants={itemVariants}
              className="space-y-5 mb-8"
              onSubmit={onSubmit}
            >
              {/* Full Name Input */}
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan/40 size-5" />
                <Input
                  type="text"
                  placeholder="Tu nombre completo"
                  value={form.fullName}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, fullName: e.target.value }));
                    checkValidations(e.target.value, form.email, form.password);
                  }}
                  className="pl-12"
                  variant="default"
                  required
                />
                {form.fullName.length > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {validations.name ? (
                      <CheckCircle2 size={20} className="text-success" />
                    ) : (
                      <AlertCircle size={20} className="text-warning" />
                    )}
                  </motion.div>
                )}
              </div>

              {/* Email Input */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan/40 size-5" />
                <Input
                  type="email"
                  placeholder="tu-correo@dominio.com"
                  value={form.email}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, email: e.target.value }));
                    checkValidations(form.fullName, e.target.value, form.password);
                  }}
                  className="pl-12"
                  variant="default"
                  required
                />
                {form.email.length > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {validations.email ? (
                      <CheckCircle2 size={20} className="text-success" />
                    ) : (
                      <AlertCircle size={20} className="text-warning" />
                    )}
                  </motion.div>
                )}
              </div>

              {/* Password Input */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan/40 size-5" />
                <Input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, password: e.target.value }));
                    checkValidations(form.fullName, form.email, e.target.value);
                  }}
                  className="pl-12"
                  variant="default"
                  required
                />
                {form.password.length > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {validations.password ? (
                      <CheckCircle2 size={20} className="text-success" />
                    ) : (
                      <AlertCircle size={20} className="text-warning" />
                    )}
                  </motion.div>
                )}
              </div>

              {/* Password Requirements */}
              {form.password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-surface border border-border/30 text-xs text-text-secondary space-y-1"
                >
                  <p className="flex items-center gap-2">
                    {form.password.length >= 8 ? (
                      <CheckCircle2 size={14} className="text-success flex-shrink-0" />
                    ) : (
                      <AlertCircle size={14} className="text-warning flex-shrink-0" />
                    )}
                    <span>Mínimo 8 caracteres</span>
                  </p>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "p-4 rounded-lg",
                    "bg-danger/10 border border-danger/30 text-danger text-sm"
                  )}
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || !isFormValid}
                className="w-full"
              >
                {loading ? (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Creando tu cuenta...
                  </motion.span>
                ) : (
                  <>
                    <CheckCircle2 size={18} className="mr-2" />
                    Crear Mi Cuenta
                  </>
                )}
              </Button>
            </motion.form>

            {/* Divider */}
            <motion.div
              variants={itemVariants}
              className="relative mb-8"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/30" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface text-text-tertiary">O continúa con</span>
              </div>
            </motion.div>

            {/* Social Auth */}
            <motion.div variants={itemVariants} className="mb-8">
              <SocialAuthButtons contextLabel="register" />
            </motion.div>

            {/* Sign In Link */}
            <motion.div
              variants={itemVariants}
              className="text-center"
            >
              <p className="text-text-secondary">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-magenta hover:text-magenta/80 font-semibold transition-colors">
                  Inicia sesión
                </Link>
              </p>
            </motion.div>

            {/* Terms */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-xs text-text-tertiary text-center"
            >
              Al crear una cuenta, aceptas nuestros{" "}
              <Link href="#" className="text-cyan hover:text-cyan/80">
                Términos de Servicio
              </Link>
              {" "}y{" "}
              <Link href="#" className="text-cyan hover:text-cyan/80">
                Política de Privacidad
              </Link>
            </motion.p>
          </Card>

          {/* Features Cards */}
          <motion.div
            variants={itemVariants}
            className="mt-8 grid gap-4 md:hidden"
          >
            {[
              { icon: "🐾", title: "Mascotas", desc: "Perfil completo" },
              { icon: "🏥", title: "Clínicas", desc: "Verificadas" },
              { icon: "📅", title: "Citas", desc: "Confirmadas" },
            ].map((item) => (
              <div
                key={item.title}
                className="p-4 rounded-lg bg-surface/50 border border-border/30 text-center"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                <p className="text-xs text-text-tertiary">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
