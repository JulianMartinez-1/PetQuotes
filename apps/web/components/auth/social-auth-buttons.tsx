"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getOAuthProviders, OAuthProvider } from "@/lib/auth-api";

const providerOrder = ["google", "facebook"] as const;
const ALLOWED_PROVIDERS = ["google", "facebook"] as const;

type SocialAuthButtonsProps = {
  contextLabel: "login" | "register";
};

function getProviderStyle(providerId: OAuthProvider["id"]): string {
  const baseClass = "w-full text-white hover:shadow-lg";
  
  switch (providerId) {
    case "google":
      return `${baseClass} bg-red-500 hover:bg-red-600`;
    case "facebook":
      return `${baseClass} bg-blue-600 hover:bg-blue-700`;
    default:
      return `${baseClass} bg-gray-500 hover:bg-gray-600`;
  }
}

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

  const enabledProviders = providers
    .filter((provider) => provider.enabled)
    .filter((provider) => ALLOWED_PROVIDERS.includes(provider.id as typeof ALLOWED_PROVIDERS[number]));
  
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
      <div className="grid grid-cols-2 gap-3">
        {enabledProviders.map((provider) => (
          <button
            key={provider.id}
            type="button"
            className={`flex items-center justify-center gap-2 font-semibold py-3 px-4 text-sm rounded-lg transition-all ${getProviderStyle(provider.id)}`}
            onClick={() => {
              window.location.href = `/api/session/oauth/${provider.id}/start`;
            }}
          >
            <ProviderLogo providerId={provider.id} />
            <span>{provider.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProviderLogo({ providerId }: { providerId: OAuthProvider["id"] }) {
  if (providerId === "google") {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path fill="white" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6.1-2.8-6.1-6.1S8.7 5.8 12 5.8c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.1 14.7 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6.9 0 9.1-4.8 9.1-7.3 0-.5 0-.9-.1-1.3H12z"/>
      </svg>
    );
  }

  if (providerId === "facebook") {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path fill="white" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/>
      </svg>
    );
  }

  return null;
}
