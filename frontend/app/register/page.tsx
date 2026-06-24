"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, Mail, Lock, CheckCircle2, AlertCircle, ChevronLeft, Clock } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatedAuthPanel } from "@/components/auth/animated-auth-panel";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { RoleSelector, type SelectedRole } from "@/components/auth/role-selector";
import { VeterinaryClinicForm } from "@/components/auth/veterinary-clinic-form";
import { VeterinaryIndependentForm } from "@/components/auth/veterinary-independent-form";
import { registerRequest } from "@/lib/auth-api";
import type { VeterinaryClinicData, VeterinaryIndependentData } from "@/lib/auth-api";
import { useAuthState } from "@/store/auth-state";
import { DURATIONS } from "@/constants/animations";
import { cn } from "@/lib/utils";

type Step = "role" | "base" | "vet";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthState();

  const [step, setStep] = useState<Step>("role");
  const [selectedRole, setSelectedRole] = useState<SelectedRole | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [clinicData, setClinicData] = useState<Partial<VeterinaryClinicData>>({});
  const [independentData, setIndependentData] = useState<Partial<VeterinaryIndependentData>>({ homeVisits: false });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [vetPending, setVetPending] = useState(false);
  const [validations, setValidations] = useState({ name: false, email: false, password: false });

  const checkValidations = (fullName: string, email: string, password: string) => {
    setValidations({
      name: fullName.length >= 3,
      email: email.length > 0 && email.includes("@"),
      password: password.length >= 8,
    });
  };

  const isVet = selectedRole === "CLINIC" || selectedRole === "INDEPENDENT";
  const isBaseFormValid = validations.name && validations.email && validations.password;

  const isClinicDataValid =
    !!clinicData.clinicName?.trim() &&
    !!clinicData.city?.trim() &&
    !!clinicData.address?.trim();

  const isIndependentDataValid = !!independentData.serviceArea?.trim();

  const isVetDataValid =
    selectedRole === "CLINIC" ? isClinicDataValid : isIndependentDataValid;

  const isFinalFormValid = isBaseFormValid && (!isVet || isVetDataValid);

  const handleRoleNext = () => {
    if (!selectedRole) return;
    setStep("base");
  };

  const handleBaseNext = () => {
    if (!isBaseFormValid) return;
    if (isVet) {
      setStep("vet");
    } else {
      // CLIENT — stay on base step, no extra step needed (submit directly)
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!selectedRole) return;

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    };

    if (payload.fullName.length < 3) { setError("Tu nombre debe tener al menos 3 caracteres."); return; }
    if (payload.password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    if (!captchaToken) { setError("Completa la verificación reCAPTCHA para continuar."); return; }

    if (selectedRole === "CLINIC") {
      if (!clinicData.clinicName?.trim()) { setError("El nombre de la veterinaria es requerido."); return; }
      if (!clinicData.city?.trim()) { setError("La ciudad es requerida."); return; }
      if (!clinicData.address?.trim()) { setError("La dirección es requerida."); return; }
      if (!clinicData.latitude || !clinicData.longitude) {
        setError("Marca la ubicación de tu veterinaria en el mapa antes de continuar. Escribe la dirección y espera que aparezca el pin, o haz clic directamente en el mapa.");
        return;
      }
    }
    if (selectedRole === "INDEPENDENT" && !independentData.serviceArea?.trim()) {
      setError("La zona de atención es requerida.");
      return;
    }

    setLoading(true);
    try {
      const registerPayload = {
        ...payload,
        captchaToken,
        role: isVet ? ("VETERINARY" as const) : ("CLIENT" as const),
        ...(selectedRole === "CLINIC" && {
          veterinaryType: "CLINIC" as const,
          clinicData: clinicData as VeterinaryClinicData,
        }),
        ...(selectedRole === "INDEPENDENT" && {
          veterinaryType: "INDEPENDENT" as const,
          independentData: independentData as VeterinaryIndependentData,
        }),
      };

      const response = await registerRequest(registerPayload);
      if (isVet && (response as unknown as { pending: boolean }).pending) {
        setVetPending(true);
        setError(null);
      } else {
        login({ user: response.user });
        setSuccess(true);
        setError(null);
        setTimeout(() => router.push("/"), 3500);
      }
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
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: DURATIONS.base / 1000 } },
  };

  const stepTitles: Record<Step, { title: string; subtitle: string }> = {
    role: {
      title: "Crea tu cuenta",
      subtitle: "¿Cómo quieres usar PetQuotes?",
    },
    base: {
      title: selectedRole === "CLINIC" ? "Datos de tu cuenta" : selectedRole === "INDEPENDENT" ? "Datos de tu cuenta" : "Crea tu cuenta",
      subtitle: "Información personal de acceso",
    },
    vet: {
      title: selectedRole === "CLINIC" ? "Tu veterinaria" : "Tu perfil profesional",
      subtitle: selectedRole === "CLINIC"
        ? "Datos de la clínica que vas a registrar"
        : "Información sobre tu práctica independiente",
    },
  };

  const currentTitle = stepTitles[step];

  const stepIndicator = isVet ? (
    <div className="flex items-center gap-1.5 mb-5">
      {(["role", "base", "vet"] as Step[]).map((s, i) => (
        <div key={s} className="flex items-center gap-1.5">
          <div
            className={cn(
              "size-2 rounded-full transition-all duration-300",
              s === step
                ? "bg-primary-600 w-4"
                : step === "vet" && s === "role"
                ? "bg-primary-600/40"
                : step === "vet" && s === "base"
                ? "bg-primary-600/40"
                : step === "base" && s === "role"
                ? "bg-primary-600/40"
                : "bg-border",
            )}
          />
          {i < 2 && <div className="h-px w-3 bg-border" />}
        </div>
      ))}
    </div>
  ) : null;

  if (vetPending) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-surface-light">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-surface rounded-2xl border border-border shadow-xl p-8 text-center"
        >
          <div className="flex items-center justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-primary-50 border-2 border-primary-200 flex items-center justify-center">
              <Clock size={32} className="text-primary-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Tu solicitud ha sido enviada</h1>
          <p className="text-text-secondary text-sm leading-relaxed mb-6">
            Hemos recibido tu solicitud para registrarte como{" "}
            <strong>{selectedRole === "CLINIC" ? "veterinaria" : "veterinario independiente"}</strong>.
            Nuestro equipo la revisará pronto y recibirás un correo con la confirmación.
          </p>
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <Mail size={18} className="text-primary-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-text-primary mb-0.5">Revisa tu correo</p>
                <p className="text-xs text-text-secondary">
                  Una vez aprobada tu solicitud, recibirás un correo con un enlace para acceder a tu cuenta y gestionar tu veterinaria.
                </p>
              </div>
            </div>
          </div>
          <Link href="/">
            <Button variant="primary" size="lg" className="w-full">
              Volver al inicio
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <AnimatedAuthPanel variant="register" />

      {/* Right panel */}
      <div className="flex items-start justify-center p-6 sm:p-10 bg-surface overflow-y-auto">
        <div className="w-full max-w-sm py-4">
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

            {/* Step indicator */}
            {isVet && <motion.div variants={itemVariants}>{stepIndicator}</motion.div>}

            {/* Header */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                {step !== "role" && (
                  <button
                    type="button"
                    onClick={() => { setError(null); setStep(step === "vet" ? "base" : "role"); }}
                    className="p-1 -ml-1 rounded-md hover:bg-surface-light text-text-muted hover:text-text-secondary transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                <h1 className="text-2xl font-bold text-text-primary">{currentTitle.title}</h1>
              </div>
              <p className="text-text-secondary text-sm">{currentTitle.subtitle}</p>
            </motion.div>

            {/* ── STEP: ROLE ── */}
            <AnimatePresence mode="wait">
              {step === "role" && (
                <motion.div
                  key="step-role"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <RoleSelector selected={selectedRole} onChange={setSelectedRole} />

                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    disabled={!selectedRole}
                    onClick={handleRoleNext}
                    className="w-full mt-5"
                  >
                    Continuar
                  </Button>

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 bg-surface text-xs text-text-muted font-medium">O continúa con</span>
                    </div>
                  </div>

                  <SocialAuthButtons contextLabel="register" />

                  <div className="text-center mt-5">
                    <p className="text-text-secondary text-sm">
                      ¿Ya tienes cuenta?{" "}
                      <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                        Inicia sesión
                      </Link>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── STEP: BASE FORM ── */}
              {step === "base" && (
                <motion.form
                  key="step-base"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={(e) => {
                    if (isVet) {
                      e.preventDefault();
                      if (isBaseFormValid) setStep("vet");
                    } else {
                      onSubmit(e);
                    }
                  }}
                  className="space-y-4"
                >
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

                  {/* reCAPTCHA only for CLIENT (final step) */}
                  {!isVet && (
                    <div className="flex justify-center">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                        onChange={(token) => setCaptchaToken(token)}
                        onExpired={() => setCaptchaToken(null)}
                      />
                    </div>
                  )}

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

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading || !isBaseFormValid || (!isVet && (!captchaToken || success))}
                    className="w-full"
                  >
                    {success ? "¡Listo!" : loading ? "Creando cuenta..." : isVet ? "Continuar" : "Crear mi cuenta"}
                  </Button>

                  {!isVet && (
                    <p className="text-center text-xs text-text-muted">
                      Al registrarte aceptas nuestros{" "}
                      <Link href="#" className="text-primary-600 hover:underline">Términos</Link>
                      {" "}y{" "}
                      <Link href="#" className="text-primary-600 hover:underline">Privacidad</Link>
                    </p>
                  )}
                </motion.form>
              )}

              {/* ── STEP: VET FORM ── */}
              {step === "vet" && (
                <motion.form
                  key="step-vet"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={onSubmit}
                  className="space-y-4"
                >
                  {selectedRole === "CLINIC" ? (
                    <VeterinaryClinicForm value={clinicData} onChange={setClinicData} />
                  ) : (
                    <VeterinaryIndependentForm value={independentData} onChange={setIndependentData} />
                  )}

                  <div className="flex justify-center pt-2">
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

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading || !isFinalFormValid || !captchaToken || success}
                    className="w-full"
                  >
                    {success ? "¡Listo!" : loading ? "Creando cuenta..." : "Crear mi cuenta"}
                  </Button>

                  <p className="text-center text-xs text-text-muted">
                    Al registrarte aceptas nuestros{" "}
                    <Link href="#" className="text-primary-600 hover:underline">Términos</Link>
                    {" "}y{" "}
                    <Link href="#" className="text-primary-600 hover:underline">Privacidad</Link>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
