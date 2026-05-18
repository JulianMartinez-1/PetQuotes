"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FeaturesGrid } from "@/components/sections/features-section";
import { StatsGrid } from "@/components/sections/stats-section";
import { CTA } from "@/components/sections/cta-section";
import { TestimonialsGrid } from "@/components/sections/testimonials-section";
import { PlayfulPets, PetsParade, FloatingPets } from "@/components/animations/pet-animations";
import { ScrollReactivePets } from "@/components/animations/scroll-reactive-pets";
import { DURATIONS } from "@/constants/animations";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const services = [
    {
      icon: "🩺",
      title: "Consulta Veterinaria",
      description: "Diagnósticos y tratamientos de expertos",
      color: "orange" as const,
    },
    {
      icon: "✂️",
      title: "Baño & Grooming",
      description: "Cuidado profesional para tu mascota",
      color: "green" as const,
    },
    {
      icon: "💉",
      title: "Vacunación",
      description: "Inmunización completa y segura",
      color: "teal" as const,
    },
    {
      icon: "✨",
      title: "Estética",
      description: "Belleza y bienestar para tu pet",
      color: "warning" as const,
    },
  ];

  const stats = [
    {
      label: "Clínicas Verificadas",
      value: 250,
      color: "orange" as const,
      description: "En toda la región",
    },
    {
      label: "Mascotas Felices",
      value: 15000,
      suffix: "+",
      color: "green" as const,
      description: "Cuidadas este año",
    },
    {
      label: "Citas Reservadas",
      value: 98,
      suffix: "%",
      color: "teal" as const,
      description: "Tasa de confirmación",
    },
    {
      label: "Tiempo Promedio",
      value: 2,
      color: "warning" as const,
      description: "Minutos para reservar",
    },
  ];

  const testimonials = [
    {
      name: "María González",
      role: "Dueña de Luna",
      company: "La Floresta",
      content:
        "Encontré la mejor clínica para mi gato en minutos. El servicio fue excelente y Luna está mucho mejor.",
      rating: 5,
      color: "orange" as const,
    },
    {
      name: "Carlos Ruiz",
      role: "Dueño de Max",
      company: "Zona Centro",
      content:
        "Aplicación intuitiva y fácil de usar. Recomendado a todos mis amigos con mascotas.",
      rating: 5,
      color: "green" as const,
    },
    {
      name: "Ana Martínez",
      role: "Dueña de Bella",
      company: "Norte",
      content:
        "Finalmente un lugar donde confiar. Las clínicas verificadas dan total tranquilidad.",
      rating: 5,
      color: "teal" as const,
    },
  ];

  return (
    <main className="overflow-hidden bg-background relative">
      {/* Decorative Scroll Reactive Pets */}
      <ScrollReactivePets position="left" offset={0} />
      <ScrollReactivePets position="right" offset={200} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20">
        {/* Background Gradient Animation */}
        <motion.div
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute top-20 left-10 w-96 h-96 bg-orange/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-green/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-teal/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-surface/30 via-transparent to-transparent" />
        </motion.div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATIONS.base / 1000 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: DURATIONS.fast / 1000 }}
              className="flex justify-center"
            >
              <Badge className="px-6 py-2 bg-orange/20 border-orange/50 text-lg">
                🐾 Cuidado veterinario, simplificado
              </Badge>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              className={cn(
                "text-6xl sm:text-7xl lg:text-8xl font-black",
                "bg-gradient-to-r from-orange via-text-primary to-green",
                "bg-clip-text text-transparent leading-tight tracking-tight"
              )}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: 0.2,
                duration: DURATIONS.base / 1000,
                type: "spring",
                stiffness: 100,
              }}
            >
              Veterinarios Premium
              <br />
              en Tus Manos
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl sm:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: DURATIONS.base / 1000 }}
            >
              Reserva citas con clínicas verificadas en segundos. Monitorea la
              salud de tu mascota en tiempo real con la plataforma más confiable.
            </motion.p>

            {/* Playful Pets Animation */}
            <motion.div
              className="py-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: DURATIONS.base / 1000 }}
            >
              <PlayfulPets count={3} className="justify-center gap-12" />
            </motion.div>

            {/* Search Bar */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: DURATIONS.base / 1000 }}
            >
              <div className="flex-1 relative group">
                <MapPin
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-orange opacity-60"
                  size={20}
                />
                <Input
                  type="text"
                  placeholder="Tu ubicación o zona..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-base shadow-lg"
                  variant="default"
                />
              </div>
              <Link href="/clinics">
                <Button
                  variant="primary"
                  size="lg"
                  className="h-14 gap-3 w-full sm:w-auto shadow-lg shadow-orange/20"
                >
                  <Search size={20} />
                  <span>Buscar</span>
                </Button>
              </Link>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              className="flex flex-col gap-4 justify-center items-center pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: DURATIONS.base / 1000 }}
            >
              <Link href="/clinics">
                <Button
                  variant="gradient"
                  size="lg"
                  className="gap-3 px-8"
                >
                  Explorar Clínicas
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight size={20} />
                  </motion.span>
                </Button>
              </Link>
              <p className="text-sm text-text-tertiary">
                ✨ Únete a más de 15,000 dueños de mascotas satisfechos
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-orange/30 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1 h-2 bg-orange rounded-full"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="relative py-32 bg-gradient-to-b from-surface/10 via-surface/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturesGrid
            title="Servicios Completos"
            subtitle="Todo lo que tu mascota necesita en un solo lugar"
            features={services}
            columns={4}
          />
        </div>
      </section>

      {/* Decorative spacing */}
      <div className="h-12" />

      {/* Stats Section */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StatsGrid
            title="Números que Hablan"
            subtitle="Confianza y satisfacción en cada cifra"
            stats={stats}
            columns={4}
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className={cn(
              "text-4xl sm:text-5xl font-bold mb-16 text-center",
              "bg-gradient-to-r from-orange via-text-primary to-green bg-clip-text text-transparent"
            )}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATIONS.base / 1000 }}
            viewport={{ once: true }}
          >
            Tan Simple Como
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              {
                step: "01",
                title: "Busca",
                desc: "Encuentra clínicas por ubicación, servicio y disponibilidad",
                color: "orange",
              },
              {
                step: "02",
                title: "Compara",
                desc: "Compara precios, horarios, ratings y experiencias",
                color: "green",
              },
              {
                step: "03",
                title: "Reserva",
                desc: "Confirma tu cita en segundos con notificaciones automáticas",
                color: "teal",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATIONS.base / 1000 }}
                viewport={{ once: true }}
                className={cn(
                  "relative p-8 rounded-2xl",
                  "bg-surface border border-border/30",
                  "transition-all duration-300",
                  item.color === "orange" && "hover:border-orange/50 hover:shadow-lg hover:shadow-orange/20",
                  item.color === "green" && "hover:border-green/50 hover:shadow-lg hover:shadow-green/20",
                  item.color === "teal" && "hover:border-teal/50 hover:shadow-lg hover:shadow-teal/20",
                )}
                whileHover={{ y: -8 }}
              >
                {/* Step Number */}
                <div className={cn(
                  "text-6xl font-bold mb-4",
                  item.color === "orange" && "text-orange/20",
                  item.color === "green" && "text-green/20",
                  item.color === "teal" && "text-teal/20",
                )}>
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-3">
                  {item.title}
                </h3>
                <p className="text-text-secondary">{item.desc}</p>

                {/* Arrow Connector */}
                {idx < 2 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2">
                    <ArrowRight size={32} className={cn(
                      item.color === "orange" && "text-orange/30",
                      item.color === "green" && "text-green/30",
                      item.color === "teal" && "text-teal/30",
                    )} />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-32 bg-gradient-to-b from-transparent via-surface/20 to-surface/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TestimonialsGrid
            title="Lo que Dicen Nuestros Usuarios"
            subtitle="Historias de mascotas felices y dueños satisfechos"
            testimonials={testimonials}
          />
        </div>
      </section>

      {/* Decorative spacing */}
      <div className="h-12" />

      {/* Final CTA */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CTA
            title="¿Listo para Cuidar a Tu Mascota?"
            subtitle="Únete a miles de dueños que ya confían en PetQuotes"
            primaryText="Empezar Ahora"
            primaryHref="/clinics"
            secondaryText="Más Información"
            secondaryHref="/"
            variant="gradient"
            size="lg"
          />
        </div>
      </section>
    </main>
  );
}
