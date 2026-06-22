"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle, Loader } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { forgotPasswordRequest } from "@/lib/auth-api";
import { DURATIONS } from "@/constants/animations";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSending(true);

    try {
      await forgotPasswordRequest({ email });
      setSent(true);
    } catch (err) {
      setError((err as Error).message || "No fue posible iniciar recuperación");
    } finally {
      setIsSending(false);
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-warning/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/15 rounded-full blur-3xl" />
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
          <Link href="/login">
            <Button variant="ghost" size="sm" className="gap-2 text-text-secondary">
              <ArrowLeft size={16} />
              Volver al Login
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
            {!sent ? (
              <>
                {/* Header */}
                <motion.div variants={itemVariants} className="mb-8">
                  <div className="mb-4">
                    <Badge className="px-3 py-1 bg-warning/20 border-warning/50 inline-block">
                      🔐 Recuperación Segura
                    </Badge>
                  </div>
                  <h1 className={cn(
                    "text-4xl font-bold mb-3",
                    "bg-gradient-to-r from-accent-500 to-secondary-500 bg-clip-text text-transparent"
                  )}>
                    Recuperar Acceso
                  </h1>
                  <p className="text-text-secondary text-lg">
                    Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                    disabled={isSending || !email}
                    className="w-full"
                  >
                    {isSending ? (
                      <>
                        <Loader size={18} className="mr-2 animate-spin" />
                        Enviando enlace...
                      </>
                    ) : (
                      <>
                        <Mail size={18} className="mr-2" />
                        Enviar Enlace
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
                    <span className="px-2 bg-surface text-text-tertiary">o</span>
                  </div>
                </motion.div>

                {/* Login Link */}
                <motion.div
                  variants={itemVariants}
                  className="text-center"
                >
                  <p className="text-text-secondary">
                    ¿Ya recordaste tu contraseña?{" "}
                    <Link href="/login" className="text-secondary hover:text-secondary/80 font-semibold transition-colors">
                      Inicia sesión
                    </Link>
                  </p>
                </motion.div>

                {/* Info Card */}
                <motion.div
                  variants={itemVariants}
                  className="mt-6 p-4 rounded-lg bg-secondary/5 border border-secondary/30"
                >
                  <p className="text-xs text-text-secondary">
                    <span className="font-semibold text-text-primary">Consejo:</span> Si el correo existe en nuestro sistema, recibirás un enlace de recuperación en minutos. Por tu seguridad, no revelamos si la cuenta existe.
                  </p>
                </motion.div>
              </>
            ) : (
              <>
                {/* Success State */}
                <motion.div
                  variants={itemVariants}
                  className="text-center space-y-6"
                >
                  {/* Success Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    <div className="mx-auto w-16 h-16 rounded-full bg-success/20 border border-success/30 flex items-center justify-center">
                      <CheckCircle size={32} className="text-success" />
                    </div>
                  </motion.div>

                  {/* Title */}
                  <h2 className={cn(
                    "text-3xl font-bold",
                    "bg-gradient-to-r from-success to-secondary-400 bg-clip-text text-transparent"
                  )}>
                    ¡Enlace Enviado!
                  </h2>

                  {/* Message */}
                  <div className="space-y-3 text-left">
                    <p className="text-text-secondary">
                      Si existe una cuenta con el correo <span className="font-semibold text-text-primary">{email}</span>, recibirás un enlace para crear una nueva contraseña.
                    </p>
                    <p className="text-sm text-text-tertiary">
                      Revisa tu bandeja de entrada y carpeta de spam. El enlace es válido por 24 horas.
                    </p>
                  </div>

                  {/* Info Steps */}
                  <div className="space-y-3 text-left">
                    <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-3">
                      Próximos pasos
                    </p>
                    {[
                      "Abre el email de recuperación",
                      "Haz clic en el enlace proporcionado",
                      "Crea una nueva contraseña segura",
                      "Inicia sesión con tu nueva contraseña",
                    ].map((step, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border/30"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 border border-secondary/50 flex items-center justify-center">
                          <span className="text-xs font-semibold text-secondary">{idx + 1}</span>
                        </div>
                        <span className="text-sm text-text-secondary">{step}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <motion.div variants={itemVariants}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        setEmail("");
                        setSent(false);
                      }}
                    >
                      Enviar a Otro Correo
                    </Button>
                  </motion.div>

                  {/* Back to Login */}
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="w-full">
                      Volver a Iniciar Sesión
                    </Button>
                  </Link>
                </motion.div>
              </>
            )}
          </Card>
        </motion.div>
      </div>
    </main>
  );
}

