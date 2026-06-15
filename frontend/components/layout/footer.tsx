"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, MessageCircle, FileText, Heart, Phone, Mail, MapPin } from "lucide-react";
import { DURATIONS } from "@/constants/animations";
import { colors } from "@/constants/colors";
import { cn } from "@/lib/utils";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const servicesLinks = [
    { href: "/services#diagnostics", label: "Ayudas Diagnósticas" },
    { href: "/services#hospitalization", label: "Hospitalización" },
    { href: "/services#emergencies", label: "Urgencias 24 Horas" },
    { href: "/services#surgery", label: "Cirugía" },
    { href: "/services#preventive", label: "Medicina Preventiva" },
    { href: "/services#consultation", label: "Consulta" },
    { href: "/services#travel", label: "Trámite de viaje" },
    { href: "/services#lab", label: "Laboratorio Clínico" },
    { href: "/services#house-calls", label: "Domicilios Veterinarios en Medellín" },
  ];

  const informationLinks = [
    { href: "/about", label: "Nosotros" },
    { href: "/contact", label: "Contactanos" },
    { href: "/care-tips", label: "Preguntas frecuentes sobre cuidado animal" },
    { href: "/blog", label: "Blog/Noticias" },
    { href: "/terms", label: "Términos y Condiciones" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com", label: "Instagram", color: "hover:text-pink-500" },
    { icon: MessageCircle, href: "https://tiktok.com", label: "TikTok", color: "hover:text-black" },
    { icon: MessageCircle, href: "https://wa.me/573233695028", label: "WhatsApp", color: "hover:text-green-500" },
  ];

  return (
    <footer className={cn(
      "relative bg-gradient-to-b from-slate-900 to-slate-950 border-t border-border/20",
      "overflow-hidden"
    )}>
      {/* Animated Background Gradient */}
      <div className={cn(
        "absolute inset-0 opacity-10",
        "bg-gradient-to-t from-blue-600/20 via-transparent to-transparent"
      )} />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12"
        >
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="md:col-span-1"
          >
            <Link href="/">
              <div className="flex flex-col items-center gap-4 mb-6 group cursor-pointer">
                <img 
                  src="/Logo.png" 
                  alt="PetQuotes Logo" 
                  className="w-32 h-32 object-contain flex-shrink-0"
                />
                <div className="text-center">
                  <span className={cn(
                    "font-black text-3xl text-white block"
                  )}>
                    PetQuotes
                  </span>
                  <span className="text-sm text-blue-300">Clínica Veterinaria</span>
                </div>
              </div>
            </Link>
            <p className="text-slate-300 font-medium text-sm leading-relaxed mb-6">
              Cuidamos la salud de tu mascota con profesionalismo y amor.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "p-2 rounded-lg bg-slate-800 border border-slate-700",
                    "transition-all duration-300",
                    social.color,
                    "hover:bg-slate-700 hover:border-slate-600"
                  )}
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <social.icon size={18} className="text-white" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* 24 Hour Service Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="md:col-span-1"
          >
            <div className="relative">
              <div className={cn(
                "absolute -top-4 -left-4 w-20 h-20 rounded-full",
                "bg-blue-500/20 blur-xl"
              )} />
              <h3 className={cn(
                "font-black text-white mb-6",
                "text-sm uppercase tracking-wider relative"
              )}>
                Atención 24 Horas
              </h3>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <Phone size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 text-xs font-semibold mb-1">Línea de atención</p>
                  <a href="tel:+576043223781" className={cn(
                    "text-white font-bold text-sm",
                    "hover:text-blue-300 transition-colors duration-300"
                  )}>
                    +57 604 322 3781
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <MessageCircle size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 text-xs font-semibold mb-1">WhatsApp</p>
                  <a href="https://wa.me/573233695028" className={cn(
                    "text-white font-bold text-sm",
                    "hover:text-green-300 transition-colors duration-300"
                  )} target="_blank" rel="noopener noreferrer">
                    (+57) 323 369 5028
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <Mail size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 text-xs font-semibold mb-1">Email</p>
                  <a href="mailto:contacto@petquotes.com" className={cn(
                    "text-white font-bold text-sm",
                    "hover:text-red-300 transition-colors duration-300"
                  )}>
                    contacto@petquotes.com
                  </a>
                </div>
              </li>
            </ul>
          </motion.div>

          {/* Services Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:col-span-1"
          >
            <h3 className={cn(
              "font-black text-white mb-4",
              "text-sm uppercase tracking-wider"
            )}>
              Servicios
            </h3>
            <ul className="grid grid-cols-1 gap-2">
              {servicesLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href as any}>
                    <span className={cn(
                      "text-slate-300 font-medium text-sm",
                      "hover:text-blue-300 transition-colors duration-300",
                      "relative group inline-block"
                    )}>
                      {link.label}
                      <span className={cn(
                        "absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400",
                        "group-hover:w-full transition-all duration-300"
                      )} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Information Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="md:col-span-1 md:col-start-3"
          >
            <h3 className={cn(
              "font-black text-white mb-4",
              "text-sm uppercase tracking-wider"
            )}>
              Información
            </h3>
            <ul className="space-y-2">
              {informationLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href as any}>
                    <span className={cn(
                      "text-slate-300 font-medium text-sm",
                      "hover:text-blue-300 transition-colors duration-300",
                      "relative group inline-block"
                    )}>
                      {link.label}
                      <span className={cn(
                        "absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400",
                        "group-hover:w-full transition-all duration-300"
                      )} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="h-0.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent my-8"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        />

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <p className="text-slate-400 font-medium text-sm text-center md:text-left flex items-center gap-2">
            Hecho con <Heart size={14} className="text-red-500 animate-pulse" /> por PetQuotes © {currentYear}
          </p>
          <p className="text-slate-400 font-medium text-sm">
            PetQuotes • Veterinaria de Confianza
          </p>
        </motion.div>
      </div>
    </footer>
  );
}

