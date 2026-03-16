"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const clinics = [
  { id: "1", name: "PetCare Norte", coords: [4.71099, -74.07209] as [number, number] },
  { id: "2", name: "Animal Hub Chapinero", coords: [4.64862, -74.06364] as [number, number] },
  { id: "3", name: "Vet Prime Usaquen", coords: [4.70315, -74.03134] as [number, number] }
];

export function ClinicMap() {
  return (
    <div className="h-[320px] w-full overflow-hidden rounded-2xl border border-[#dfe7f7]">
      <MapContainer center={[4.67, -74.06]} zoom={11} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {clinics.map((clinic) => (
          <Marker key={clinic.id} position={clinic.coords}>
            <Popup>{clinic.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
