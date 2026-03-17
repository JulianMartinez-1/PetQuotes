"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { forgotPasswordRequest } from "@/lib/auth-api";

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

  return (
    <main className="page-container max-w-md py-6">
      <Card>
        <h1 className="text-2xl font-bold text-navy">Recuperar contraseña</h1>
        <p className="mt-2 text-sm text-soft">Te enviaremos instrucciones a tu correo.</p>

        <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
          <Input
            type="email"
            placeholder="correo@dominio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button disabled={isSending}>{isSending ? "Enviando..." : "Enviar instrucciones"}</Button>
        </form>

        {sent && (
          <p className="mt-4 text-sm text-green-700">
            Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu clave.
          </p>
        )}

        <p className="mt-4 text-sm text-soft">
          ¿Ya recordaste tu contraseña?{" "}
          <Link href="/login" className="font-semibold text-brand">
            Volver a iniciar sesión
          </Link>
        </p>
      </Card>
    </main>
  );
}
