"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { loginRequest } from "@/lib/auth-api";
import { useAuthState } from "@/store/auth-state";
import { DURATIONS } from "@/constants/animations";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthState();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const payload = {
      email: form.email.trim().toLowerCase(),
      password: form.password
    };

    if (!payload.email || !payload.password) {
      setError("Completa correo y contraseña para continuar.");
      return;
    }

    setLoading(true);

    try {
      const response = await loginRequest(payload);
      login({ user: response.user });
      router.push("/bookings");
    } catch (err) {
      setError((err as Error).message || "No fue posible iniciar sesión");
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

  return (
    <main className="min-h-screen relative flex items-center justify-center pt-16 pb-12 px-4">
      {/* Background Gradients */}
      <motion.div
        className="absolute inset-0 -z-10 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
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
              <h1 className={cn(
                "text-4xl font-bold mb-3",
                "bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent"
              )}>
                Bienvenido
              </h1>
              <p className="text-text-secondary text-lg">
                Accede a tu cuenta para gestionar citas y mascotas
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              variants={itemVariants}
              className="space-y-5 mb-8"
              onSubmit={onSubmit}
            >
              {/* Email Input */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40 size-5" />
                <Input
                  type="email"
                  placeholder="tu-correo@dominio.com"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="pl-12"
                  variant="default"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40 size-5" />
                <Input
                  type="password"
                  placeholder="Tu contraseña"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="pl-12"
                  variant="default"
                  required
                />
              </div>

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
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Entrando a tu cuenta...
                  </motion.span>
                ) : (
                  "Entrar a mi cuenta"
                )}
              </Button>

              {/* Forgot Password Link */}
              <motion.div
                variants={itemVariants}
                className="text-center"
              >
                <Link href="/forgot-password">
                  <Button variant="ghost" size="sm" className="text-secondary hover:text-secondary">
                    ¿Olvidaste tu contraseña?
                  </Button>
                </Link>
              </motion.div>
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
              <SocialAuthButtons contextLabel="login" />
            </motion.div>

            {/* Sign Up Link */}
            <motion.div
              variants={itemVariants}
              className="text-center"
            >
              <p className="text-text-secondary">
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="text-secondary hover:text-secondary/80 font-semibold transition-colors">
                  Crear cuenta
                </Link>
              </p>
            </motion.div>
          </Card>

          {/* Info Cards */}
          <motion.div
            variants={itemVariants}
            className="mt-8 grid gap-4 md:hidden"
          >
            {[
              { icon: "█", title: "Mascotas", desc: "Gestiona tu mascota" },
              { icon: "█", title: "Citas", desc: "Reserva fácilmente" },
              { icon: "█", title: "Clínicas", desc: "Verificadas" },
            ].map((item) => (
              <div
                key={item.title}
                className="p-4 rounded-lg bg-surface/50 border border-border/30 text-center"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-sm font-semibold text-textPrimary">{item.title}</p>
                <p className="text-xs text-textTertiary">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}

