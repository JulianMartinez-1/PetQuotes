"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { OAuthProvider } from "@/lib/auth-api";
import { getOAuthProviders } from "@/lib/auth-api";

const ALLOWED_PROVIDERS = ["google", "facebook", "github", "microsoft"] as const;

type SocialAuthButtonsProps = {
  contextLabel: "login" | "register";
};

function getProviderStyle(_providerId: OAuthProvider["id"]): string {
  return "w-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-primary-300";
}

export function SocialAuthButtons({ contextLabel }: SocialAuthButtonsProps) {
  const [providers, setProviders] = useState<OAuthProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState<string | null>(null);

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

  const handleProviderClick = async (providerId: OAuthProvider["id"]) => {
    setSigningIn(providerId);
    try {
      // Store provider in sessionStorage - important for callback page to identify the provider
      if (typeof window !== "undefined") {
        sessionStorage.setItem("oauthProvider", providerId);
      }

      // Use clean callback URL (without query params) - must match Google/OAuth provider config
      const cleanCallbackUrl = `${window.location.origin}/oauth/callback`;

      const response = await fetch(
        `/api/session/oauth/start?provider=${providerId}&redirectUri=${encodeURIComponent(
          cleanCallbackUrl
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to initiate OAuth flow");
      }

      const data = (await response.json()) as { authorizationUrl: string };
      window.location.href = data.authorizationUrl;
    } catch (error) {
      console.error("OAuth sign in error:", error);
      setSigningIn(null);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="h-11 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-11 bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            disabled={signingIn === provider.id}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getProviderStyle(provider.id)}`}
            onClick={() => handleProviderClick(provider.id)}
          >
            {signingIn === provider.id ? (
              <div className="animate-spin h-4 w-4 border-2 border-slate-400 border-t-slate-800 rounded-full" />
            ) : (
              <>
                <ProviderLogo providerId={provider.id} />
                <span>{provider.name}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProviderLogo({ providerId }: { providerId: OAuthProvider["id"] }) {
  if (providerId === "google") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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
        <path fill="#24292e" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
    );
  }

  if (providerId === "microsoft") {
    return (
      <svg viewBox="0 0 21 21" width="18" height="18" aria-hidden="true">
        <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
        <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
        <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
        <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
      </svg>
    );
  }

  return null;
}
