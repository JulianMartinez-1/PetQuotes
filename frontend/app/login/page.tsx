  "use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, CheckCircle2 } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { Input } from "@/components/ui/input";
import { AnimatedAuthPanel } from "@/components/auth/animated-auth-panel";
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
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    
    console.clear();
    console.log("[Login] ===== INICIANDO LOGIN =====");

    const payload = {
      email: form.email.trim().toLowerCase(),
      password: form.password
    };

    if (!payload.email || !payload.password) {
      setError("Completa correo y contraseña para continuar.");
      return;
    }

    if (!captchaToken) {
      setError("Completa la verificación reCAPTCHA para continuar.");
      return;
    }

    setLoading(true);

    try {
      console.log("[Login] Llamando loginRequest con:", payload.email);
      const response = await loginRequest({ ...payload, captchaToken });
      console.log("[Login] ✅ loginRequest exitoso!");
      console.log("[Login] Usuario recibido:", response.user);
      
      console.log("[Login] Llamando login()...");
      login({ user: response.user });
      
      setSuccess(true);
      setError(null);
      
      console.log("[Login] Esperando a que localStorage se actualice...");
      
      // Esperar que localStorage esté actualizado
      const maxWaitTime = 1500;
      const startTime = Date.now();
      
      const waitForStorage = setInterval(() => {
        const saved = localStorage.getItem("auth_user");
        const elapsed = Date.now() - startTime;
        
        if (saved) {
          clearInterval(waitForStorage);
          console.log("[Login] ✅ localStorage actualizado después de", elapsed, "ms");
          console.log("[Login] 🚀 Redirigiendo a /...");
          router.push("/");
        } else if (elapsed > maxWaitTime) {
          clearInterval(waitForStorage);
          console.log("[Login] ⚠️ Timeout esperando localStorage, redirigiendo de todas formas");
          router.push("/");
        }
      }, 50);
    } catch (err) {
      console.error("[Login] ❌ Error:", err);
      setError((err as Error).message || "No fue posible iniciar sesión");
      setSuccess(false);
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
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
    <div className="h-[calc(100vh-4rem)] overflow-hidden grid lg:grid-cols-2">
      <AnimatedAuthPanel variant="login" />

      {/* ── Panel derecho — Form ── */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-surface overflow-y-auto">
        <div className="w-full max-w-sm">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Back (mobile only) */}
            <motion.div variants={itemVariants} className="mb-6 lg:hidden">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                  <ArrowLeft size={15} />
                  Volver
                </Button>
              </Link>
            </motion.div>

            {/* Header */}
            <motion.div variants={itemVariants} className="mb-8">
              <h1 className="text-2xl font-bold text-text-primary mb-1.5">Bienvenido de nuevo</h1>
              <p className="text-text-secondary text-sm">Accede a tu cuenta para gestionar citas y mascotas</p>
            </motion.div>

            {/* Form */}
            <motion.form variants={itemVariants} className="space-y-4 mb-6" onSubmit={onSubmit}>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-4" />
                  <Input
                    type="email"
                    placeholder="tu-correo@dominio.com"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    variant="default"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-text-secondary">Contraseña</label>
                  <Link href="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-4" />
                  <Input
                    type="password"
                    placeholder="Tu contraseña"
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="pl-10"
                    variant="default"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-danger/8 border border-danger/20 text-danger text-sm"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-success/8 border border-success/20 text-success text-sm flex items-center gap-2.5"
                >
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>¡Sesión iniciada! Redirigiendo...</span>
                </motion.div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || success || !captchaToken}
                className="w-full"
              >
                {success ? "¡Listo!" : loading ? "Entrando..." : "Entrar a mi cuenta"}
              </Button>
            </motion.form>

            {/* Divider */}
            <motion.div variants={itemVariants} className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-surface text-xs text-text-muted font-medium">O continúa con</span>
              </div>
            </motion.div>

            {/* Social Auth */}
            <motion.div variants={itemVariants} className="mb-6">
              <SocialAuthButtons contextLabel="login" />
            </motion.div>

            {/* Sign Up Link */}
            <motion.div variants={itemVariants} className="text-center">
              <p className="text-text-secondary text-sm">
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                  Crear cuenta
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

