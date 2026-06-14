import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { ClinicCatalogItem } from './types';
import { ClinicsWithFallbackService } from './clinics-fallback.service';

@Injectable()
export class ClinicsService {
  private readonly logger = new Logger(ClinicsService.name);
  private readonly googleMapsClient: AxiosInstance;
  private readonly googleMapsApiKey: string;
  
  // Coordenadas centrales de las ciudades
  private readonly cityCoordinates = {
    Bogota: { lat: 4.7110, lng: -74.0055 },
    Medellin: { lat: 6.2442, lng: -75.5812 },
    Cali: { lat: 3.4372, lng: -76.5069 },
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly fallbackService: ClinicsWithFallbackService,
  ) {
    this.googleMapsApiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    
    this.logger.log(`Google Maps API Key: ${this.googleMapsApiKey ? '✅ Configurada' : '❌ No configurada'}`);
    
    this.googleMapsClient = axios.create({
      baseURL: 'https://maps.googleapis.com/maps/api',
      timeout: 10000,
    });
  }

  /**
   * Busca veterinarias en una ciudad específica usando Google Places API
   */
  async searchClinicsByCity(city: string): Promise<ClinicCatalogItem[]> {
    const coords = this.cityCoordinates[city as keyof typeof this.cityCoordinates];
    
    if (!coords) {
      this.logger.warn(`Ciudad no soportada: ${city}`);
      return [];
    }

    try {
      // Intentar con Google Places primero
      const clinics = await this.searchPlaces(coords, 'veterinary_care', city);
      
      if (clinics.length > 0) {
        this.logger.log(`✅ Encontradas ${clinics.length} clínicas en ${city} desde Google Places`);
        return clinics;
      }
      
      // Si no hay resultados, usar fallback
      this.logger.warn(`⚠️ Google Places no retornó resultados para ${city}, usando fallback`);
      return this.fallbackService.getClinicsWithFallback(city);
    } catch (error) {
      this.logger.error(`❌ Error buscando clínicas en ${city}, usando fallback:`, error);
      // Usar fallback en caso de error
      return this.fallbackService.getClinicsWithFallback(city);
    }
  }

  /**
   * Busca veterinarias cercanas a las coordenadas del usuario
   */
async searchClinicsByCoordinates(
  latitude: number,
  longitude: number,
  radiusKm: number = 5,
): Promise<ClinicCatalogItem[]> {
  try {
    if (!this.googleMapsApiKey) {
      this.logger.warn('⚠️ Google Maps API Key no configurada, usando fallback');
      return await this.fallbackService.getClinicsWithFallback('all');
    }

    this.logger.log(
      `📍 Buscando clínicas cercanas a (${latitude}, ${longitude}), radio: ${radiusKm}km`,
    );

    const radiusMeters = radiusKm * 1000;

    const response = await this.googleMapsClient.get(
      '/place/nearbysearch/json',
      {
        params: {
          location: `${latitude},${longitude}`,
          radius: radiusMeters,
          keyword: 'veterinaria',
          key: this.googleMapsApiKey,
          language: 'es',
        },
      },
    );

    this.logger.log(
      `📡 Google Places Status: ${response.data.status}`,
    );

    this.logger.log(
      `📡 Google Places Response:\n${JSON.stringify(
        response.data,
        null,
        2,
      )}`,
    );

    if (response.data.status !== 'OK') {
      this.logger.warn(
        `⚠️ Google Places devolvió status: ${response.data.status}`,
      );

      if (response.data.error_message) {
        this.logger.error(
          `❌ Error Google: ${response.data.error_message}`,
        );
      }
    }

    if (
      !response.data.results ||
      response.data.results.length === 0
    ) {
      this.logger.warn(
        '⚠️ No se encontraron clínicas cercanas en Google Places, usando fallback',
      );

      const fallbackClinics =
        await this.fallbackService.getClinicsWithFallback();

      const clinicsWithDistance = fallbackClinics.map((clinic) => ({
        ...clinic,
        distanceKm: this.calculateDistance(
          {
            lat: clinic.latitude,
            lng: clinic.longitude,
          },
          {
            lat: latitude,
            lng: longitude,
          },
        ),
      }));

      clinicsWithDistance.sort(
        (a, b) => a.distanceKm - b.distanceKm,
      );

      return clinicsWithDistance;
    }

    const clinicsRaw = response.data.results.slice(0, 20);

    const clinics = await Promise.all(
      clinicsRaw.map((place) =>
        this.transformPlaceToClinic(
          place,
          this.getCityName(latitude, longitude),
        ),
      ),
    );

    const validClinics = clinics.filter(
      (clinic) => clinic !== null,
    ) as ClinicCatalogItem[];

    validClinics.sort(
      (a, b) => a.distanceKm - b.distanceKm,
    );

    this.logger.log(
      `✅ Encontradas ${validClinics.length} clínicas reales desde Google Places`,
    );

    return validClinics;
  } catch (error: any) {
    this.logger.error(
      '❌ Error buscando clínicas cercanas:',
      error?.response?.data || error,
    );

    const fallbackClinics =
      await this.fallbackService.getClinicsWithFallback();

    const clinicsWithDistance = fallbackClinics.map((clinic) => ({
      ...clinic,
      distanceKm: this.calculateDistance(
        {
          lat: clinic.latitude,
          lng: clinic.longitude,
        },
        {
          lat: latitude,
          lng: longitude,
        },
      ),
    }));

    clinicsWithDistance.sort(
      (a, b) => a.distanceKm - b.distanceKm,
    );

    return clinicsWithDistance;
  }
}

