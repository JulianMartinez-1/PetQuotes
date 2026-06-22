"use client";

import { useEffect, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getUserProfileSettings } from "@/lib/user-profile";
import { useAuthState } from "@/store/auth-state";

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

const CITY_COORDS: Record<string, [number, number]> = {
  Bogota: [4.67, -74.06],
  Medellin: [6.2442, -75.5812],
  Cali: [3.4372, -76.5197],
};

export function ClinicMap() {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [useLeafletFallback, setUseLeafletFallback] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const { user } = useAuthState();

  const getMapCenter = (): [number, number] => {
    if (!user) return CITY_COORDS.Bogota;
    const profile = getUserProfileSettings(user.id, user.email.split("@")[0]);
    return CITY_COORDS[profile.city] ?? CITY_COORDS.Bogota;
  };

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

    const center = getMapCenter();
    const map = L.map(container, { scrollWheelZoom: false }).setView(center, 11);
    setIsMapLoading(false);

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
      // Build popup as DOM element to prevent XSS from injected clinic data
      const article = document.createElement("article");
      article.className = "clinic-popup-card";

      const kicker = document.createElement("p");
      kicker.className = "clinic-popup-kicker";
      kicker.textContent = "Clínica validada";

      const title = document.createElement("h4");
      title.textContent = clinic.name;

      const service = document.createElement("p");
      service.textContent = clinic.service;

      const meta = document.createElement("div");
      meta.className = "clinic-popup-meta";

      const rating = document.createElement("span");
      rating.textContent = `Rating ${clinic.rating}`;

      const eta = document.createElement("span");
      eta.textContent = clinic.eta;

      meta.append(rating, eta);
      article.append(kicker, title, service, meta);

      L.marker(clinic.coords, { icon: markerIcon })
        .addTo(map)
        .bindPopup(article, { className: "clinic-popup", closeButton: false, offset: [0, -8] });
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
    const markers: any[] = [];
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

        const [clat, clng] = getMapCenter();
        const map = new google.maps.Map(container, {
          center: { lat: clat, lng: clng },
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

        setIsMapLoading(false);
        const infoWindow = new google.maps.InfoWindow();

        clinics.forEach((clinic) => {
          // Create content element for AdvancedMarkerElement
          const contentElement = document.createElement("div");
          contentElement.innerHTML = `
            <div class="clinic-marker-wrapper">
              <div class="clinic-marker-pin"></div>
            </div>
          `;
          contentElement.style.display = "flex";
          contentElement.style.alignItems = "center";
          contentElement.style.justifyContent = "center";

          // Use AdvancedMarkerElement instead of deprecated Marker
          const marker = new (window as any).google.maps.marker.AdvancedMarkerElement({
            map,
            position: { lat: clinic.coords[0], lng: clinic.coords[1] },
            title: clinic.name,
            content: contentElement,
          });

          marker.addEventListener("click", () => {
            // Build info window content as DOM element to prevent XSS
            const card = document.createElement("article");
            card.className = "gmap-popup-card";

            const kicker = document.createElement("p");
            kicker.className = "gmap-popup-kicker";
            kicker.textContent = "Clínica validada";

            const h4 = document.createElement("h4");
            h4.textContent = clinic.name;

            const svc = document.createElement("p");
            svc.textContent = clinic.service;

            const metaDiv = document.createElement("div");
            metaDiv.className = "gmap-popup-meta";

            const ratingSpan = document.createElement("span");
            ratingSpan.textContent = `Rating ${clinic.rating}`;

            const etaSpan = document.createElement("span");
            etaSpan.textContent = clinic.eta;

            metaDiv.append(ratingSpan, etaSpan);
            card.append(kicker, h4, svc, metaDiv);

            infoWindow.setContent(card);
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
      // Clear markers - they'll be garbage collected when map is removed
      markers.length = 0;
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
      {isMapLoading && (
        <div className="absolute inset-0 z-[400] flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
          <span className="text-xs font-semibold text-text-secondary">Cargando mapa…</span>
        </div>
      )}
      {useLeafletFallback && (
        <div className="absolute left-3 top-3 z-[500] rounded-full border border-[#dbe5fb] bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-soft">
          Modo de respaldo activo
        </div>
      )}
      <div ref={mapElementRef} className="h-full w-full" />
    </div>
  );
}
