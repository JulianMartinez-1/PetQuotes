"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getOAuthProviders, OAuthProvider } from "@/lib/auth-api";

const providerOrder = ["google", "facebook", "github", "microsoft"] as const;

type SocialAuthButtonsProps = {
  contextLabel: "login" | "register";
};

export function SocialAuthButtons({ contextLabel }: SocialAuthButtonsProps) {
  const [providers, setProviders] = useState<OAuthProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProviders = async () => {
      try {
        const response = await getOAuthProviders();
        if (!mounted) return;

        const sorted = [...response.providers].sort(
          (a, b) => providerOrder.indexOf(a.id) - providerOrder.indexOf(b.id)
        );
        setProviders(sorted);
      } catch {
        if (!mounted) return;
        setProviders([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadProviders();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <p className="text-xs text-soft">Cargando opciones sociales...</p>;
  }

  if (providers.length === 0) {
    return null;
  }

  const enabledProviders = providers.filter((provider) => provider.enabled);
  if (enabledProviders.length === 0) {
    return (
      <p className="text-xs text-soft">
        Inicio de sesion social disponible proximamente.
      </p>
    );
  }

  return (
    <div className="mt-4 grid gap-2">
      <p className="text-xs text-soft">
        {contextLabel === "login"
          ? "O entra con tu cuenta social"
          : "O crea tu cuenta con un proveedor social"}
      </p>
      {enabledProviders.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="ghost"
          className="justify-start gap-3 border border-line bg-white px-4 py-2.5 text-[13px] font-semibold text-navy shadow-sm hover:bg-sky"
          onClick={() => {
            window.location.href = `/api/session/oauth/${provider.id}/start`;
          }}
        >
          <ProviderLogo providerId={provider.id} />
          <span>Continuar con {provider.name}</span>
        </Button>
      ))}
    </div>
  );
}

function ProviderLogo({ providerId }: { providerId: OAuthProvider["id"] }) {
  if (providerId === "google") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6.1-2.8-6.1-6.1S8.7 5.8 12 5.8c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.1 14.7 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6.9 0 9.1-4.8 9.1-7.3 0-.5 0-.9-.1-1.3H12z"/>
      </svg>
    );
  }

  if (providerId === "facebook") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/>
      </svg>
    );
  }

  if (providerId === "github") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="#111827" d="M12 .5C5.6.5.5 5.7.5 12.2c0 5.2 3.4 9.6 8.1 11.1.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.7-1.3-1.7-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.4-5.3-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.5 3-.5s2 .2 3 .5c2.3-1.6 3.3-1.2 3.3-1.2.6 1.6.2 2.9.1 3.2.8.9 1.2 1.9 1.2 3.2 0 4.7-2.8 5.7-5.4 6 .4.4.8 1.1.8 2.3v3.4c0 .3.2.7.8.6 4.7-1.6 8.1-6 8.1-11.1C23.5 5.7 18.4.5 12 .5z"/>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#2563EB" d="M11.5 2 4 5.2v6.6c0 5.2 3.6 10.2 7.5 11.2 3.9-1 7.5-6 7.5-11.2V5.2L11.5 2zm1.4 16.3h-2.8v-5h2.8v5zm0-6.5h-2.8V9.1h2.8v2.7z"/>
    </svg>
  );
}
