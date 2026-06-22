"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, Settings, User, Moon, Sun } from "lucide-react";
import { useAuthState } from "@/store/auth-state";
import { useDarkMode } from "@/hooks/useAnimations";
import { DURATIONS } from "@/constants/animations";
import { colors } from "@/constants/colors";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NavBar() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { isDark, toggleDarkMode } = useDarkMode();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      console.log("[NavBar] 👤 Usuario actualizado:", {
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        isAdmin: user.role === 'ADMIN'
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { href: "/" as const, label: "Inicio", gradient: false },
    { href: "/clinics" as const, label: "Clínicas", gradient: false },
    ...(isAuthenticated ? [
      { href: "/bookings" as const, label: "Mis Reservas", gradient: false },
      { href: "/pets" as const, label: "Mis Mascotas", gradient: false },
      { href: "/profile" as const, label: "Mi Perfil", gradient: false },
    ] : []),
  ];

  return (
    <>
      {/* Main NavBar */}
      <motion.nav
        className={cn(
          "fixed top-0 left-0 right-0 z-40 border-b",
          "bg-primary backdrop-blur-md border-b border-white/10",
          "transition-all duration-300"
        )}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATIONS.base / 1000 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/">
                <div className="flex items-center gap-2 group cursor-pointer">
                  <div className={cn(
                    "w-10 h-10 rounded-lg bg-gradient-to-br",
                    "from-primary to-secondary flex items-center justify-center",
                    "text-white font-bold text-lg",
                    "shadow-lg shadow-primary/30 group-hover:shadow-xl group-hover:shadow-primary/50",
                    "transition-all duration-300"
                  )}>
                    PQ
                  </div>
                  <span className={cn(
                    "hidden sm:block font-black text-xl",
                    "text-white"
                  )}>
                    PetQuotes
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <motion.div
                  key={link.href}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link href={link.href}>
                    <span className={cn(
                      "text-base font-bold transition-all duration-300",
                      "text-white hover:text-secondary",
                      "relative group"
                    )}>
                      {link.label}
                      <span className={cn(
                        "absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary",
                        "group-hover:w-full transition-all duration-300"
                      )} />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle — pill deslizante */}
              <motion.button
                onClick={() => toggleDarkMode()}
                whileTap={{ scale: 0.93 }}
                aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                className="relative flex items-center p-1 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-colors duration-200"
              >
                {/* Indicador deslizante */}
                <motion.span
                  className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white/25 pointer-events-none"
                  animate={{ x: isDark ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
                {/* Sol */}
                <span className={cn(
                  "relative z-10 w-6 h-6 flex items-center justify-center transition-colors duration-200",
                  !isDark ? "text-warning" : "text-white/50"
                )}>
                  <Sun size={13} />
                </span>
                {/* Luna */}
                <span className={cn(
                  "relative z-10 w-6 h-6 flex items-center justify-center transition-colors duration-200",
                  isDark ? "text-blue-200" : "text-white/50"
                )}>
                  <Moon size={13} />
                </span>
              </motion.button>

              {/* Auth Actions */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <motion.button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg",
                      "bg-secondary/10 hover:bg-secondary/20 border border-secondary/30",
                      "transition-all duration-300"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-full bg-gradient-to-br",
                        "from-secondary to-accent flex items-center justify-center",
                        "text-white font-bold text-sm"
                      )}>
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden sm:inline text-sm font-bold text-white truncate max-w-[150px]">
                        {user.fullName}
                      </span>
                    </div>
                  </motion.button>

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        ref={profileMenuRef}
                        className={cn(
                          "absolute right-0 mt-2 w-48 rounded-lg",
                          "bg-surface border border-border/30 shadow-xl shadow-black/20",
                          "z-50"
                        )}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-3 border-b border-border/30">
                          <p className="text-sm font-bold text-text-primary">{user.fullName}</p>
                          <p className="text-xs text-text-secondary">{user.email}</p>
                        </div>
                        <div className="p-2 space-y-2">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Link href="/profile">
                              <button
                                onClick={() => setProfileMenuOpen(false)}
                                className={cn(
                                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg",
                                  "text-sm font-bold text-text-primary",
                                  "hover:bg-primary/20 transition-colors"
                                )}
                              >
                                <User size={16} />
                                Mi Perfil
                              </button>
                            </Link>
                          </motion.div>

                          {user.role === 'ADMIN' && (
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Link href="/admin/analytics">
                                <button
                                  onClick={() => setProfileMenuOpen(false)}
                                  className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg",
                                    "text-sm font-bold text-secondary",
                                    "hover:bg-secondary/20 transition-colors"
                                  )}
                                >
                                  📊 Analíticas
                                </button>
                              </Link>
                            </motion.div>
                          )}

                          <motion.button
                            onClick={() => {
                              handleLogout();
                              setProfileMenuOpen(false);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 rounded-lg",
                              "text-sm font-bold text-danger",
                              "hover:bg-danger/20 transition-colors"
                            )}
                          >
                            <LogOut size={16} />
                            Cerrar Sesion
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/login">
                      <Button variant="outline" size="sm" className="text-base font-bold">
                        Entrar
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/register">
                      <Button variant="primary" size="sm" className="text-base font-bold">
                        Crear cuenta
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-surface border border-border/30 hover:border-secondary/50 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X size={20} className="text-secondary" />
                ) : (
                  <Menu size={20} className="text-text-primary" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          ref={mobileMenuRef}
          className="fixed top-16 left-0 right-0 z-30 md:hidden bg-dark/95 backdrop-blur-xl border-b border-border/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: DURATIONS.fast / 1000 }}
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: DURATIONS.fast / 1000 }}
              >
                <Link href={link.href}>
                  <span
                    className={cn(
                      "block py-2 px-4 rounded-lg text-base font-bold",
                      "text-text-primary hover:text-primary hover:bg-surface",
                      "transition-all duration-300"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </span>
                </Link>
              </motion.div>
            ))}

            <motion.div
              className="pt-3 border-t border-border/30 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isAuthenticated ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-center gap-2 text-base font-bold"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </Button>
              ) : (
                <div className="space-y-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="w-full text-base font-bold">
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm" className="w-full text-base font-bold">
                      Crear cuenta
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}

