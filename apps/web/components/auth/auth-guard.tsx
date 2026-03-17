"use client";

import type { PropsWithChildren } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/store/auth-state";

export function AuthGuard({ children }: PropsWithChildren) {
  const { isAuthenticated, isHydrated } = useAuthState();

  if (!isHydrated) {
    return (
      <div className="page-container max-w-3xl py-6">
        <Card>
          <p className="text-sm text-soft">Cargando sesión...</p>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="page-container max-w-3xl py-6">
        <Card>
          <h2 className="text-xl font-bold text-navy">Debes iniciar sesión para continuar</h2>
          <p className="mt-2 text-sm text-soft">Este módulo está protegido como parte del Sprint 2 de autenticación.</p>
          <div className="mt-4 flex gap-3">
            <Link href="/login">
              <Button>Iniciar sesión</Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary">Crear cuenta</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
