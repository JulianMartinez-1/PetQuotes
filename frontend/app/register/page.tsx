"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatedAuthPanel } from "@/components/auth/animated-auth-panel";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { registerRequest } from "@/lib/auth-api";
import { useAuthState } from "@/store/auth-state";
import { DURATIONS } from "@/constants/animations";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthState();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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

    if (!captchaToken) {
      setError("Completa la verificación reCAPTCHA para continuar.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerRequest({ ...payload, captchaToken });
      login({ user: response.user });
      setSuccess(true);
      setError(null);
      setTimeout(() => {
        router.push("/");
      }, 3500);
    } catch (err) {
      setError((err as Error).message || "No fue posible crear la cuenta");
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

  const isFormValid =
    validations.name && validations.email && validations.password;

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden grid lg:grid-cols-2">
      <AnimatedAuthPanel variant="register" />

      {/* ── Panel derecho — Form ── */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-surface overflow-y-auto">
        <div className="w-full max-w-sm">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
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
              <h1 className="text-2xl font-bold text-text-primary mb-1.5">Crea tu cuenta</h1>
              <p className="text-text-secondary text-sm">Únete a miles de dueños que cuidan a sus mascotas con PetQuotes</p>
            </motion.div>

            {/* Form */}
            <motion.form variants={itemVariants} className="space-y-4 mb-6" onSubmit={onSubmit}>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-4" />
                  <Input
                    type="text"
                    placeholder="Tu nombre completo"
                    value={form.fullName}
                    onChange={(e) => { setForm((p) => ({ ...p, fullName: e.target.value })); checkValidations(e.target.value, form.email, form.password); }}
                    className="pl-10 pr-10"
                    variant="default"
                    required
                  />
                  {form.fullName.length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {validations.name ? <CheckCircle2 size={16} className="text-success" /> : <AlertCircle size={16} className="text-warning" />}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-4" />
                  <Input
                    type="email"
                    placeholder="tu-correo@dominio.com"
                    value={form.email}
                    onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); checkValidations(form.fullName, e.target.value, form.password); }}
                    className="pl-10 pr-10"
                    variant="default"
                    required
                  />
                  {form.email.length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {validations.email ? <CheckCircle2 size={16} className="text-success" /> : <AlertCircle size={16} className="text-warning" />}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-4" />
                  <Input
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={form.password}
                    onChange={(e) => { setForm((p) => ({ ...p, password: e.target.value })); checkValidations(form.fullName, form.email, e.target.value); }}
                    className="pl-10 pr-10"
                    variant="default"
                    required
                  />
                  {form.password.length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {validations.password ? <CheckCircle2 size={16} className="text-success" /> : <AlertCircle size={16} className="text-warning" />}
                    </div>
                  )}
                </div>
                {form.password.length > 0 && !validations.password && (
                  <p className="mt-1.5 text-xs text-text-muted">Mínimo 8 caracteres</p>
                )}
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
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-danger/8 border border-danger/20 text-danger text-sm">
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-success/8 border border-success/20 text-success text-sm flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>¡Cuenta creada! Redirigiendo...</span>
                </motion.div>
              )}

              <Button type="submit" variant="primary" size="lg" disabled={loading || !isFormValid || !captchaToken || success} className="w-full">
                {success ? "¡Listo!" : loading ? "Creando cuenta..." : "Crear mi cuenta"}
              </Button>

              <p className="text-center text-xs text-text-muted">
                Al registrarte aceptas nuestros{" "}
                <Link href="#" className="text-primary-600 hover:underline">Términos</Link>
                {" "}y{" "}
                <Link href="#" className="text-primary-600 hover:underline">Privacidad</Link>
              </p>
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

            <motion.div variants={itemVariants} className="mb-6">
              <SocialAuthButtons contextLabel="register" />
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <p className="text-text-secondary text-sm">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                  Inicia sesión
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

