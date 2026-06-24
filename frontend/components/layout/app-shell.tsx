"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { Menu, X, MapPin, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/store/app-state";
import { useAuthState } from "@/store/auth-state";
import { useDarkMode } from "@/hooks/useAnimations";
import { Footer } from "./footer";
import { cn } from "@/lib/utils";

const PUBLIC_NAV_ITEMS = [
  { href: "/", label: "Inicio" },
  { href: "/clinics", label: "Clínicas" },
] as const satisfies ReadonlyArray<{ href: Route; label: string }>;

const PROTECTED_NAV_ITEMS = [
  { href: "/pets", label: "Mis Mascotas" },
  { href: "/profile", label: "Perfil" },
  { href: "/bookings", label: "Reservas" },
] as const satisfies ReadonlyArray<{ href: Route; label: string }>;

const ADMIN_NAV_ITEM = { href: "/admin" as Route, label: "Admin" };

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { mobileMenuOpen, setMobileMenuOpen, selectedCity } = useAppState();
  const { isAuthenticated, isHydrated, user, logout } = useAuthState();
  const navItems = isAuthenticated && isHydrated
    ? [...PUBLIC_NAV_ITEMS, ...PROTECTED_NAV_ITEMS]
    : PUBLIC_NAV_ITEMS;
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <div className="app-shell">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border/80 shadow-sm transition-colors duration-200">
        <div className="page-container flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-0.5 shrink-0 group">
            <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent text-xl font-black tracking-tight transition-opacity group-hover:opacity-80">
              Pet
            </span>
            <span className="text-text-primary font-black text-xl tracking-tight transition-opacity group-hover:opacity-80">
              Quotes
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-primary-50 text-primary-700 font-semibold dark:bg-primary-900/30 dark:text-primary-300"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-light"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {user?.role === "ADMIN" && (
              <Link
                href={ADMIN_NAV_ITEM.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  pathname.startsWith("/admin")
                    ? "bg-primary-50 text-primary-700 font-semibold dark:bg-primary-900/30 dark:text-primary-300"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-light"
                )}
              >
                {ADMIN_NAV_ITEM.label}
              </Link>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">

            {/* ── Dark mode toggle — siempre visible ── */}
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="relative flex items-center p-1 rounded-full bg-surface-2 border border-border hover:bg-border-light active:scale-95 transition-all duration-200"
            >
              {/* Indicador deslizante */}
              <motion.span
                className="absolute top-1 left-1 w-6 h-6 rounded-full shadow-sm bg-white dark:bg-primary-600"
                animate={{ x: isDark ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
              {/* Sol */}
              <span className={cn(
                "relative z-10 w-6 h-6 flex items-center justify-center transition-colors duration-200",
                !isDark ? "text-warning" : "text-text-muted"
              )}>
                <Sun size={13} />
              </span>
              {/* Luna */}
              <span className={cn(
                "relative z-10 w-6 h-6 flex items-center justify-center transition-colors duration-200",
                isDark ? "text-primary-300" : "text-text-muted"
              )}>
                <Moon size={13} />
              </span>
            </button>

            {/* Desktop: city badge + auth */}
            <div className="hidden items-center gap-2 md:flex">
              <div className="flex items-center gap-1.5 rounded-full bg-surface-light border border-border px-3 py-1.5">
                <MapPin size={12} className="text-primary-600" />
                <span className="text-xs font-semibold text-text-secondary">{selectedCity}</span>
              </div>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    className="rounded-lg border border-border bg-surface px-3 py-1.5 text-right hover:bg-surface-light transition-colors"
                  >
                    <p className="text-sm font-bold text-text-primary leading-tight">{user?.fullName}</p>
                    <p className="text-xs text-text-muted">Mi perfil</p>
                  </Link>
                  <Button variant="outline" size="sm" type="button" onClick={logout}>
                    Cerrar sesión
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Entrar</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">Crear cuenta</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              className="inline-flex rounded-lg border border-border p-2 text-text-secondary md:hidden hover:bg-surface-light transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="border-t border-border bg-surface md:hidden shadow-lg"
            >
              <div className="page-container grid gap-0.5 py-3">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        active
                          ? "bg-primary-50 text-primary-700 font-semibold dark:bg-primary-900/30 dark:text-primary-300"
                          : "text-text-secondary hover:bg-surface-light hover:text-text-primary"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                <div className="mt-2 pt-2 border-t border-border grid gap-0.5">
                  {!isAuthenticated ? (
                    <>
                      <Link
                        href="/login"
                        className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-light hover:text-text-primary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Entrar
                      </Link>
                      <Link
                        href="/register"
                        className="rounded-lg px-3 py-2.5 text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Crear cuenta
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/profile"
                        className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-light hover:text-text-primary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Perfil: {user?.fullName}
                      </Link>
                      {user?.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className={cn(
                            "rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                            pathname.startsWith("/admin")
                              ? "bg-primary-50 text-primary-700"
                              : "text-primary-600 hover:bg-surface-light hover:text-primary-700"
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Panel Admin
                        </Link>
                      )}
                      <button
                        type="button"
                        className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-text-muted hover:bg-surface-light hover:text-text-primary transition-colors"
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        Cerrar sesión
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>

      {pathname !== "/login" && pathname !== "/register" && <Footer />}
    </div>
  );
}
