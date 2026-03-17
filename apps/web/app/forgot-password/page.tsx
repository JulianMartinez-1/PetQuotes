"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
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
          <Button>Enviar instrucciones</Button>
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
