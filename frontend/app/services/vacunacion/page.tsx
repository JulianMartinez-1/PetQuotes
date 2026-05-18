"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpecializedClinics } from "@/components/sections/specialized-clinics";
import { ScrollReactivePets } from "@/components/animations/scroll-reactive-pets";

export default function Vacunacion() {
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

  const vaccines = [
    {
      icon: "💉",
      title: "Vacuna Polivalente",
      description: "Protección contra moquillo, parvovirosis y otras enfermedades virales",
    },
    {
      icon: "🦠",
      title: "Vacuna Antirrábica",
      description: "Protección fundamental contra la rabia, enfermedad mortal",
    },
    {
      icon: "🛡️",
      title: "Vacuna Leptospirosis",
      description: "Protección contra la leptospirosis, enfermedad bacteriana grave",
    },
    {
      icon: "📅",
      title: "Refuerzos Periódicos",
      description: "Recordatorios automáticos para mantener la inmunización al día",
    },
  ];

  const schedule = [
    {
      age: "4 semanas",
      vaccines: "Primera dosis polivalente",
    },
    {
      age: "8 semanas",
      vaccines: "Segunda dosis polivalente",
    },
    {
      age: "12 semanas",
      vaccines: "Tercera dosis polivalente + Antirrábica",
    },
    {
      age: "1 año",
      vaccines: "Refuerzos + Leptospirosis",
    },
    {
      age: "Adultos",
      vaccines: "Refuerzo anual o cada 3 años según vacuna",
    },
  ];

  const benefits = [
    "Previene enfermedades potencialmente mortales",
    "Protege a otras mascotas y a la comunidad",
    "Inmunidad de rebaño más fuerte",
    "Costo-efectivo comparado con tratamiento de enfermedades",
    "Requisito legal en muchas jurisdicciones",
    "Acceso a transporte y viajes internacionales",
  ];

  const clinics = [
    {
      id: "1",
      name: "Centro Inmunización Animal",
      specialty: "Vacunación y Profilaxis",
      rating: 4.9,
      reviews: 512,
      address: "Carrera 7 #34-56, Centro Médico",
      distance: "2.1 km de ti",
      hours: "Lun-Dom 7am - 6pm",
      badge: "Especializado",
      color: "teal" as const,
    },
    {
      id: "2",
      name: "Clínica Preventiva Mascotas",
      specialty: "Programas de Vacunación Completos",
      rating: 4.8,
      reviews: 439,
      address: "Avenida 5 #12-78, Zona Norte",
      distance: "3.2 km de ti",
      hours: "Lun-Sab 8am - 8pm",
      badge: "Recomendado",
      color: "teal" as const,
    },
    {
      id: "3",
      name: "Veterinaria Salud Integral",
      specialty: "Vacunación, Desparasitación y Chequeos",
      rating: 4.7,
      reviews: 378,
      address: "Calle 45 #67-89, La Floresta",
      distance: "4.1 km de ti",
      hours: "Lun-Dom 9am - 7pm",
      color: "teal" as const,
    },
  ];

  return (
    <>
      <ScrollReactivePets />
      
      {/* Header with Back Button */}
      <div className="bg-gradient-to-r from-teal/5 to-teal/10 border-b-2 border-teal/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-teal hover:text-teal-dark">
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
              <div className="text-5xl">💉</div>
              <h1 className="text-4xl sm:text-5xl font-black text-teal">
                Vacunación
              </h1>
            </div>
            <p className="text-lg text-textSecondary max-w-2xl">
              Protege a tu mascota con un programa completo de inmunización
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
            <h2 className="text-3xl font-black text-teal mb-6">¿Por qué es importante la vacunación?</h2>
            <p className="text-lg text-textSecondary leading-relaxed mb-4">
              La vacunación es la herramienta más efectiva para prevenir enfermedades infecciosas graves en
              mascotas. Protege a tu perro o gato de virus y bacterias potencialmente mortales, garantizando
              una vida larga y saludable.
            </p>
            <p className="text-lg text-textSecondary leading-relaxed">
              En PetQuotes, te ayudamos a mantener un calendario de vacunación actualizado con recordatorios
              automáticos y acceso a veterinarios especializados en inmunología animal.
            </p>
          </motion.div>
        </motion.section>

        {/* Vaccines Grid */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="mb-20"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-black text-teal mb-12">
            Vacunas Disponibles
          </motion.h2>
          
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
          >
            {vaccines.map((vaccine, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <div className="bg-white rounded-2xl border-2 border-teal/20 p-8 hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{vaccine.icon}</div>
                  <h3 className="text-xl font-bold text-teal mb-3">{vaccine.title}</h3>
                  <p className="text-textSecondary leading-relaxed">{vaccine.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Vaccination Schedule */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="mb-20"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-black text-teal mb-8">
            Calendario de Vacunación Recomendado
          </motion.h2>
          
          <div className="space-y-4">
            {schedule.map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="flex items-start gap-4 bg-white rounded-xl border-2 border-teal/20 p-6 hover:shadow-lg transition-shadow"
              >
                <CheckCircle2 size={28} className="text-teal flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-bold text-teal text-lg mb-1">{item.age}</h4>
                  <p className="text-textSecondary">{item.vaccines}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Benefits */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="mb-20"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-black text-teal mb-8">
            Beneficios de Vacunar a tu Mascota
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, idx) => (
              <motion.div key={idx} variants={itemVariants} className="flex items-start gap-3">
                <CheckCircle2 size={24} className="text-teal flex-shrink-0 mt-1" />
                <span className="text-lg text-textSecondary">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Important Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-6 mb-20"
        >
          <div className="flex gap-4">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-amber-900 mb-2">Importante</h3>
              <p className="text-amber-800">
                Consulta con tu veterinario sobre el programa de vacunación más adecuado para tu mascota.
                Las necesidades varían según raza, edad, estilo de vida y ubicación geográfica.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Specialized Clinics Section */}
      <SpecializedClinics clinics={clinics} color="teal" />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal to-teal-dark text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-black mb-6"
          >
            Protege a tu mascota hoy
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg mb-8 opacity-95"
          >
            Agenda tu cita de vacunación con nuestros veterinarios especializados
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/bookings">
              <Button size="lg" className="bg-white text-teal hover:bg-gray-100 font-bold">
                Agendar Vacunación
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
