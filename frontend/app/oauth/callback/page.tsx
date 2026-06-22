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
    // Guard against React Strict Mode double-invocation and dep-change re-runs.
    // We must NOT reset this ref in a cleanup: resetting it causes a second
    // exchange request that consumes the OAuth code and clears the state cookie,
    // making the first request fail with a cookie-mismatch 400 error.
    if (hasExchangedRef.current) return;
    hasExchangedRef.current = true;

    // No isMounted / active guard needed: React 18 removed the warning about
    // setState on unmounted components, and navigation / login must never be
    // suppressed — suppressing them was the original cause of the infinite loading.
    const run = async () => {
      if (params.oauthError) {
        setError("El proveedor social devolvio un error al autenticar.");
        return;
      }

      if (!SUPPORTED_PROVIDERS.has(params.provider) || !params.code || !params.state) {
        setError("No recibimos datos validos del proveedor social.");
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/oauth/callback`;
        const response = await exchangeOAuthCode({
          provider: params.provider,
          code: params.code,
          state: params.state,
          redirectUri,
        });

        if ("requiresProfileCompletion" in response && response.requiresProfileCompletion) {
          sessionStorage.setItem("oauthProfileCompletion", JSON.stringify(response));
          router.replace("/oauth/complete-profile" as Route);
          return;
        }

        if ("user" in response) {
          login({ user: response.user });
          router.push("/");
          return;
        }

        setError("No se pudo resolver la respuesta de autenticacion social.");
      } catch (err) {
        setError((err as Error).message || "No se pudo completar la autenticacion social");
      }
    };

    void run();
  }, [params, router, login]);

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
