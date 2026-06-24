"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { exchangeOAuthCode, OAuthProviderId } from "@/lib/auth-api";
import { useAuthState } from "@/store/auth-state";

const SUPPORTED_PROVIDERS = new Set<OAuthProviderId>(["google", "facebook", "github", "microsoft"]);

// Module-level guard: survives React Strict Mode's unmount→remount cycle.
// useRef resets to false on every remount, causing double exchanges that
// consume the single-use OAuth code and clear the state cookie on the first
// call, making the second call fail with a state-mismatch 400 error.
let lastExchangedState: string | null = null;

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthState();
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(() => {
    let provider = (searchParams.get("provider") ?? "") as OAuthProviderId;

    if (!provider && typeof window !== "undefined") {
      // Prefer the server-set cookie (more reliable than sessionStorage across redirects)
      const cookieMatch = document.cookie.match(/(?:^|;\s*)pq_oauth_provider=([^;]+)/);
      provider = ((cookieMatch?.[1] ?? sessionStorage.getItem("oauthProvider") ?? "")) as OAuthProviderId;
    }

    const code = searchParams.get("code") ?? "";
    const state = searchParams.get("state") ?? "";
    const oauthError = searchParams.get("error") ?? "";

    return { provider, code, state, oauthError };
  }, [searchParams]);

  useEffect(() => {
    // A non-empty state uniquely identifies one OAuth round-trip.
    // Comparing against the module-level var (not a ref) prevents the second
    // Strict Mode mount from re-running the exchange for the same state.
    if (!params.state || params.state === lastExchangedState) return;
    lastExchangedState = params.state;

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
