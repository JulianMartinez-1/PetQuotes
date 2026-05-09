import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { QueryProvider } from "@/components/query-provider";
import { AppShell } from "@/components/layout/app-shell";
import { AppStateProvider } from "@/store/app-state";
import { AuthStateProvider } from "@/store/auth-state";
import { ScrollIndicator, SmoothScroller } from "@/components/sections/scroll-effects";

export const metadata: Metadata = {
  title: "PET QUOTES | SaaS veterinario",
  description: "Plataforma para agendar citas de mascotas entre clientes y veterinarias"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ScrollIndicator />
        <SmoothScroller />
        <QueryProvider>
          <AppStateProvider>
            <AuthStateProvider>
              <AppShell>{children}</AppShell>
            </AuthStateProvider>
          </AppStateProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
