"use client";

import { useEffect, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

let googleMapsLoadPromise: Promise<void> | null = null;
let googleMapsKey: string | null = null;

const clinics = [
  {
    id: "1",
    name: "PetCare Norte",
    coords: [4.71099, -74.07209] as [number, number],
    rating: 4.9,
    eta: "7 min",
    service: "Consulta y grooming"
  },
  {
    id: "2",
    name: "Animal Hub Chapinero",
    coords: [4.64862, -74.06364] as [number, number],
    rating: 4.8,
    eta: "11 min",
    service: "Vacunacion y urgencias"
  },
  {
    id: "3",
    name: "Vet Prime Usaquen",
    coords: [4.70315, -74.03134] as [number, number],
    rating: 4.7,
    eta: "14 min",
    service: "Consulta especializada"
  }
];

export function ClinicMap() {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [useLeafletFallback, setUseLeafletFallback] = useState(false);

  const loadGoogleMaps = async (key: string) => {
    if (!googleMapsLoadPromise || googleMapsKey !== key) {
      googleMapsKey = key;
      setOptions({ key });
      googleMapsLoadPromise = importLibrary("maps").then(() => undefined);
    }

    return googleMapsLoadPromise;
  };

  useEffect(() => {
    const container = mapElementRef.current;
    if (!container || !useLeafletFallback) {
      return;
    }

    if ((container as { _leaflet_id?: number })._leaflet_id) {
      (container as { _leaflet_id?: number })._leaflet_id = undefined;
    }

    const map = L.map(container, { scrollWheelZoom: false }).setView([4.67, -74.06], 11);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const markerIcon = L.divIcon({
      className: "clinic-pin-wrap",
      html: '<span class="clinic-pin"></span>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    clinics.forEach((clinic) => {
      const popupHtml = `
        <article class="clinic-popup-card">
          <p class="clinic-popup-kicker">Clinica validada</p>
          <h4>${clinic.name}</h4>
          <p>${clinic.service}</p>
          <div class="clinic-popup-meta">
            <span>Rating ${clinic.rating}</span>
            <span>${clinic.eta}</span>
          </div>
        </article>
      `;

      L.marker(clinic.coords, { icon: markerIcon })
        .addTo(map)
        .bindPopup(popupHtml, { className: "clinic-popup", closeButton: false, offset: [0, -8] });
    });

    return () => {
      map.remove();
    };
  }, [useLeafletFallback]);

  useEffect(() => {
    const container = mapElementRef.current;
    if (!container || !apiKey || useLeafletFallback) {
      return;
    }

    let isDisposed = false;
    const markers: google.maps.Marker[] = [];
    const globalWindow = window as Window & { gm_authFailure?: () => void };
    const previousAuthFailure = globalWindow.gm_authFailure;

    globalWindow.gm_authFailure = () => {
      setUseLeafletFallback(true);
      if (typeof previousAuthFailure === "function") {
        previousAuthFailure();
      }
    };

    const initMap = async () => {
      try {
        await loadGoogleMaps(apiKey);

        if (isDisposed) {
          return;
        }

        const map = new google.maps.Map(container, {
          center: { lat: 4.67, lng: -74.06 },
          zoom: 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: "cooperative",
          zoomControl: true,
          styles: [
            { featureType: "poi.business", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] }
          ]
        });

        const infoWindow = new google.maps.InfoWindow();

        clinics.forEach((clinic) => {
          const marker = new google.maps.Marker({
            map,
            position: { lat: clinic.coords[0], lng: clinic.coords[1] },
            title: clinic.name,
            animation: google.maps.Animation.DROP,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "#118ab2",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 8
            }
          });

          marker.addListener("click", () => {
            infoWindow.setContent(`
              <article class="gmap-popup-card">
                <p class="gmap-popup-kicker">Clinica validada</p>
                <h4>${clinic.name}</h4>
                <p>${clinic.service}</p>
                <div class="gmap-popup-meta">
                  <span>Rating ${clinic.rating}</span>
                  <span>${clinic.eta}</span>
                </div>
              </article>
            `);
            infoWindow.open({ anchor: marker, map });
          });

          markers.push(marker);
        });
      } catch {
        googleMapsLoadPromise = null;
        setUseLeafletFallback(true);
      }
    };

    void initMap();

    return () => {
      isDisposed = true;
      markers.forEach((marker) => marker.setMap(null));
      container.innerHTML = "";
      globalWindow.gm_authFailure = previousAuthFailure;
    };
  }, [apiKey, useLeafletFallback]);

  if (!apiKey) {
    return (
      <div className="grid h-[320px] w-full place-items-center rounded-2xl border border-[#dfe7f7] bg-white p-5 text-center">
        <div>
          <p className="text-sm font-bold text-navy">Mapa premium no configurado</p>
          <p className="mt-1 text-xs text-soft">Agrega NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en tu .env para activar Google Maps.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-2xl border border-[#dfe7f7]">
      {useLeafletFallback && (
        <div className="absolute left-3 top-3 z-[500] rounded-full border border-[#dbe5fb] bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-soft">
          Modo de respaldo activo
        </div>
      )}
      <div ref={mapElementRef} className="h-full w-full" />
    </div>
  );
}
