"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, User, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { completeOAuthProfile, OAuthProfileCompletionResponse } from "@/lib/auth-api";
import { useAuthState } from "@/store/auth-state";
import { cn } from "@/lib/utils";

export default function OAuthCompleteProfilePage() {
  const router = useRouter();
  const { login } = useAuthState();
  const [context, setContext] = useState<OAuthProfileCompletionResponse | null>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("oauthProfileCompletion");
    if (!raw) {
      setError("No hay una autenticacion social pendiente para completar.");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as OAuthProfileCompletionResponse;
      setContext(parsed);
      setFullName(parsed.name ?? "");
    } catch {
      setError("No se pudieron recuperar los datos de autenticacion social.");
    }
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!context) {
      setError("No hay contexto de autenticacion para completar.");
      return;
    }

    const normalizedName = fullName.trim();
    if (normalizedName.length < 3) {
      setError("Escribe un nombre de al menos 3 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const response = await completeOAuthProfile({
        provider: context.provider,
        completionToken: context.completionToken,
        fullName: normalizedName,
      });

      sessionStorage.removeItem("oauthProfileCompletion");
      login({ user: response.user });
      router.replace("/bookings");
    } catch (err) {
      setError((err as Error).message || "No se pudo completar el perfil social");
    } finally {
      setLoading(false);
    }
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
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
      </motion.div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-8"
        >
          <Link href="/login">
            <Button variant="ghost" size="sm" className="gap-2 text-text-secondary">
              <ArrowLeft size={16} />
              Volver al login
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="backdrop-blur-xl">
            {/* Header */}
            <div className="mb-8">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/30 flex items-center justify-center mb-6">
                <User size={28} className="text-secondary" />
              </div>
              <h1
                className={cn(
                  "text-3xl font-bold mb-3",
                  "bg-gradient-to-r from-secondary-500 to-primary-600 bg-clip-text text-transparent"
                )}
              >
                Completa tu perfil
              </h1>
              <p className="text-text-secondary text-base">
                Elige el nombre con el que quieres aparecer en tu cuenta.
              </p>
            </div>

            {/* Social account info */}
            {context && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-surface border border-border/30 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={16} className="text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary font-medium">Cuenta social detectada</p>
                  <p className="text-sm font-semibold text-text-primary">{context.email}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40 size-5" />
                <Input
                  type="text"
                  placeholder="Nombre para mostrar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-12"
                  variant="default"
                  required
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || !context}
                className="w-full"
              >
                {loading ? "Guardando tu perfil..." : "Continuar"}
              </Button>
            </form>

            <p className="mt-6 text-sm text-text-secondary text-center">
              ¿Prefieres cancelar?{" "}
              <Link
                href="/login"
                className="text-secondary hover:text-secondary/80 font-semibold transition-colors"
              >
                Volver a iniciar sesión
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
