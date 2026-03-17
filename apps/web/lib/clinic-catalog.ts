export type ClinicCatalogItem = {
  id: string;
  name: string;
  city: string;
  neighborhood: string;
  services: string[];
  rating: number;
  distanceKm: number;
  openNow: boolean;
  image: string;
  description: string;
};

export const CLINIC_CATALOG: ClinicCatalogItem[] = [
  {
    id: "vet-prime",
    name: "Vet Prime",
    city: "Bogota",
    neighborhood: "Chapinero",
    services: ["Consulta", "Vacunacion", "Laboratorio"],
    rating: 4.9,
    distanceKm: 1.8,
    openNow: true,
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=1200&auto=format&fit=crop",
    description: "Atencion integral para mascotas con diagnostico rapido y seguimiento digital."
  },
  {
    id: "animal-hub",
    name: "Animal Hub",
    city: "Bogota",
    neighborhood: "Usaquen",
    services: ["Consulta", "Grooming", "Urgencias"],
    rating: 4.8,
    distanceKm: 2.4,
    openNow: true,
    image: "https://images.unsplash.com/photo-1560743641-3914f2c45636?q=80&w=1200&auto=format&fit=crop",
    description: "Equipo clinico con foco en medicina preventiva y bienestar continuo."
  },
  {
    id: "petcare-norte",
    name: "PetCare Norte",
    city: "Bogota",
    neighborhood: "Suba",
    services: ["Consulta", "Estetica", "Vacunacion"],
    rating: 4.7,
    distanceKm: 3.1,
    openNow: false,
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1200&auto=format&fit=crop",
    description: "Clinica de barrio con agenda flexible y excelentes tiempos de respuesta."
  },
  {
    id: "huellas-center",
    name: "Huellas Center",
    city: "Medellin",
    neighborhood: "Laureles",
    services: ["Consulta", "Vacunacion", "Imagenologia"],
    rating: 4.6,
    distanceKm: 1.2,
    openNow: true,
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop",
    description: "Centro veterinario moderno con enfoque en experiencia del tutor."
  },
  {
    id: "miau-guau",
    name: "Miau & Guau",
    city: "Medellin",
    neighborhood: "Poblado",
    services: ["Grooming", "Estetica", "Tienda"],
    rating: 4.5,
    distanceKm: 4.7,
    openNow: true,
    image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop",
    description: "Servicio boutique para cuidado estético y checkups express."
  },
  {
    id: "vetsalud-24h",
    name: "VetSalud 24H",
    city: "Cali",
    neighborhood: "Granada",
    services: ["Urgencias", "Hospitalizacion", "Consulta"],
    rating: 4.9,
    distanceKm: 2.1,
    openNow: true,
    image: "https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=1200&auto=format&fit=crop",
    description: "Cobertura 24 horas para casos criticos con equipo de guardia especializado."
  },
  {
    id: "biosfera-pet",
    name: "Biosfera Pet",
    city: "Cali",
    neighborhood: "San Fernando",
    services: ["Consulta", "Laboratorio", "Vacunacion"],
    rating: 4.4,
    distanceKm: 5.3,
    openNow: false,
    image: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?q=80&w=1200&auto=format&fit=crop",
    description: "Atencion programada con laboratorio propio y reportes digitales."
  },
  {
    id: "pet-point",
    name: "Pet Point",
    city: "Bogota",
    neighborhood: "Teusaquillo",
    services: ["Consulta", "Grooming", "Vacunacion"],
    rating: 4.3,
    distanceKm: 2.9,
    openNow: true,
    image: "https://images.unsplash.com/photo-1525253086316-d0c936c814f8?q=80&w=1200&auto=format&fit=crop",
    description: "Agenda agil y paquetes mensuales para tutores frecuentes."
  }
];

export const CATALOG_PAGE_SIZE = 4;
