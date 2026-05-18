export type BookingPet = {
  id: string;
  ownerId: string;
  name: string;
  species: string;
};

export type BookingVet = {
  id: string;
  name: string;
  specialty: string;
};

export type BookingService = {
  id: string;
  label: string;
};

export type BookingBranch = {
  id: string;
  label: string;
};

export const BOOKING_PETS: BookingPet[] = [
  { id: "pet-demo-001", ownerId: "client-demo-001", name: "Milo", species: "Dog" },
  { id: "pet-demo-002", ownerId: "client-demo-001", name: "Nala", species: "Cat" },
  { id: "pet-demo-101", ownerId: "client-demo-101", name: "Bruno", species: "Dog" }
];

export const BOOKING_VETS: BookingVet[] = [
  { id: "vet-demo-001", name: "Dra. Laura Mendez", specialty: "General" },
  { id: "vet-demo-002", name: "Dr. Carlos Ruiz", specialty: "Dermatology" }
];

export const BOOKING_SERVICES: BookingService[] = [
  { id: "service-consulta", label: "Consulta general" },
  { id: "service-vacuna", label: "Vacunacion" },
  { id: "service-control", label: "Control anual" }
];

export const BOOKING_BRANCHES: BookingBranch[] = [
  { id: "branch-norte", label: "Sede Norte" },
  { id: "branch-centro", label: "Sede Centro" }
];

export function listPetsByOwner(ownerId?: string) {
  if (!ownerId) return [];
  return BOOKING_PETS.filter((pet) => pet.ownerId === ownerId);
}
