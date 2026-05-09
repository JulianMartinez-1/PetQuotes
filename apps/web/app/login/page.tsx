"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { loginRequest } from "@/lib/auth-api";
import { useAuthState } from "@/store/auth-state";

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

  return (
    <main className="page-container max-w-md py-6">
      <Card>
        <h1 className="text-2xl font-bold text-navy">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-soft">Entra a tu cuenta para gestionar reservas, mascotas y recordatorios en un solo lugar.</p>

        <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
          <Input
            type="email"
            placeholder="tu-correo@dominio.com"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <Input
            type="password"
            placeholder="Ingresa tu contraseña"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button disabled={loading}>{loading ? "Entrando a tu cuenta..." : "Entrar a mi cuenta"}</Button>
        </form>

        <p className="mt-4 text-sm text-soft">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-semibold text-brand">
            Crear cuenta
          </Link>
        </p>

        <p className="mt-2 text-sm text-soft">
          ¿Olvidaste tu contraseña?{" "}
          <Link href="/forgot-password" className="font-semibold text-brand">
            Recuperar acceso
          </Link>
        </p>

        <SocialAuthButtons contextLabel="login" />
      </Card>
    </main>
  );
}
