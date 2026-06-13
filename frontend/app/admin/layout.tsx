"use client";

import { PropsWithChildren } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-dark">
      {/* Admin Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 border-b border-border/30 bg-surface/80 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/clinics">
            <Button variant="ghost" className="gap-2 hover:bg-surface/50">
              <ChevronLeft size={18} />
              Volver
            </Button>
          </Link>
          <div className="text-sm font-semibold text-text-primary">Panel de Administración</div>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </motion.header>

      {/* Admin Content */}
      {children}
    </div>
  );
}
