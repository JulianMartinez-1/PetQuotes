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
    <main className="page-container pb-12 pt-4">
      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="mb-3 inline-flex rounded-full bg-sky px-3 py-1 text-xs font-semibold text-brand">SaaS para ecosistema veterinario</p>
          <h2 className="text-4xl font-extrabold leading-tight text-navy md:text-5xl">Agenda citas para tus mascotas con clínicas verificadas cerca de ti.</h2>
          <p className="mt-4 max-w-xl text-soft">Una experiencia moderna y confiable para familias pet, clinicas y equipos operativos.</p>
          <div className="mt-6 grid gap-3 rounded-2xl border border-[#dbe5fb] bg-white p-4 md:grid-cols-[1fr_auto]">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-brand" />
              <Input placeholder="Ej: Chapinero, Bogota" />
            </div>
            <Link href="/clinics">
              <Button type="button">Buscar clinicas</Button>
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {proofStats.map((item) => (
              <div key={item.label} className="rounded-xl border border-[#e5eaf5] bg-white px-4 py-3">
                <p className="text-xl font-extrabold text-navy">{item.value}</p>
                <p className="text-xs font-semibold text-soft">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-[#e5eaf5] bg-white p-4 text-sm text-navy"
              >
                <span className="mb-2 block text-xs font-bold text-brand">Paso {i + 1}</span>
                {step}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 }}>
          <ClinicMap />
        </motion.div>
      </section>

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

      <section className="mt-12">
        <h3 className="text-2xl font-bold text-navy">Servicios</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {services.map(({ title, icon: Icon }) => (
            <Card key={title} className="flex items-center gap-3">
              <span className="rounded-xl bg-sky p-2"><Icon className="h-5 w-5 text-brand" /></span>
              <p className="font-semibold text-navy">{title}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h3 className="text-2xl font-bold text-navy">Por qué elegir PET QUOTES</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {strengths.map(({ title, icon: Icon, text }) => (
            <Card key={title}>
              <span className="inline-flex rounded-xl bg-sky p-2"><Icon className="h-5 w-5 text-brand" /></span>
              <h4 className="mt-3 text-lg font-bold text-navy">{title}</h4>
              <p className="mt-2 text-sm text-soft">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h3 className="text-2xl font-bold text-navy">Veterinarias destacadas</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {featured.map((clinic) => (
            <Card key={clinic.name} className="p-0 overflow-hidden">
              <Image src={clinic.image} alt={clinic.name} width={1000} height={600} className="h-40 w-full object-cover" />
              <div className="p-5">
                <h4 className="text-lg font-bold text-navy">{clinic.name}</h4>
                <p className="text-sm text-soft">Rating {clinic.rating} • {clinic.distance}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-2">
        <Card>
          <h4 className="text-lg font-bold text-navy">Beneficios para clientes</h4>
          <p className="mt-2 text-sm text-soft">Historial de mascotas, reservas rápidas, recordatorios y acceso a clínicas por ubicación y servicio.</p>
        </Card>
        <Card>
          <h4 className="text-lg font-bold text-navy">Beneficios para veterinarias</h4>
          <p className="mt-2 text-sm text-soft">Gestión de agenda, ocupación inteligente, menor fricción operativa y más retención de clientes.</p>
        </Card>
      </section>

      <section className="mt-12">
        <h3 className="text-2xl font-bold text-navy">Lo que dicen nuestros usuarios</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {testimonials.map((item) => (
            <Card key={item.author + item.role}>
              <div className="mb-3 flex items-center gap-1 text-[#f59e0b]">
                {Array.from({ length: item.score }).map((_, i) => (
                  <Star key={`${item.author}-${i}`} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-navy">&ldquo;{item.text}&rdquo;</p>
              <p className="mt-4 text-sm font-bold text-navy">{item.author}</p>
              <p className="text-xs font-semibold text-soft">{item.role}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl bg-navy p-8 text-white">
        <h4 className="text-3xl font-bold">Activa una experiencia de reservas que da confianza desde la primera cita</h4>
        <p className="mt-3 text-sm text-[#c6d4f4]">Empieza hoy y centraliza agenda, clientes y mascotas en un solo flujo.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/clinics">
            <Button>Explorar catalogo</Button>
          </Link>
          <Link href="/bookings">
            <Button variant="secondary">Ir a reservas</Button>
          </Link>
          <Button type="button" variant="ghost" className="border-white/35 bg-transparent text-white hover:bg-white/10" onClick={() => setAboutOpen(true)}>
            Ver base del frontend
          </Button>
        </div>
      </section>

      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="Base del Frontend">
        <p className="text-sm text-soft">
          Layout principal, sistema de diseno con tokens, componentes reutilizables, estado global y cliente API centralizado.
        </p>
      </Modal>
    </main>
  );
}
