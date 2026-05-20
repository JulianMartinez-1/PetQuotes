"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpecializedClinics } from "@/components/sections/specialized-clinics-api";
import { ScrollReactivePets } from "@/components/animations/scroll-reactive-pets";

export default function BanoGrooming() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const services = [
    {
      icon: "🚿",
      title: "Baño Completo",
      description: "Limpieza profunda con shampoos y acondicionadores de calidad premium",
    },
    {
      icon: "✂️",
      title: "Corte de Pelo",
      description: "Cortes profesionales adaptados a la raza y preferencias de tu mascota",
    },
    {
      icon: "💅",
      title: "Corte de Uñas",
      description: "Recorte seguro y profesional de uñas con cuidado especializado",
    },
    {
      icon: "👂",
      title: "Limpieza de Oídos",
      description: "Limpieza profunda e higiene de oídos para prevenir infecciones",
    },
  ];

  const benefits = [
    "Mantiene el pelaje limpio y saludable",
    "Previene problemas de piel y alergias",
    "Mejora la apariencia y comodidad de tu mascota",
    "Exfoliación natural y eliminación de pelo muerto",
    "Relajación y bienestar emocional",
    "Detección temprana de problemas de salud",
  ];

  const clinics = [
    {
      id: "1",
      name: "Grooming Studio Premium",
      specialty: "Baño, Corte y Peluquería Canina",
      rating: 4.9,
      reviews: 428,
      address: "Calle 50 #12-34, Zona Moderna",
      distance: "1.8 km de ti",
      hours: "Mar-Dom 9am - 6pm",
      badge: "Elite",
      color: "primary" as const,
    },
    {
      id: "2",
      name: "Pet Spa Deluxe",
      specialty: "Grooming Profesional y Spa",
      rating: 4.8,
      reviews: 356,
      address: "Carrera 9 #67-89, La Floresta",
      distance: "2.9 km de ti",
      hours: "Lun-Dom 8am - 7pm",
      badge: "Premium",
      color: "secondary" as const,
    },
    {
      id: "3",
      name: "Beauty Pets Center",
      specialty: "Grooming y Estética Canina",
      rating: 4.7,
      reviews: 302,
      address: "Avenida 15 #23-45, Centro",
      distance: "3.5 km de ti",
      hours: "Lun-Sab 10am - 6pm",
      color: "mint" as const,
    },
  ];

  return (
    <>
      <ScrollReactivePets />
      
      {/* Header with Back Button */}
      <div className="bg-gradient-to-r from-green/5 to-green/10 border-b-2 border-green/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-green hover:text-green-dark">
              <ArrowLeft size={20} className="mr-2" />
              Volver al Inicio
            </Button>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">✂️</div>
              <h1 className="text-4xl sm:text-5xl font-black text-green">
                Baño & Grooming
              </h1>
            </div>
            <p className="text-lg text-textSecondary max-w-2xl">
              Servicios profesionales de peluquería y estética para mantener a tu mascota limpia y hermosa
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Overview Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="mb-20"
        >
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-3xl font-black text-green mb-6">¿Qué incluye el Baño & Grooming?</h2>
            <p className="text-lg text-textSecondary leading-relaxed mb-4">
              El baño y grooming profesional es mucho más que limpiar a tu mascota. Es un servicio integral que incluye
              higiene profunda, corte personalizado, cuidado de uñas y revisión de salud dermatológica.
            </p>
            <p className="text-lg text-textSecondary leading-relaxed">
              Nuestros gromers certificados utilizan productos de calidad premium, técnicas suaves y enfoque
              individualizado para cada mascota, garantizando que tu pet se sienta cómodo y luzca espectacular.
            </p>
          </motion.div>
        </motion.section>

        {/* Services Grid */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="mb-20"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-black text-green mb-12">
            Servicios Incluidos
          </motion.h2>
          
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
          >
            {services.map((service, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <div className="bg-white rounded-2xl border-2 border-green/20 p-8 hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold text-green mb-3">{service.title}</h3>
                  <p className="text-textSecondary leading-relaxed">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Benefits */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="mb-20"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-black text-green mb-8">
            Beneficios para tu Mascota
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, idx) => (
              <motion.div key={idx} variants={itemVariants} className="flex items-start gap-3">
                <CheckCircle2 size={24} className="text-green flex-shrink-0 mt-1" />
                <span className="text-lg text-textSecondary">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Important Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="bg-green-50 border-l-4 border-green rounded-r-lg p-6 mb-20"
        >
          <div className="flex gap-4">
            <Info className="text-green flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-green mb-2">Recomendación de Frecuencia</h3>
              <p className="text-textSecondary">
                Se recomienda un baño y grooming cada 4-8 semanas dependiendo del tipo de pelaje de tu mascota.
                Razas con pelaje largo requieren atención más frecuente.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Specialized Clinics Section */}
      <SpecializedClinics
        serviceType="bano-grooming"
        serviceTitle="Baño & Grooming"
        limit={6}
      />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green to-green-dark text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-black mb-6"
          >
            ¡Dale a tu mascota el cuidado que merece!
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg mb-8 opacity-95"
          >
            Reserva ahora con nuestros gromers profesionales
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/bookings">
              <Button size="lg" className="bg-white text-green hover:bg-gray-100 font-bold">
                Agendar Ahora
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
