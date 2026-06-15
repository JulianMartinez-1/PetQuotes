"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/store/app-state";
import { useAuthState } from "@/store/auth-state";
import { Footer } from "./footer";

const NAV_ITEMS = [
  { href: "/", label: "Inicio" },
  { href: "/clinics", label: "Clínicas" },
  { href: "/pets", label: "Mis Mascotas" },
  { href: "/profile", label: "Perfil" },
  { href: "/activity", label: "Actividad" },
  { href: "/bookings", label: "Reservas" }
] as const satisfies ReadonlyArray<{ href: Route; label: string }>;

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { mobileMenuOpen, setMobileMenuOpen, selectedCity } = useAppState();
  const { isAuthenticated, user, logout } = useAuthState();

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-40 border-b border-border/20 bg-slate-900 backdrop-blur">
        <div className="page-container flex h-16 items-center justify-between gap-4">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-white">
            PET QUOTES
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-base font-bold transition ${
                    active ? "bg-primary-600 text-white" : "text-white hover:text-primary-300 hover:bg-slate-700"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <span className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-white">{selectedCity}</span>
            {isAuthenticated ? (
              <>
                <Link href="/profile" className="rounded-lg border border-primary/30 px-3 py-2 text-right hover:bg-slate-800">
                  <p className="text-sm font-bold text-white">{user?.fullName}</p>
                  <p className="text-xs text-gray-400">Mi perfil</p>
                </Link>
                <Button variant="secondary" type="button" onClick={logout}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="secondary">Entrar</Button>
                </Link>
                <Link href="/register">
                  <Button variant="secondary">Crear cuenta</Button>
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
            className="inline-flex rounded-lg border border-white/20 p-2 text-white md:hidden hover:bg-slate-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border-dark/20 bg-slate-800 md:hidden">
            <div className="page-container grid gap-1 py-3">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-2 text-base font-bold transition ${
                      active ? "bg-primary-600 text-white" : "text-white hover:bg-slate-700 hover:text-primary-300"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {!isAuthenticated ? (
                <>
                  <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-400 hover:bg-slate-700 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                    Entrar
                  </Link>
                  <Link href="/register" className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-400 hover:bg-slate-700 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                    Crear cuenta
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-gray-400 hover:bg-slate-700 hover:text-white"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Cerrar sesión
                </button>
              )}
              {isAuthenticated && (
                <Link
                  href="/profile"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-soft hover:bg-sky hover:text-navy"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Perfil: {user?.fullName}
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main id="main-content" className="flex-1 py-6" tabIndex={-1}>{children}</main>

      <Footer />
    </div>
  );
}

