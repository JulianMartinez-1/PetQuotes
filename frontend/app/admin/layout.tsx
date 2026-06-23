"use client";

import { PropsWithChildren } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Building2, ClipboardList, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthState } from "@/store/auth-state";

const NAV_ITEMS = [
  { href: "/admin/clinics", label: "Clínicas", icon: Building2 },
  { href: "/admin/reservas", label: "Reservas", icon: ClipboardList },
  { href: "/admin/analytics", label: "Analítica", icon: BarChart3 },
];

export default function AdminLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isHydrated } = useAuthState();

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-light">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">Solo administradores pueden acceder a este panel.</p>
          <Button onClick={() => router.push("/")}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Admin Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 border-b border-border/30 bg-surface/80 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/">
            <Button variant="ghost" className="gap-1.5 hover:bg-surface/50 shrink-0 px-2 sm:px-3">
              <ChevronLeft size={18} />
              <span className="hidden sm:inline">Inicio</span>
            </Button>
          </Link>

          {/* Admin nav — icon-only on mobile, icon+label on sm+ */}
          <nav className="flex items-center gap-0.5 sm:gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  title={label}
                  className={cn(
                    "gap-1.5 text-sm px-2 sm:px-3",
                    pathname.startsWith(href) &&
                      "bg-primary-50 text-primary-700 hover:bg-primary-100"
                  )}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          <div className="hidden sm:block text-xs font-semibold text-text-muted shrink-0">ADMIN</div>
        </div>
      </motion.header>

      {/* Admin Content */}
      {children}
    </div>
  );
}
