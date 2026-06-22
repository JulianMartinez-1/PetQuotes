import type { Metadata } from "next";
import HomePageClient from "./_home-page";

export const metadata: Metadata = {
  title: "PetQuotes — Veterinarias Premium en Tus Manos",
  description:
    "Reserva citas con clínicas veterinarias verificadas en segundos. Encuentra la mejor atención para tu mascota en Bogotá, Medellín y Cali.",
  openGraph: {
    title: "PetQuotes — Veterinarias Premium en Tus Manos",
    description:
      "Reserva citas con clínicas veterinarias verificadas en segundos. Encuentra la mejor atención para tu mascota.",
    type: "website",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
