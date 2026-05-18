"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpecializedClinics } from "@/components/sections/specialized-clinics";
import { ScrollReactivePets } from "@/components/animations/scroll-reactive-pets";

export default function Estetica() {
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

  const treatments = [
    {
      icon: "🌟",
      title: "Tratamientos de Pelaje",
      description: "Mascarillas hidratantes y acondicionamientos de lujo para pelaje brillante",
    },
    {
      icon: "💆",
      title: "Masajes Relajantes",
      description: "Masajes terapéuticos que reducen estrés y mejoran la circulación",
    },
    {
      icon: "🎨",
      title: "Coloración Segura",
      description: "Tintes dermatológicamente seguros para cambios de color creativos",
    },
    {
      icon: "✨",
      title: "Tratamientos Especiales",
      description: "Hidratación profunda, botox capilar y tratamientos anti-edad",
    },
  ];

  const services = [
    "Baño de espuma deluxe con aromaterapia",
    "Secado profesional con difusores",
    "Cortes estilizados personalizados",
    "Diseño de cejas y perfilado facial",
    "Manicura y pedicura con esmaltado",
    "Tratamientos de piel con ácidos naturales",
    "Perfumería y fragancias premium",
    "Fotosesión profesional post-servicio",
  ];

  const benefits = [
    "Aumenta la confianza y autoestima de tu mascota",
    "Mejora la apariencia y presentación",
    "Promueve relajación y bienestar",
    "Estimula la circulación sanguínea",
    "Facilita la detección de problemas dermatológicos",
    "Fortalece el vínculo con tu mascota",
    "Prepara a mascotas para competencias o eventos",
  ];

  const clinics = [
    {
      id: "1",
      name: "Luxury Pet Spa & Boutique",
      specialty: "Estética, Peluquería y Spa",
      rating: 4.9,
      reviews: 486,
      address: "Carrera 12 #98-76, Zona Exclusiva",
      distance: "2.5 km de ti",
      hours: "Mar-Dom 10am - 7pm",
      badge: "Lujo",
      color: "warning" as const,
    },
    {
      id: "2",
      name: "Beauty & Wellness Pets",
      specialty: "Estética Premium y Bienestar",
      rating: 4.8,
      reviews: 392,
      address: "Avenida 20 #45-23, Centro Moderno",
      distance: "3.3 km de ti",
      hours: "Lun-Sab 9am - 8pm",
      badge: "Premium",
      color: "warning" as const,
    },
    {
      id: "3",
      name: "Estética Canina Elite",
      specialty: "Grooming Artístico y Estética",
      rating: 4.7,
      reviews: 318,
      address: "Calle 67 #12-34, La Floresta",
      distance: "4.2 km de ti",
      hours: "Lun-Sab 10am - 6pm",
      color: "warning" as const,
    },
  ];

  return (
    <>
      <ScrollReactivePets />
      
      {/* Header with Back Button */}
      <div className="bg-gradient-to-r from-warning/5 to-warning/10 border-b-2 border-warning/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-warning hover:text-warning-dark">
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
              <div className="text-5xl">✨</div>
              <h1 className="text-4xl sm:text-5xl font-black text-warning">
                Estética
              </h1>
            </div>
            <p className="text-lg text-textSecondary max-w-2xl">
              Servicios de lujo y bienestar para que tu mascota brille y se sienta increíble
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
            <h2 className="text-3xl font-black text-warning mb-6">¿Qué es la Estética para Mascotas?</h2>
            <p className="text-lg text-textSecondary leading-relaxed mb-4">
              La estética para mascotas va más allá de la higiene básica. Es un servicio integral de belleza
              y bienestar que incluye tratamientos especializados, diseños creativos y terapias relajantes
              para mantener a tu mascota luciendo y sintiéndose de lo mejor.
            </p>
            <p className="text-lg text-textSecondary leading-relaxed">
              Desde mascarillas capilares premium hasta sesiones de spa completas, nuestros estetas certificados
              utilizan técnicas profesionales y productos de calidad para transformar a tu pet en una verdadera
              superstar.
            </p>
          </motion.div>
        </motion.section>

        {/* Treatments Grid */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="mb-20"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-black text-warning mb-12">
            Tratamientos Disponibles
          </motion.h2>
          
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
          >
            {treatments.map((treatment, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <div className="bg-white rounded-2xl border-2 border-warning/20 p-8 hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{treatment.icon}</div>
                  <h3 className="text-xl font-bold text-warning mb-3">{treatment.title}</h3>
                  <p className="text-textSecondary leading-relaxed">{treatment.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Services List */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="mb-20"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-black text-warning mb-8">
            Servicios Incluidos en Nuestro Paquete Premium
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service, idx) => (
              <motion.div key={idx} variants={itemVariants} className="flex items-start gap-3">
                <CheckCircle2 size={24} className="text-warning flex-shrink-0 mt-1" />
                <span className="text-lg text-textSecondary">{service}</span>
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
          <motion.h2 variants={itemVariants} className="text-3xl font-black text-warning mb-8">
            Beneficios para tu Mascota
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, idx) => (
              <motion.div key={idx} variants={itemVariants} className="flex items-start gap-3">
                <CheckCircle2 size={24} className="text-warning flex-shrink-0 mt-1" />
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
          className="bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-6 mb-20"
        >
          <div className="flex gap-4">
            <Info className="text-purple-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-purple-900 mb-2">Nota Importante</h3>
              <p className="text-purple-800">
                Los tratamientos estéticos son personalizables según el tipo de pelaje, raza y preferencias
                de tu mascota. Consulta con nuestros expertos para determinar el mejor plan para tu pet.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Specialized Clinics Section */}
      <SpecializedClinics clinics={clinics} color="warning" />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-warning to-warning-dark text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-black mb-6"
          >
            Convierte a tu mascota en una superstar
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg mb-8 opacity-95"
          >
            Reserva tu sesión de estética premium hoy mismo
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/bookings">
              <Button size="lg" className="bg-white text-warning hover:bg-gray-100 font-bold">
                Agendar Sesión
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
