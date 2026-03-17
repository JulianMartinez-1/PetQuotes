"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/store/app-state";

const NAV_ITEMS = [
  { href: "/", label: "Inicio" },
  { href: "/bookings", label: "Reservas" }
] as const satisfies ReadonlyArray<{ href: Route; label: string }>;

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { mobileMenuOpen, setMobileMenuOpen, selectedCity } = useAppState();

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-white/90 backdrop-blur">
        <div className="page-container flex h-16 items-center justify-between gap-4">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-navy">
            PET QUOTES
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    active ? "bg-sky text-navy" : "text-soft hover:text-navy"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <span className="rounded-md bg-sky px-2 py-1 text-xs font-semibold text-navy">{selectedCity}</span>
            <Button variant="ghost">Ingresar</Button>
          </div>

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
            className="inline-flex rounded-lg border border-line p-2 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-line bg-white md:hidden">
            <div className="page-container grid gap-1 py-3">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-soft hover:bg-sky hover:text-navy"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 py-6">{children}</main>

      <footer className="mt-8 border-t border-line/80 bg-white/80">
        <div className="page-container py-6 text-sm text-soft">© {new Date().getFullYear()} PET QUOTES</div>
      </footer>
    </div>
  );
}
