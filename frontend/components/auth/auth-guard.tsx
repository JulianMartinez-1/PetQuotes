"use client";

import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useAuthState } from "@/store/auth-state";

export function AuthGuard({ children }: PropsWithChildren) {
  const router = useRouter();
  const { user, isHydrated } = useAuthState();
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    console.log("[AuthGuard] Effect ejecutado. isHydrated:", isHydrated, "user:", user?.email || "null");

    // Esperar a que se hidrate
    if (!isHydrated) {
      console.log("[AuthGuard] No está hidratado aún, esperando...");
      return;
    }

    // Si hay usuario, permitir
    if (user) {
      console.log("[AuthGuard] Usuario encontrado en state, renderizando:", user.email);
      setCanRender(true);
      return;
    }

    // Si no hay usuario, verificar localStorage como fallback
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      console.log("[AuthGuard] Usuario encontrado en localStorage, renderizando");
      setCanRender(true);
      return;
    }

    // Sin usuario, redirigir
    console.log("[AuthGuard] Sin usuario, redirigiendo a login");
    setCanRender(false);
    router.replace("/login");
  }, [isHydrated, user, router]);

  console.log("[AuthGuard] Renderizando. canRender:", canRender);

  if (canRender) {
    return <>{children}</>;
  }

  // Mostrar loader mientras se verifica
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600">Verificando sesión...</p>
        </div>
      </Card>
    </div>
  );
}
