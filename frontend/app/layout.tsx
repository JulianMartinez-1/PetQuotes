import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./styles.css";
import { QueryProvider } from "@/components/query-provider";
import { AppShell } from "@/components/layout/app-shell";
import { AppStateProvider } from "@/store/app-state";
import { AuthStateProvider } from "@/store/auth-state";
import { PetsStateProvider } from "@/store/pets-state";
import { GeolocationProvider } from "@/contexts/geolocation-context";
import { GoogleMapsProvider } from "@/contexts/google-maps-provider";
import { ScrollIndicator, SmoothScroller } from "@/components/sections/scroll-effects";
import { ScrollProgressBar } from "@/components/animations/page-transitions";
import { WebVitalsScript } from "@/components/performance/web-vitals-script";
import { ChatWidget } from "@/components/chat/ChatWidget";

export const metadata: Metadata = {
  title: "PET QUOTES | SaaS veterinario",
  description: "Plataforma para agendar citas de mascotas entre clientes y veterinarias",
  icons: {
    icon: "/Logo2.png"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        {/* Performance monitoring */}
        <WebVitalsScript />

        {/* Global animations */}
        <ScrollProgressBar />
        <ScrollIndicator />
        <SmoothScroller />

        {/* Providers */}
        <GoogleMapsProvider>
          <QueryProvider>
            <GeolocationProvider>
              <AppStateProvider>
                <AuthStateProvider>
                  <PetsStateProvider>
                    <AppShell>{children}</AppShell>
                  </PetsStateProvider>
                </AuthStateProvider>
              </AppStateProvider>
            </GeolocationProvider>
          </QueryProvider>
        </GoogleMapsProvider>

        {/* Chat Widget */}
        <ChatWidget />
      </body>
    </html>
  );
}
