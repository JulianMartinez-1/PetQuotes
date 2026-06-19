"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { exchangeOAuthCode, OAuthProviderId } from "@/lib/auth-api";
import { useAuthState } from "@/store/auth-state";

const SUPPORTED_PROVIDERS = new Set<OAuthProviderId>(["google", "facebook", "github", "microsoft"]);

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthState();
  const [error, setError] = useState<string | null>(null);
  const hasExchangedRef = useRef(false);

  const params = useMemo(() => {
    // Provider might come from URL params (set by us) or from sessionStorage (as fallback)
    let provider = (searchParams.get("provider") ?? "") as OAuthProviderId;
    
    // If not in URL params, try to get from sessionStorage
    if (!provider && typeof window !== "undefined") {
      provider = (sessionStorage.getItem("oauthProvider") ?? "") as OAuthProviderId;
    }
    
    const code = searchParams.get("code") ?? "";
    const state = searchParams.get("state") ?? "";
    const oauthError = searchParams.get("error") ?? "";

    return { provider, code, state, oauthError };
  }, [searchParams]);

  useEffect(() => {
    if (hasExchangedRef.current) {
      return;
    }

    let active = true;
    hasExchangedRef.current = true;

    const run = async () => {
      if (params.oauthError) {
        if (active) {
          setError("El proveedor social devolvio un error al autenticar.");
        }
        return;
      }

      if (!SUPPORTED_PROVIDERS.has(params.provider) || !params.code || !params.state) {
        if (active) {
          setError("No recibimos datos validos del proveedor social.");
        }
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/oauth/callback`;
        const response = await exchangeOAuthCode({
          provider: params.provider,
          code: params.code,
          state: params.state,
          redirectUri
        });

        if (!active) return;

        if ("requiresProfileCompletion" in response && response.requiresProfileCompletion) {
          sessionStorage.setItem("oauthProfileCompletion", JSON.stringify(response));
          router.replace("/oauth/complete-profile" as Route);
          return;
        }

        if ("user" in response) {
          login({ user: response.user });
          router.push("/bookings");
          return;
        }

        setError("No se pudo resolver la respuesta de autenticacion social.");
      } catch (err) {
        if (!active) return;
        setError((err as Error).message || "No se pudo completar la autenticacion social");
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [login, params, router]);

  return (
    <main className="page-container max-w-md py-6">
      <Card>
        <h1 className="text-2xl font-bold text-navy">Autenticando tu cuenta</h1>
        {!error ? (
          <p className="mt-3 text-sm text-soft">Estamos completando el ingreso social, espera un momento...</p>
        ) : (
          <>
            <p className="mt-3 text-sm text-red-600">{error}</p>
            <p className="mt-3 text-sm text-soft">
              Puedes volver a <Link href="/login" className="font-semibold text-brand">iniciar sesion</Link> o intentar con otro proveedor.
            </p>
          </>
        )}
      </Card>
    </main>
  );
}
