"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { completeOAuthProfile, OAuthProfileCompletionResponse } from "@/lib/auth-api";
import { useAuthState } from "@/store/auth-state";

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
        fullName: normalizedName
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
    <main className="page-container max-w-md py-6">
      <Card>
        <h1 className="text-2xl font-bold text-navy">Completa tu perfil</h1>
        <p className="mt-2 text-sm text-soft">
          Antes de continuar, elige el nombre con el que quieres aparecer en tu cuenta.
        </p>

        {context && (
          <p className="mt-3 text-xs text-soft">
            Cuenta social detectada: {context.email}
          </p>
        )}

        <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
          <Input
            type="text"
            placeholder="Nombre para mostrar"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button disabled={loading || !context}>
            {loading ? "Guardando tu perfil..." : "Continuar"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-soft">
          ¿Prefieres cancelar? <Link href="/login" className="font-semibold text-brand">Volver a iniciar sesion</Link>
        </p>
      </Card>
    </main>
  );
}
