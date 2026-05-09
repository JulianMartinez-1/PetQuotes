"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Search, Stethoscope, Sparkles, Syringe, Scissors, ShieldCheck, Clock3, HeartPulse, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useState } from "react";
import { HeroSection, SectionDivider, RevealText } from "@/components/sections/hero-animations";
import { ProofStatsSection, TestimonialCard, AnimatedFeatureCard } from "@/components/sections/animated-components";

const ClinicMap = dynamic(() => import("@/components/sections/clinic-map").then((mod) => mod.ClinicMap), {
  ssr: false
});

const steps = [
  "Busca por ubicacion y servicio en segundos",
  "Compara clinicas por distancia, rating y disponibilidad",
  "Confirma tu cita y recibe seguimiento en tiempo real"
];

const services = [
  { title: "Consulta veterinaria", icon: Stethoscope },
  { title: "Bano y grooming", icon: Scissors },
  { title: "Vacunacion", icon: Syringe },
  { title: "Estética", icon: Sparkles }
];

const featured = [
  { name: "Vet Prime", rating: 4.9, distance: "1.8 km", image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=1000&auto=format&fit=crop" },
  { name: "Animal Hub", rating: 4.8, distance: "2.4 km", image: "https://images.unsplash.com/photo-1560743641-3914f2c45636?q=80&w=1000&auto=format&fit=crop" },
  { name: "PetCare Norte", rating: 4.7, distance: "3.1 km", image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1000&auto=format&fit=crop" }
];

const proofStats = [
  { value: "+230", label: "Clínicas verificadas" },
  { value: "98%", label: "Reservas confirmadas" },
  { value: "<2 min", label: "Tiempo promedio de reserva" }
];

const strengths = [
  { title: "Confianza y seguridad", icon: ShieldCheck, text: "Clínicas verificadas, historial centralizado y control de sesiones." },
  { title: "Flujo sin fricción", icon: Clock3, text: "Reserva en pocos pasos con slots claros y confirmación inmediata." },
  { title: "Experiencia pet-first", icon: HeartPulse, text: "Pensado para dueños, mascotas y equipos veterinarios." }
];

const testimonials = [
  {
    author: "Laura M.",
    role: "Cliente frecuente",
    text: "Pasé de llamar por teléfono a reservar en segundos. Ahora tengo el historial de mis mascotas siempre a mano.",
    score: 5
  },
  {
    author: "Clínica San Paw",
    role: "Equipo operativo",
    text: "Bajamos cancelaciones y mejoramos ocupación de agenda desde el primer mes.",
    score: 5
  }
];

const productProgress = [
  { module: "Acceso y sesiones", status: "Operativo", href: "/login" },
  { module: "Catalogo de clinicas", status: "Operativo", href: "/clinics" },
  { module: "Reservas y horarios", status: "Operativo", href: "/bookings" },
  { module: "Perfil y notificaciones", status: "Operativo", href: "/profile" },
  { module: "Actividad y trazabilidad", status: "Operativo", href: "/activity" }
] as const;

export default function LandingPage() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <main className="pb-12">
      {/* Hero Section con animaciones profesionales */}
      <HeroSection
        title="Agenda citas para tus mascotas con clínicas verificadas cerca de ti"
        subtitle="Una experiencia moderna y confiable para familias pet, clínicas y equipos operativos"
        cta={{ text: "Buscar clínicas", href: "/clinics" }}
      />

      <section className="mt-12">
        <div className="rounded-2xl border border-[#dbe5fb] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">Estado del frontend</p>
              <h3 className="mt-1 text-2xl font-bold text-navy">Producto estable y listo para demo</h3>
              <p className="mt-1 text-sm text-soft">Recorre los modulos para validar la experiencia completa de principio a fin.</p>
            </div>
            <span className="rounded-full bg-[#e8f7ee] px-3 py-1 text-xs font-bold text-[#166534]">Release tecnico validado</span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {productProgress.map((item) => (
              <Link
                key={item.module}
                href={item.href}
                className="flex items-center justify-between rounded-xl border border-[#e5eaf5] px-4 py-3 transition hover:border-brand/40 hover:bg-sky"
              >
                <span className="text-sm font-semibold text-navy">{item.module}</span>
                <span className="rounded-full bg-[#e8f7ee] px-2 py-1 text-[11px] font-bold text-[#166534]">{item.status}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Divisor animado */}
      <SectionDivider />

      {/* Sección de estadísticas de prueba con animaciones */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-navy mb-4">Números que hablan</h2>
          <RevealText>Confía en una plataforma construida sobre datos reales y usuarios satisfechos</RevealText>
        </div>
        <ProofStatsSection stats={proofStats} />
      </section>

      <SectionDivider />

      {/* Sección de servicios */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-navy mb-8">Servicios disponibles</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map(({ title, icon: Icon }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg"
            >
              <span className="inline-flex rounded-lg bg-white p-3 mb-4">
                <Icon className="w-6 h-6 text-blue-600" />
              </span>
              <p className="font-semibold text-navy">{title}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Sección de fortalezas con componentes animados */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-navy mb-8">¿Por qué elegir PET QUOTES?</h3>
        <div className="grid gap-6 md:grid-cols-3">
          {strengths.map((strength) => (
            <AnimatedFeatureCard key={strength.title} feature={strength} />
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* Sección de clínicas destacadas */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-navy mb-8">Veterinarias destacadas</h3>
        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((clinic, index) => (
            <motion.div
              key={clinic.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all"
            >
              <Image
                src={clinic.image}
                alt={clinic.name}
                width={1000}
                height={600}
                className="h-64 w-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <h4 className="text-xl font-bold mb-2">{clinic.name}</h4>
                <p className="text-sm text-gray-200">
                  ⭐ {clinic.rating} • 📍 {clinic.distance}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* Sección de testimonios */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-navy mb-8">Lo que dicen nuestros usuarios</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.author + testimonial.role} testimonial={testimonial} />
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* Sección de estado del producto */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-100 mb-2">Estado del frontend</p>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">Producto estable y listo para demo</h3>
              <p className="text-blue-100 max-w-xl">Recorre los módulos para validar la experiencia completa de principio a fin.</p>
            </div>
            <span className="inline-flex rounded-full bg-green-400 text-green-900 px-4 py-2 font-semibold whitespace-nowrap">
              ✓ Release técnico validado
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {productProgress.map((item) => (
              <Link
                key={item.module}
                href={item.href}
                className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur transition-colors group"
              >
                <span className="font-semibold group-hover:text-yellow-200 transition-colors">{item.module}</span>
                <span className="bg-green-400 text-green-900 px-3 py-1 rounded-full text-xs font-bold">
                  {item.status}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      <SectionDivider />

      {/* Sección de beneficios */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: "Beneficios para clientes",
              description:
                "Historial de mascotas, reservas rápidas, recordatorios y acceso a clínicas por ubicación y servicio.",
              icon: "🐾"
            },
            {
              title: "Beneficios para veterinarias",
              description:
                "Gestión de agenda, ocupación inteligente, menor fricción operativa y más retención de clientes.",
              icon: "🏥"
            }
          ].map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="p-8 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 hover:border-purple-400 transition-all"
            >
              <span className="text-4xl mb-4 block">{benefit.icon}</span>
              <h4 className="text-2xl font-bold text-navy mb-3">{benefit.title}</h4>
              <p className="text-gray-700 leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-blue-900 to-purple-900 p-12 text-white shadow-2xl"
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 opacity-20 blur-3xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500 rounded-full animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <h4 className="text-4xl md:text-5xl font-bold mb-6">
              Activa una experiencia de reservas que da confianza desde la primera cita
            </h4>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl">
              Empieza hoy y centraliza agenda, clientes y mascotas en un solo flujo.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/clinics">
                <Button className="px-8 py-3 bg-white text-blue-900 hover:bg-blue-50 font-semibold">
                  Explorar catálogo
                </Button>
              </Link>
              <Link href="/bookings">
                <Button className="px-8 py-3 bg-blue-600 text-white hover:bg-blue-700 font-semibold border border-blue-400">
                  Ir a reservas
                </Button>
              </Link>
              <button
                onClick={() => setAboutOpen(true)}
                className="px-8 py-3 border-2 border-white/50 text-white hover:border-white hover:bg-white/10 rounded-lg font-semibold transition-all"
              >
                Ver base del frontend
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Modal */}
      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="Base del Frontend">
        <div className="space-y-4">
          <p className="text-gray-700">
            Nuestro frontend está construido sobre una base sólida y escalable con las mejores prácticas modernas:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✓ Layout principal con componentes reutilizables</li>
            <li>✓ Sistema de diseño con tokens y Tailwind CSS</li>
            <li>✓ Animaciones profesionales con GSAP y Framer Motion</li>
            <li>✓ Estado global centralizado</li>
            <li>✓ Cliente API centralizado con React Query</li>
            <li>✓ TypeScript para mayor seguridad de tipos</li>
          </ul>
        </div>
      </Modal>
    </main>
  );
}