  /**
   * Obtiene el nombre de la ciudad más cercana a unas coordenadas
   */
  private getCityName(lat: number, lng: number): string {
    let closestCity = 'Bogota';
    let closestDistance = Infinity;

    for (const [city, coords] of Object.entries(this.cityCoordinates)) {
      const distance = this.calculateDistance(coords, { lat, lng });
      if (distance < closestDistance) {
        closestDistance = distance;
        closestCity = city;
      }
    }

    return closestCity;
  }

  /**
   * Búsqueda genérica usando Google Places API
   */
  private async searchPlaces(
    coords: { lat: number; lng: number },
    keyword: string,
    city: string,
  ): Promise<ClinicCatalogItem[]> {
    try {
      if (!this.googleMapsApiKey) {
        this.logger.warn('⚠️ Google Maps API Key no configurada, usando fallback');
        return this.fallbackService.getClinicsWithFallback(city);
      }

      this.logger.log(`📍 Buscando con Google Places en ${city}...`);
      
      const response = await this.googleMapsClient.get('/place/nearbysearch/json', {
        params: {
          location: `${coords.lat},${coords.lng}`,
          radius: 15000, // 15 km de radio
          keyword: keyword,
          type: 'veterinary_care',
          key: this.googleMapsApiKey,
          language: 'es',
        },
      });

      if (!response.data.results || response.data.results.length === 0) {
        this.logger.warn(`⚠️ Google Places: Sin resultados para ${city}, usando fallback`);
        return this.fallbackService.getClinicsWithFallback(city);
      }

      // Procesar resultados
      const clinics = await Promise.all(
        response.data.results
          .slice(0, 10) // Limitar a 10 resultados por ciudad
          .map((place) => this.transformPlaceToClinic(place, city)),
      );

      const validClinics = clinics.filter((clinic) => clinic !== null) as ClinicCatalogItem[];
      
      if (validClinics.length === 0) {
        this.logger.warn(`⚠️ Google Places: Sin clínicas válidas para ${city}, usando fallback`);
        return this.fallbackService.getClinicsWithFallback(city);
      }

      this.logger.log(`✅ Google Places: ${validClinics.length} clínicas encontradas en ${city}`);
      return validClinics;
    } catch (error) {
      this.logger.error(`❌ Error en searchPlaces para ${city}:`, error);
      // Usar fallback en caso de error
      return this.fallbackService.getClinicsWithFallback(city);
    }
  }

