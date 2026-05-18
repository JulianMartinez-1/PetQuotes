"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpecializedClinics } from "@/components/sections/specialized-clinics";
import { ScrollReactivePets } from "@/components/animations/scroll-reactive-pets";
import { cn } from "@/lib/utils";

export default function ConsultaVeterinaria() {
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

  const benefits = [
    {
      icon: "🩺",
      title: "Diagnóstico Preciso",
      description: "Evaluación completa de la salud de tu mascota por veterinarios certificados",
    },
    {
      icon: "💊",
      title: "Tratamiento Especializado",
      description: "Planes de tratamiento personalizados según las necesidades de tu pet",
    },
    {
      icon: "🔬",
      title: "Laboratorio Avanzado",
      description: "Análisis y pruebas diagnósticas con tecnología de última generación",
    },
    {
      icon: "📋",
      title: "Historial Médico",
      description: "Registro completo del historial médico de tu mascota en una plataforma segura",
    },
  ];

  const conditions = [
    { name: "Problemas Gastrointestinales" },
    { name: "Infecciones Cutáneas" },
    { name: "Problemas Respiratorios" },
    { name: "Enfermedades del Corazón" },
    { name: "Dolores Articulares" },
    { name: "Infecciones Urinarias" },
    { name: "Alergias y Dermatitis" },
    { name: "Problemas Oftalmológicos" },
  ];

  const clinics = [
    {
      id: "1",
      name: "Veterinaria Integral Pets Plus",
      specialty: "Medicina General y Cirugía",
      rating: 4.9,
      reviews: 342,
      address: "Carrera 11 #45-67, Zona Centro",
      distance: "2.3 km de ti",
      hours: "Lun-Dom 8am - 8pm",
      badge: "Recomendado",
      color: "orange" as const,
    },
    {
      id: "2",
      name: "Centro Veterinario San José",
      specialty: "Medicina General y Urgencias",
      rating: 4.8,
      reviews: 287,
      address: "Avenida 7 #23-45, La Floresta",
      distance: "3.1 km de ti",
      hours: "Lun-Dom 7am - 9pm",
      badge: "24 Horas",
      color: "orange" as const,
    },
    {
      id: "3",
      name: "Clínica Veterinaria del Norte",
      specialty: "Medicina General y Oftalmología",
      rating: 4.7,
      reviews: 251,
      address: "Carrera 15 #89-12, Norte",
      distance: "4.5 km de ti",
      hours: "Lun-Sab 9am - 7pm",
      color: "orange" as const,
    },
  ];

  return (
    <>
      <ScrollReactivePets />
      
      {/* Header with Back Button */}
      <div className="bg-gradient-to-r from-orange/5 to-orange/10 border-b-2 border-orange/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-orange hover:text-orange-dark">
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
              <div className="text-5xl">🩺</div>
              <h1 className="text-4xl sm:text-5xl font-black text-orange">
                Consulta Veterinaria
              </h1>
            </div>
            <p className="text-lg text-textSecondary max-w-2xl">
              Accede a veterinarios calificados para diagnósticos precisos y tratamientos expertos para tu mascota
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
            <h2 className="text-3xl font-black text-orange mb-6">¿Qué es una Consulta Veterinaria?</h2>
            <p className="text-lg text-textSecondary leading-relaxed mb-4">
              Una consulta veterinaria es una evaluación completa de la salud de tu mascota realizada por profesionales
              calificados. Estos expertos realizan un examen físico detallado, diagnostican enfermedades, prescriben
              tratamientos y brindan asesoramiento preventivo para mantener a tu pet saludable y feliz.
            </p>
            <p className="text-lg text-textSecondary leading-relaxed">
              En PetQuotes, conectamos a dueños de mascotas con veterinarios de confianza que ofrecen atención
              personalizada, diagnósticos precisos y planes de tratamiento efectivos.
            </p>
          </motion.div>
        </motion.section>

        {/* Benefits Grid */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="mb-20"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-black text-orange mb-12">
            Beneficios de la Consulta Veterinaria
          </motion.h2>
          
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
          >
            {benefits.map((benefit, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <div className="bg-white rounded-2xl border-2 border-orange/20 p-8 hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-orange mb-3">{benefit.title}</h3>
                  <p className="text-textSecondary leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* When to Visit */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="mb-20"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-black text-orange mb-8">
            Casos Comunes para Consulta
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {conditions.map((condition, idx) => (
              <motion.div key={idx} variants={itemVariants} className="flex items-start gap-3">
                <CheckCircle2 size={24} className="text-orange flex-shrink-0 mt-1" />
                <span className="text-lg text-textSecondary">{condition.name}</span>
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
          className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-20"
        >
          <div className="flex gap-4">
            <Info className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Consejo Importante</h3>
              <p className="text-blue-800">
                Se recomienda una consulta veterinaria al menos una vez al año para mascotas adultas sanas.
                Cachorros, seniors y mascotas con condiciones crónicas pueden requerir visitas más frecuentes.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Specialized Clinics Section */}
      <SpecializedClinics clinics={clinics} color="orange" />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange to-orange-dark text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-black mb-6"
          >
            ¡Tu mascota merece lo mejor!
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg mb-8 opacity-95"
          >
            Agenda una consulta veterinaria con nuestros profesionales certificados hoy mismo
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/bookings">
              <Button size="lg" className="bg-white text-orange hover:bg-gray-100 font-bold">
                Agendar Ahora
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
