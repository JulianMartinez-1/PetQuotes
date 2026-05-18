import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { QueryProvider } from "@/components/query-provider";
import { AppShell } from "@/components/layout/app-shell";
import { AppStateProvider } from "@/store/app-state";
import { AuthStateProvider } from "@/store/auth-state";
import { ScrollIndicator, SmoothScroller } from "@/components/sections/scroll-effects";
import { ScrollProgressBar } from "@/components/animations/page-transitions";
import { MouseTrackingGlow, CursorDot } from "@/components/animations/mouse-effects";
import { WebVitalsScript } from "@/components/performance/web-vitals-script";
import { ChatWidget } from "@/components/chat/ChatWidget";

export const metadata: Metadata = {
  title: "PET QUOTES | SaaS veterinario",
  description: "Plataforma para agendar citas de mascotas entre clientes y veterinarias"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        {/* Performance monitoring */}
        <WebVitalsScript />

        {/* Global animations */}
        <ScrollProgressBar />
        <MouseTrackingGlow />
        <CursorDot />
        <ScrollIndicator />
        <SmoothScroller />

        {/* Providers */}
        <QueryProvider>
          <AppStateProvider>
            <AuthStateProvider>
              <AppShell>{children}</AppShell>
            </AuthStateProvider>
          </AppStateProvider>
        </QueryProvider>

        {/* Chat Widget */}
        <ChatWidget />
      </body>
    </html>
  );
}
