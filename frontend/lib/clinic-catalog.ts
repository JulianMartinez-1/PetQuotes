export type ClinicCatalogItem = {
  id: string;
  name: string;
  city: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  services: string[];
  rating: number;
  distanceKm: number;
  openNow: boolean;
  image: string;
  description: string;
  phone: string;
};

export const CLINIC_CATALOG: ClinicCatalogItem[] = [
  {
    id: "vet-prime",
    name: "Vet Prime",
    city: "Bogota",
    neighborhood: "Chapinero",
    latitude: 4.7380,
    longitude: -74.0520,
    services: ["Consulta", "Vacunacion", "Laboratorio"],
    rating: 4.9,
    distanceKm: 1.8,
    openNow: true,
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=1200&auto=format&fit=crop",
    description: "Atencion integral para mascotas con diagnostico rapido y seguimiento digital.",
    phone: "+57 (1) 3456 7890"
  },
  {
    id: "animal-hub",
    name: "Animal Hub",
    city: "Bogota",
    neighborhood: "Usaquen",
    latitude: 4.7230,
    longitude: -74.0150,
    services: ["Consulta", "Grooming", "Urgencias"],
    rating: 4.8,
    distanceKm: 2.4,
    openNow: true,
    image: "https://images.unsplash.com/photo-1560743641-3914f2c45636?q=80&w=1200&auto=format&fit=crop",
    description: "Equipo clinico con foco en medicina preventiva y bienestar continuo.",
    phone: "+57 (1) 2345 6789"
  },
  {
    id: "petcare-norte",
    name: "PetCare Norte",
    city: "Bogota",
    neighborhood: "Suba",
    latitude: 4.7290,
    longitude: -74.0750,
    services: ["Consulta", "Estetica", "Vacunacion"],
    rating: 4.7,
    distanceKm: 3.1,
    openNow: false,
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1200&auto=format&fit=crop",
    description: "Clinica de barrio con agenda flexible y excelentes tiempos de respuesta.",
    phone: "+57 (1) 4567 8901"
  },
  {
    id: "huellas-center",
    name: "Huellas Center",
    city: "Medellin",
    neighborhood: "Laureles",
    latitude: 6.2530,
    longitude: -75.6200,
    services: ["Consulta", "Vacunacion", "Imagenologia"],
    rating: 4.6,
    distanceKm: 1.2,
    openNow: true,
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop",
    description: "Centro veterinario moderno con enfoque en experiencia del tutor.",
    phone: "+57 (4) 5678 9012"
  },
  {
    id: "miau-guau",
    name: "Miau & Guau",
    city: "Medellin",
    neighborhood: "Poblado",
    latitude: 6.2283,
    longitude: -75.5850,
    services: ["Grooming", "Estetica", "Tienda"],
    rating: 4.5,
    distanceKm: 4.7,
    openNow: true,
    image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop",
    description: "Servicio boutique para cuidado estético y checkups express.",
    phone: "+57 (4) 6789 0123"
  },
  {
    id: "vetsalud-24h",
    name: "VetSalud 24H",
    city: "Cali",
    neighborhood: "Granada",
    latitude: 3.4300,
    longitude: -76.5100,
    services: ["Urgencias", "Hospitalizacion", "Consulta"],
    rating: 4.9,
    distanceKm: 2.1,
    openNow: true,
    image: "https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=1200&auto=format&fit=crop",
    description: "Cobertura 24 horas para casos criticos con equipo de guardia especializado.",
    phone: "+57 (2) 7890 1234"
  },
  {
    id: "biosfera-pet",
    name: "Biosfera Pet",
    city: "Cali",
    neighborhood: "San Fernando",
    latitude: 3.4500,
    longitude: -76.5200,
    services: ["Consulta", "Laboratorio", "Vacunacion"],
    rating: 4.4,
    distanceKm: 5.3,
    openNow: false,
    image: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?q=80&w=1200&auto=format&fit=crop",
    description: "Atencion programada con laboratorio propio y reportes digitales.",
    phone: "+57 (2) 8901 2345"
  },
  {
    id: "pet-point",
    name: "Pet Point",
    city: "Bogota",
    neighborhood: "Teusaquillo",
    latitude: 4.7420,
    longitude: -74.0880,
    services: ["Consulta", "Grooming", "Vacunacion"],
    rating: 4.3,
    distanceKm: 2.9,
    openNow: true,
    image: "https://images.unsplash.com/photo-1525253086316-d0c936c814f8?q=80&w=1200&auto=format&fit=crop",
    description: "Agenda agil y paquetes mensuales para tutores frecuentes.",
    phone: "+57 (1) 5678 9012"
  },
  {
    id: "amigos-pets-medellin",
    name: "Amigos Pets",
    city: "Medellin",
    neighborhood: "Sabaneta",
    latitude: 6.1700,
    longitude: -75.5900,
    services: ["Consulta", "Cirugia", "Urgencias"],
    rating: 4.8,
    distanceKm: 3.5,
    openNow: true,
    image: "https://images.unsplash.com/photo-1558947278-f3c196dd4ef1?q=80&w=1200&auto=format&fit=crop",
    description: "Clinica veterinaria con equipo quirurgico y especialistas disponibles.",
    phone: "+57 (4) 7890 1234"
  },
  {
    id: "pets-world-envigado",
    name: "Pets World",
    city: "Medellin",
    neighborhood: "Envigado",
    latitude: 6.1630,
    longitude: -75.5850,
    services: ["Consulta", "Vacunacion", "Estetica"],
    rating: 4.7,
    distanceKm: 5.2,
    openNow: true,
    image: "https://images.unsplash.com/photo-1551038328-7fb3f2b5498f?q=80&w=1200&auto=format&fit=crop",
    description: "Centro integral con servicios preventivos y estéticos de primera categoría.",
    phone: "+57 (4) 8901 2345"
  },
  {
    id: "vet-express-itaguim",
    name: "Vet Express",
    city: "Medellin",
    neighborhood: "Itagüi",
    latitude: 6.1600,
    longitude: -75.5900,
    services: ["Consulta express", "Vacunacion", "Laboratorio"],
    rating: 4.6,
    distanceKm: 6.1,
    openNow: true,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop",
    description: "Atención rápida sin cita previa para consultas y procedimientos menores.",
    phone: "+57 (4) 9012 3456"
  },
  {
    id: "paw-clinic-estadio",
    name: "Paw Clinic",
    city: "Medellin",
    neighborhood: "Estadio",
    latitude: 6.2670,
    longitude: -75.5690,
    services: ["Consulta", "Dental", "Imagenologia"],
    rating: 4.9,
    distanceKm: 2.8,
    openNow: false,
    image: "https://images.unsplash.com/photo-1576091160399-0ff1a63be6b5?q=80&w=1200&auto=format&fit=crop",
    description: "Clínica especializada en odontología y diagnóstico por imágenes.",
    phone: "+57 (4) 0123 4567"
  },
  {
    id: "mascota-feliz-viejo",
    name: "Mascota Feliz",
    city: "Medellin",
    neighborhood: "Parque Arvi",
    latitude: 6.3500,
    longitude: -75.5400,
    services: ["Consulta", "Grooming", "Hospedaje"],
    rating: 4.4,
    distanceKm: 7.3,
    openNow: true,
    image: "https://images.unsplash.com/photo-1615656313503-b671c06ceb42?q=80&w=1200&auto=format&fit=crop",
    description: "Servicios integrales con hospedaje y guardería para mascotas.",
    phone: "+57 (4) 1234 5678"
  }
];

export const CATALOG_PAGE_SIZE = 4;
