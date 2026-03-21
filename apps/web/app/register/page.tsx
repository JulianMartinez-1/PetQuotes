"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerRequest } from "@/lib/auth-api";
import { useAuthState } from "@/store/auth-state";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthState();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await registerRequest(form);
      login({ user: response.user });
      router.push("/bookings");
    } catch (err) {
      setError((err as Error).message || "No fue posible crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-container max-w-md py-6">
      <Card>
        <h1 className="text-2xl font-bold text-navy">Crear cuenta</h1>
        <p className="mt-2 text-sm text-soft">Crea tu cuenta y empieza a reservar con una experiencia simple y segura.</p>

        <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
          <Input
            type="text"
            placeholder="Nombre completo"
            value={form.fullName}
            onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
            required
          />
          <Input
            type="email"
            placeholder="tu-correo@dominio.com"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <Input
            type="password"
            placeholder="Crea una contraseña"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button disabled={loading}>{loading ? "Creando tu cuenta..." : "Crear mi cuenta"}</Button>
        </form>

        <p className="mt-4 text-sm text-soft">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-brand">
            Inicia sesión
          </Link>
        </p>
      </Card>
    </main>
  );
}
