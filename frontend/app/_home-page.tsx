"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Search, ArrowRight, ShieldCheck, Zap, ClipboardList, Bell, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceCard } from "@/components/ui/service-card";
import { CTA } from "@/components/sections/cta-section";
import { PlayfulPets, PetsParade, FloatingPets } from "@/components/animations/pet-animations";
import { ScrollReactivePets } from "@/components/animations/scroll-reactive-pets";
import { AdvancedSearch } from "@/components/search/advanced-search";
import { DURATIONS } from "@/constants/animations";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function HomePageClient() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactStatus, setContactStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [contactError, setContactError] = useState("");
  const prefersReducedMotion = useReducedMotion();

  const handleSelectCity = (city: string) => {
    router.push(`/clinics?city=${city}`);
  };

  const handleSelectNeighborhood = (neighborhood: string, city: string) => {
    router.push(`/clinics?city=${city}&neighborhood=${neighborhood}`);
  };

  const handleSelectClinic = (clinicId: string) => {
    router.push(`/clinics/${clinicId}`);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus("loading");
    setContactError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Error enviando el mensaje");
      }
      setContactStatus("success");
      setContactForm({ name: "", email: "", message: "" });
    } catch (err: unknown) {
      setContactError(err instanceof Error ? err.message : "Error enviando el mensaje");
      setContactStatus("error");
    }
  };

  const services = [
    {
      icon: "🩺",
      title: "Consulta Veterinaria",
      description: "Diagnósticos y tratamientos de expertos",
      href: "/services/consulta-veterinaria",
      color: "primary" as const,
    },
    {
      icon: "✂️",
      title: "Baño & Grooming",
      description: "Cuidado profesional para tu mascota",
      href: "/services/bano-grooming",
      color: "mint" as const,
    },
    {
      icon: "💉",
      title: "Vacunación",
      description: "Inmunización completa y segura",
      href: "/services/vacunacion",
      color: "secondary" as const,
    },
    {
      icon: "✨",
      title: "Estética",
      description: "Belleza y bienestar para tu pet",
      href: "/services/estetica",
      color: "accent" as const,
    },
  ];

  const benefits = [
    {
      icon: ShieldCheck,
      title: "Clínicas Verificadas",
      description: "Solo trabajamos con veterinarias que cumplen estándares de calidad y tienen reseñas reales.",
      color: "primary" as const,
    },
    {
      icon: Zap,
      title: "Reserva Instantánea",
      description: "Sin llamadas ni esperas. Elige horario, confirma y listo — todo desde la app.",
      color: "mint" as const,
    },
    {
      icon: ClipboardList,
      title: "Historial Centralizado",
      description: "El historial médico de tu mascota siempre accesible, organizado y listo para compartir.",
      color: "secondary" as const,
    },
    {
      icon: Bell,
      title: "Notificaciones Automáticas",
      description: "Recordatorios de citas, confirmaciones y alertas de salud directo a tu correo.",
      color: "accent" as const,
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
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/8 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-mint/5 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent" />
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
              <Badge className="px-3 sm:px-6 py-2 bg-primary/20 border-primary/50 text-sm sm:text-lg text-center">
                🐾 Cuidado veterinario, simplificado
              </Badge>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              className={cn(
                "text-4xl sm:text-6xl lg:text-8xl font-black",
                "text-foreground leading-tight tracking-tight"
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
              Veterinarias Premium
              <br />
              en Tus Manos
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-base sm:text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed"
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

            {/* Search Bar with Advanced Features */}
            <motion.div
              className="flex flex-col gap-4 justify-center max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: DURATIONS.base / 1000 }}
            >
              <AdvancedSearch
                value={searchQuery}
                onChange={setSearchQuery}
                onSelectCity={handleSelectCity}
                onSelectNeighborhood={handleSelectNeighborhood}
                onSelectClinic={handleSelectClinic}
                placeholder="Busca por barrio, ciudad, clínica o servicio..."
              />
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
                    animate={prefersReducedMotion ? {} : { x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight size={20} />
                  </motion.span>
                </Button>
              </Link>
              <p className="text-sm text-text-secondary">
                Gratis para dueños de mascotas — siempre
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1 h-2 bg-primary rounded-full"
              animate={prefersReducedMotion ? {} : { opacity: [1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="relative py-32 bg-gradient-to-b from-surface/10 via-surface/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
          >
            <motion.h2
              className={cn(
                "text-5xl sm:text-6xl font-black mb-6",
                "bg-gradient-to-r from-primary-600 via-secondary-400 to-mint-500 bg-clip-text text-transparent"
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: false }}
            >
              Servicios Completos
            </motion.h2>
            <motion.p
              className="text-lg font-semibold text-text-secondary max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
              viewport={{ once: false }}
            >
              Todo lo que tu mascota necesita en un solo lugar
            </motion.p>
          </motion.div>

          {/* Services Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                  delay: index * 0.1,
                }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <ServiceCard
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  href={service.href}
                  color={service.color}
                  delay={index * 0.05}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Decorative spacing */}
      <div className="h-12" />

      {/* Benefits Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-5">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className={cn(
              "text-5xl sm:text-6xl font-black mb-4",
              "bg-gradient-to-r from-primary-600 via-secondary-400 to-mint-500 bg-clip-text text-transparent"
            )}>
              Por Qué PetQuotes
            </h2>
            <p className="text-lg font-semibold text-text-primary max-w-2xl mx-auto">
              Todo lo que necesitas para cuidar a tu mascota, sin complicaciones
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
            viewport={{ once: false, amount: 0.2 }}
          >
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.08 }}
                  viewport={{ once: false, amount: 0.3 }}
                  className={cn(
                    "relative overflow-hidden rounded-2xl p-8",
                    "bg-surface border border-border/30",
                    "hover:border-secondary/50 transition-all duration-300",
                    "hover:shadow-lg hover:shadow-secondary/20"
                  )}
                  whileHover={{ y: -4, transition: { duration: 0.3 } }}
                >
                  {/* Top Accent */}
                  <motion.div
                    className={cn(
                      "absolute top-0 left-0 h-1 w-12",
                      benefit.color === "primary" && "bg-primary",
                      benefit.color === "secondary" && "bg-secondary",
                      benefit.color === "mint" && "bg-mint",
                      benefit.color === "accent" && "bg-accent",
                    )}
                    initial={{ width: 0 }}
                    whileInView={{ width: 48 }}
                    transition={{ delay: index * 0.05 + 0.2, duration: 0.6 }}
                    viewport={{ once: true }}
                  />

                  {/* Icon */}
                  <div className={cn(
                    "mb-6 mt-2 w-12 h-12 rounded-xl flex items-center justify-center",
                    benefit.color === "primary" && "bg-primary/15 text-primary",
                    benefit.color === "secondary" && "bg-secondary/15 text-secondary",
                    benefit.color === "mint" && "bg-mint/15 text-mint",
                    benefit.color === "accent" && "bg-accent/15 text-accent",
                  )}>
                    <Icon size={24} />
                  </div>

                  <h3 className="text-lg font-bold text-text-primary mb-3">{benefit.title}</h3>
                  <p className="text-sm font-medium text-text-secondary leading-relaxed">{benefit.description}</p>

                  {/* Background Accent */}
                  <div className={cn(
                    "absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-10",
                    benefit.color === "primary" && "bg-primary",
                    benefit.color === "secondary" && "bg-secondary",
                    benefit.color === "mint" && "bg-mint",
                    benefit.color === "accent" && "bg-accent",
                  )} />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATIONS.base / 1000 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className={cn(
                "text-4xl sm:text-5xl font-bold mb-4",
                "bg-gradient-to-r from-primary-600 via-secondary-400 to-mint-500 bg-clip-text text-transparent"
              )}
            >
              Tan Simple Como
            </motion.h2>
            <p className="text-text-secondary text-lg">Tres pasos, cero complicaciones</p>
          </motion.div>

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
                color: "primary",
                emoji: "🔍",
              },
              {
                step: "02",
                title: "Compara",
                desc: "Compara precios, horarios, ratings y experiencias reales",
                color: "mint",
                emoji: "📊",
              },
              {
                step: "03",
                title: "Reserva",
                desc: "Confirma tu cita en segundos con notificaciones automáticas",
                color: "secondary",
                emoji: "✅",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATIONS.base / 1000, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={cn(
                  "relative p-8 rounded-2xl overflow-hidden",
                  "bg-surface border border-border/30",
                  "transition-all duration-300",
                  item.color === "primary" && "hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10",
                  item.color === "mint" && "hover:border-mint/50 hover:shadow-xl hover:shadow-mint/10",
                  item.color === "secondary" && "hover:border-secondary/50 hover:shadow-xl hover:shadow-secondary/10",
                )}
                whileHover={{ y: -8 }}
              >
                {/* Colored top accent bar */}
                <div className={cn(
                  "absolute top-0 left-0 right-0 h-1 rounded-t-2xl",
                  item.color === "primary" && "bg-gradient-to-r from-primary to-primary/40",
                  item.color === "mint" && "bg-gradient-to-r from-mint to-mint/40",
                  item.color === "secondary" && "bg-gradient-to-r from-secondary to-secondary/40",
                )} />

                {/* Step number + emoji row */}
                <div className="flex items-center justify-between mb-6 mt-2">
                  <span className={cn(
                    "text-5xl font-black leading-none",
                    item.color === "primary" && "text-primary/15",
                    item.color === "mint" && "text-mint/15",
                    item.color === "secondary" && "text-secondary/15",
                  )}>
                    {item.step}
                  </span>
                  <span className="text-3xl">{item.emoji}</span>
                </div>

                <h3 className="text-2xl font-bold text-text-primary mb-3">{item.title}</h3>
                <p className="text-text-secondary leading-relaxed">{item.desc}</p>

                {/* Arrow Connector */}
                {idx < 2 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight size={28} className={cn(
                      item.color === "primary" && "text-primary/40",
                      item.color === "mint" && "text-mint/40",
                    )} />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-32 bg-gradient-to-b from-transparent via-surface/20 to-surface/10 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-5">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className={cn(
              "text-5xl sm:text-6xl font-black mb-4",
              "bg-gradient-to-r from-primary-600 via-secondary-400 to-mint-500 bg-clip-text text-transparent"
            )}>
              Déjanos tus Dudas
            </h2>
            <p className="text-lg font-semibold text-text-primary max-w-xl mx-auto">
              ¿Tienes alguna pregunta o inquietud? Escríbenos y te respondemos pronto.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            viewport={{ once: true, amount: 0.2 }}
            className="bg-surface border border-border/30 rounded-2xl p-8 shadow-lg"
          >
            {contactStatus === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-8 text-center"
              >
                <CheckCircle2 size={56} className="text-mint" />
                <h3 className="text-2xl font-bold text-text-primary">¡Mensaje enviado!</h3>
                <p className="text-text-secondary max-w-sm">
                  Recibimos tu consulta. Te responderemos al correo que nos dejaste a la brevedad.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setContactStatus("idle")}
                  className="mt-2"
                >
                  Enviar otra consulta
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-text-primary">Nombre</label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={100}
                      value={contactForm.name}
                      onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Tu nombre"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl text-sm font-medium",
                        "bg-background border border-border/50 text-text-primary",
                        "placeholder:text-text-secondary/50",
                        "focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20",
                        "transition-all duration-200"
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-text-primary">Correo electrónico</label>
                    <input
                      type="email"
                      required
                      maxLength={150}
                      value={contactForm.email}
                      onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="tu@correo.com"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl text-sm font-medium",
                        "bg-background border border-border/50 text-text-primary",
                        "placeholder:text-text-secondary/50",
                        "focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20",
                        "transition-all duration-200"
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-text-primary">Mensaje</label>
                  <textarea
                    required
                    minLength={10}
                    maxLength={1000}
                    rows={5}
                    value={contactForm.message}
                    onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Cuéntanos tu duda o inquietud..."
                    className={cn(
                      "w-full px-4 py-3 rounded-xl text-sm font-medium resize-none",
                      "bg-background border border-border/50 text-text-primary",
                      "placeholder:text-text-secondary/50",
                      "focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20",
                      "transition-all duration-200"
                    )}
                  />
                </div>

                {contactStatus === "error" && (
                  <p className="text-sm text-red-500 font-medium">{contactError}</p>
                )}

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  disabled={contactStatus === "loading"}
                  className="w-full gap-2"
                >
                  {contactStatus === "loading" ? (
                    <>Enviando...</>
                  ) : (
                    <>
                      Enviar consulta
                      <Send size={16} />
                    </>
                  )}
                </Button>
              </form>
            )}
          </motion.div>
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
            variant="gradient"
            size="lg"
          />
        </div>
      </section>
    </main>
  );
}

