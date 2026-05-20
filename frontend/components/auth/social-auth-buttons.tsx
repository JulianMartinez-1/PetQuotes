"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { OAuthProvider } from "@/lib/auth-api";
import { getOAuthProviders } from "@/lib/auth-api";

const ALLOWED_PROVIDERS = ["google", "facebook", "github", "microsoft"] as const;

type SocialAuthButtonsProps = {
  contextLabel: "login" | "register";
};

function getProviderStyle(providerId: OAuthProvider["id"]): string {
  const baseClass = "w-full text-white hover:shadow-lg";
  
  switch (providerId) {
    case "google":
      return `${baseClass} bg-red-500 hover:bg-red-600`;
    case "facebook":
      return `${baseClass} bg-[#1877F2] hover:bg-[#1565D8]`;
    case "github":
      return `${baseClass} bg-gray-800 hover:bg-gray-900`;
    case "microsoft":
      return `${baseClass} bg-[#00A4EF] hover:bg-[#0078D4]`;
    default:
      return `${baseClass} bg-gray-500 hover:bg-gray-600`;
  }
}

export function SocialAuthButtons({ contextLabel }: SocialAuthButtonsProps) {
  const [providers, setProviders] = useState<OAuthProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await getOAuthProviders();
        if (response.providers) {
          setProviders(response.providers.filter(p => p.enabled));
        }
      } catch (error) {
        console.error("Failed to load OAuth providers:", error);
        // Fallback to default providers if API fails
        setProviders([
          { id: "google", name: "Google", enabled: true },
          { id: "facebook", name: "Facebook", enabled: true }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  if (loading) {
    return (
      <div className="mt-6 grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="h-11 bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-11 bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-3">
      <p className="text-sm text-white/80 text-center font-medium">
        {contextLabel === "login"
          ? "O entra con tu cuenta social"
          : "O crea tu cuenta con un proveedor social"}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {providers.map((provider) => (
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
