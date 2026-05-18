"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X, LogOut, Settings } from "lucide-react";
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
  const { isDark, toggleDarkMode } = useDarkMode();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { href: "/" as const, label: "Home", gradient: false },
    { href: "/clinics" as const, label: "Clinics", gradient: false },
    ...(isAuthenticated ? [
      { href: "/bookings" as const, label: "My Bookings", gradient: false },
      { href: "/profile" as const, label: "Profile", gradient: false },
    ] : []),
  ];

  return (
    <>
      {/* Main NavBar */}
      <motion.nav
        className={cn(
          "fixed top-0 left-0 right-0 z-40 border-b",
          "bg-dark/80 backdrop-blur-xl border-border/20",
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
                    "from-orange to-green flex items-center justify-center",
                    "text-white font-bold text-lg",
                    "shadow-lg shadow-orange/30 group-hover:shadow-xl group-hover:shadow-orange/50",
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
                      "text-text-primary hover:text-orange",
                      "relative group"
                    )}>
                      {link.label}
                      <span className={cn(
                        "absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange to-green",
                        "group-hover:w-full transition-all duration-300"
                      )} />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <motion.button
                onClick={() => toggleDarkMode()}
                className={cn(
                  "hidden sm:flex items-center justify-center w-10 h-10 rounded-lg",
                  "bg-surface border border-border/30 hover:border-orange/50",
                  "transition-all duration-300 hover:bg-surface-light"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle dark mode"
              >
                {isDark ? "🌙" : "☀️"}
              </motion.button>

              {/* Auth Actions */}
              {isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="gap-2 text-base font-bold"
                    >
                      <LogOut size={16} />
                      <span className="hidden sm:inline">Logout</span>
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/login">
                      <Button variant="outline" size="sm" className="text-base font-bold">
                        Login
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/register">
                      <Button variant="primary" size="sm" className="text-base font-bold">
                        Sign Up
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-surface border border-border/30 hover:border-cyan/50 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X size={20} className="text-cyan" />
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
                      "text-text-primary hover:text-orange hover:bg-surface",
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
                  Logout
                </Button>
              ) : (
                <div className="space-y-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="w-full text-base font-bold">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm" className="w-full text-base font-bold">
                      Sign Up
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