  /**
   * Transforma un resultado de Google Places a ClinicCatalogItem
   */
  private async transformPlaceToClinic(
    place: any,
    city: string,
  ): Promise<ClinicCatalogItem | null> {
    try {
      // Generar ID único
      const id = `clinic-${place.place_id.replace(/[^a-z0-9]/gi, '').toLowerCase()}`;

      // Extraer servicios de nombre y tipo
      const services = this.extractServices(place.name, place.types);

      // Calcular distancia desde el centro de la ciudad (aproximada)
      const distance = this.calculateDistance(
        this.cityCoordinates[city as keyof typeof this.cityCoordinates],
        place.geometry.location,
      );

      const clinic: ClinicCatalogItem = {
        id,
        name: place.name,
        city,
        neighborhood: this.extractNeighborhood(place.vicinity || place.formatted_address || ''),
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        services,
        rating: place.rating || 0,
        distanceKm: distance,
        openNow: place.opening_hours?.open_now ?? true,
        image: this.getPhotoUrl(place.photos?.[0]),
        description: this.generateDescription(place),
        phone: place.formatted_phone_number || 'No disponible',
      };

      return clinic;
    } catch (error) {
      this.logger.error(`Error transformando lugar ${place.name}:`, error);
      return null;
    }
  }

  /**
   * Calcula distancia entre dos puntos (aproximada, en km)
   */
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number },
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
    const dLon = ((point2.lng - point1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.lat * Math.PI) / 180) *
        Math.cos((point2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  }

  /**
   * Extrae los servicios del nombre y tipos del lugar
   */
  private extractServices(name: string, types: string[]): string[] {
    const servicesMap: { [key: string]: string[] } = {
      'veterinary': ['Consulta', 'Vacunacion', 'Laboratorio'],
      'emergency': ['Urgencias', 'Hospitalizacion'],
      'grooming': ['Grooming', 'Estetica'],
      'surgery': ['Cirugia', 'Anestesia'],
      'dental': ['Odontologia'],
      'pharmacy': ['Farmacia', 'Medicamentos'],
    };

    let services: string[] = ['Consulta']; // Servicio por defecto

    // Buscar servicios en los tipos
    for (const type of types) {
      for (const [key, serviceList] of Object.entries(servicesMap)) {
        if (type.includes(key)) {
          services = [...new Set([...services, ...serviceList])];
        }
      }
    }

    // Buscar servicios en el nombre
    if (name.toLowerCase().includes('24')) {
      services = [...new Set([...services, 'Urgencias'])];
    }
    if (name.toLowerCase().includes('grooming') || name.toLowerCase().includes('estetica')) {
      services = [...new Set([...services, 'Grooming', 'Estetica'])];
    }

    return services.slice(0, 5); // Máximo 5 servicios
  }

  /**
   * Extrae el barrio/zona de la dirección
   */
  private extractNeighborhood(address: string): string {
    // Google Maps devuelve dirección completa, extraer la parte del barrio
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts[parts.length - 2].trim();
    }
    return address;
  }

  /**
   * Obtiene la URL de la foto del lugar
   */
  private getPhotoUrl(photo: any): string {
    if (!photo || !photo.photo_reference) {
      // Imagen por defecto
      return 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=1200&auto=format&fit=crop';
    }

    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${this.googleMapsApiKey}`;
  }

  /**
   * Genera descripción del lugar
   */
  private generateDescription(place: any): string {
    const parts = [];

    if (place.rating) {
      parts.push(`Calificacion: ${place.rating}/5 estrellas`);
    }

    if (place.opening_hours?.open_now) {
      parts.push('Abierta ahora');
    }

    return parts.length > 0
      ? parts.join(' • ')
      : 'Servicio veterinario profesional';
  }
}
