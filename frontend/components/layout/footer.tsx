"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Instagram, MessageCircle, Heart, Phone, Mail, ArrowRight, PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const servicesLinks = [
    { href: "/services/consulta-veterinaria", label: "Consulta Veterinaria" },
    { href: "/services/bano-grooming", label: "Baño & Grooming" },
    { href: "/services/vacunacion", label: "Vacunación" },
    { href: "/services/estetica", label: "Estética" },
    { href: "/clinics", label: "Clínicas Verificadas" },
    { href: "/bookings", label: "Reservar Cita" },
  ];

  const companyLinks = [
    { href: "/about", label: "Nosotros" },
    { href: "/blog", label: "Blog / Noticias" },
    { href: "/care-tips", label: "Consejos de Cuidado" },
    { href: "/contact", label: "Contacto" },
    { href: "/terms", label: "Términos y Condiciones" },
    { href: "/privacy", label: "Privacidad" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: MessageCircle, href: "https://wa.me/573233695028", label: "WhatsApp" },
    { icon: MessageCircle, href: "https://tiktok.com", label: "TikTok" },
  ];

  const footerLink = cn(
    "text-slate-400 text-sm hover:text-white transition-colors duration-200"
  );

  return (
    <footer className="relative bg-slate-950 border-t border-slate-800">
      {/* Subtle top glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-600/40 to-transparent" />

      <div className="page-container py-16">
        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Col 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-0.5 mb-4 group">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent text-2xl font-black">Pet</span>
              <span className="text-white font-black text-2xl">Quotes</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              La plataforma más confiable para conectar dueños de mascotas con clínicas veterinarias verificadas.
            </p>
            {/* Social */}
            <div className="flex items-center gap-2">
              {socialLinks.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 hover:border-slate-600 transition-all duration-200"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.93 }}
                >
                  <s.icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Col 2 — Servicios */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-5">Servicios</h3>
            <ul className="space-y-3">
              {servicesLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href as any} className={footerLink}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Empresa */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-5">Empresa</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href as any} className={footerLink}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contacto + Newsletter */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-5">Contacto</h3>
            <ul className="space-y-3 mb-8">
              <li>
                <a href="tel:6043223781" className="flex items-center gap-2.5 text-slate-400 text-sm hover:text-white transition-colors">
                  <Phone size={14} className="text-primary-400 shrink-0" />
                  604 322 3781
                </a>
              </li>
              <li>
                <a href="https://wa.me/573136537799" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-slate-400 text-sm hover:text-white transition-colors">
                  <MessageCircle size={14} className="text-green-400 shrink-0" />
                  (+57) 313 653 7799
                </a>
              </li>
              <li>
                <a href="mailto:contacto@petquotes.com" className="flex items-center gap-2.5 text-slate-400 text-sm hover:text-white transition-colors">
                  <Mail size={14} className="text-secondary-400 shrink-0" />
                  contacto@petquotes.com
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div>
              <p className="text-white text-sm font-semibold mb-2">Newsletter</p>
              <p className="text-slate-500 text-xs mb-3">Recibe consejos y novedades para tu mascota.</p>
              {subscribed ? (
                <p className="text-green-400 text-sm font-medium flex items-center gap-2">
                  <PawPrint size={14} /> ¡Gracias por suscribirte!
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                    className="flex-1 min-w-0 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    className="shrink-0 w-9 h-9 rounded-lg bg-primary-600 hover:bg-primary-700 flex items-center justify-center text-white transition-colors"
                    aria-label="Suscribir"
                  >
                    <ArrowRight size={15} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-slate-800 mb-8" />

        {/* ── Bottom Bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm flex items-center gap-1.5">
            Hecho con <Heart size={13} className="text-red-500 fill-red-500" /> por PetQuotes © {currentYear}
          </p>
          <p className="text-slate-600 text-xs">
            Todos los derechos reservados · Medellín, Colombia
          </p>
        </div>
      </div>
    </footer>
  );
}

