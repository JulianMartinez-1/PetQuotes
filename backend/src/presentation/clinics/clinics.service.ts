import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { ClinicCatalogItem, IndependentVetItem } from './types';
import { ClinicsWithFallbackService } from './clinics-fallback.service';
import { PrismaService } from '@shared/prisma/prisma.service';

@Injectable()
export class ClinicsService {
  private readonly logger = new Logger(ClinicsService.name);
  private readonly googleMapsClient: AxiosInstance;
  private googleMapsApiKey: string | undefined;
  
  // Coordenadas centrales de las ciudades
  private readonly cityCoordinates = {
    Bogota: { lat: 4.7110, lng: -74.0055 },
    Medellin: { lat: 6.2442, lng: -75.5812 },
    Cali: { lat: 3.4372, lng: -76.5069 },
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly fallbackService: ClinicsWithFallbackService,
    private readonly prisma: PrismaService,
  ) {
    // GOOGLE_PLACES_API_KEY is a server-side key with no HTTP-referrer restriction.
    // Falls back to GOOGLE_MAPS_API_KEY if the dedicated key is not set.
    this.googleMapsApiKey =
      this.configService.get<string | undefined>('GOOGLE_PLACES_API_KEY') ??
      this.configService.get<string | undefined>('GOOGLE_MAPS_API_KEY');
    
    if (this.googleMapsApiKey) {
      this.logger.log(`✅ Google Maps API Key configurada (primeros 10 caracteres): ${this.googleMapsApiKey.substring(0, 10)}...`);
      // Log para debugging - mostrar la longitud de la API key
      this.logger.debug(`📊 Longitud de API Key: ${this.googleMapsApiKey.length} caracteres`);
    } else {
      this.logger.warn('❌ GOOGLE_MAPS_API_KEY no está configurada en las variables de entorno');
    }
    
    this.googleMapsClient = axios.create({
      baseURL: 'https://maps.googleapis.com/maps/api',
      timeout: 15000, // Aumentar timeout
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
      const clinics = await this.searchPlaces(coords, city);
      
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
          keyword: 'veterinaria veterinary clinic pet',
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
      
      // Log detallado para debugging
      this.logger.log(`📊 Parámetros enviados a Google Places:`);
      this.logger.log(`  - Ubicación: ${latitude}, ${longitude}`);
      this.logger.log(`  - Radio: ${radiusMeters}m (${radiusKm}km)`);
      this.logger.log(`  - API Key presente: ${this.googleMapsApiKey ? 'Sí' : 'No'}`);
      this.logger.log(`  - Idioma: es`);
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
      clinicsRaw.map((place: any) =>
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
   * Búsqueda genérica usando Google Places API con múltiples estrategias
   */
  private async searchPlaces(
    coords: { lat: number; lng: number },
    city: string,
  ): Promise<ClinicCatalogItem[]> {
    try {
      if (!this.googleMapsApiKey) {
        this.logger.warn('⚠️ Google Maps API Key no configurada, usando fallback');
        return this.fallbackService.getClinicsWithFallback(city);
      }

      this.logger.log(`📍 Buscando con Google Places en ${city} (${coords.lat}, ${coords.lng})...`);
      
      // Estrategia 1: Búsqueda con keyword 'veterinaria' en español con radio mayor
      let response = await this.googleMapsClient.get('/place/nearbysearch/json', {
        params: {
          location: `${coords.lat},${coords.lng}`,
          radius: 25000, // 25 km de radio para cobertura mayor
          keyword: 'veterinaria veterinary clinic',
          key: this.googleMapsApiKey,
          language: 'es',
        },
      });

      this.logger.log(`📡 Estrategia 1 - Status: ${response.data.status} | Resultados: ${response.data.results?.length || 0}`);

      // Estrategia 2: Si la primera falla, intentar con búsqueda más amplia
      if (!response.data.results || response.data.results.length === 0) {
        this.logger.warn(`⚠️ Estrategia 1 sin resultados. Intentando Estrategia 2...`);
        response = await this.googleMapsClient.get('/place/nearbysearch/json', {
          params: {
            location: `${coords.lat},${coords.lng}`,
            radius: 35000, // Radio más amplio
            keyword: 'veterinary pet doctor animal clinic',
            key: this.googleMapsApiKey,
            language: 'es',
          },
        });
        this.logger.log(`📡 Estrategia 2 - Status: ${response.data.status} | Resultados: ${response.data.results?.length || 0}`);
      }

      if (response.data.status !== 'OK') {
        this.logger.warn(`⚠️ Google Places devolvió status: ${response.data.status}`);
        if (response.data.error_message) {
          this.logger.error(`❌ Error Google: ${response.data.error_message}`);
        }
        return this.fallbackService.getClinicsWithFallback(city);
      }

      if (!response.data.results || response.data.results.length === 0) {
        this.logger.warn(`⚠️ Google Places: Sin resultados para ${city} después de intentos múltiples`);
        return this.fallbackService.getClinicsWithFallback(city);
      }

      // Procesar resultados
      const clinics = await Promise.all(
        response.data.results
          .slice(0, 15) // Aumentar límite de resultados
          .map((place: any) => this.transformPlaceToClinic(place, city)),
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

  /**
   * Endpoint de debugging para probar Google Maps API Key
   */
  async debugTestGoogleMapsApi() {
    const testResult = {
      timestamp: new Date().toISOString(),
      apiKeyConfigured: !!this.googleMapsApiKey,
      apiKeyLength: this.googleMapsApiKey?.length || 0,
      apiKeyPrefix: this.googleMapsApiKey ? `${this.googleMapsApiKey.substring(0, 10)}...` : 'N/A',
      tests: {} as any,
    };

    // Test 1: Verificar que la API Key esté configurada
    testResult.tests.step1_apiKeyPresent = !!this.googleMapsApiKey;

    if (!this.googleMapsApiKey) {
      this.logger.error('❌ GOOGLE_MAPS_API_KEY no está configurada');
      return testResult;
    }

    // Test 2: Intentar una búsqueda de prueba en Bogotá
    try {
      this.logger.log('🧪 Probando Google Places API...');
      
      const response = await this.googleMapsClient.get('/place/nearbysearch/json', {
        params: {
          location: '4.7110,-74.0055', // Bogotá
          radius: 25000,
          keyword: 'veterinaria',
          key: this.googleMapsApiKey,
          language: 'es',
        },
      });

      testResult.tests.step2_googleApiCall = {
        status: response.data.status,
        resultsCount: response.data.results?.length || 0,
        hasError: response.data.status !== 'OK',
        errorMessage: response.data.error_message || 'No error',
      };

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        testResult.tests.step3_resultsProcessing = {
          success: true,
          firstResult: {
            name: response.data.results[0].name,
            rating: response.data.results[0].rating,
            types: response.data.results[0].types?.slice(0, 3),
          },
        };
      } else {
        testResult.tests.step3_resultsProcessing = {
          success: false,
          reason: 'No results or API error',
        };
      }

      this.logger.log('✅ Debug test completado:', JSON.stringify(testResult, null, 2));
    } catch (error: any) {
      this.logger.error('❌ Error durante debug test:', error);
      testResult.tests.step2_googleApiCall = {
        error: error.message,
        statusCode: error.response?.status,
        data: error.response?.data,
      };
    }

    return testResult;
  }

  async getPlatformRegisteredClinics(): Promise<{
    clinics: ClinicCatalogItem[];
    independents: IndependentVetItem[];
  }> {
    const profiles = await this.prisma.veterinaryProfile.findMany({
      where: { status: 'APPROVED' },
      include: {
        user: { select: { fullName: true } },
        clinic: {
          include: {
            branches: {
              select: { city: true, address: true, latitude: true, longitude: true, phone: true },
              take: 1,
            },
            services: { select: { name: true, category: true } },
          },
        },
      },
    });

    const SERVICE_LABELS: Record<string, string> = {
      consultation: 'Consulta general',
      vaccination: 'Vacunación',
      surgery: 'Cirugía',
      dental: 'Odontología',
      grooming: 'Estética / Grooming',
      emergency: 'Urgencias',
    };

    const clinics: ClinicCatalogItem[] = profiles
      .filter((p) => p.veterinaryType === 'CLINIC' && p.clinic?.branches?.[0])
      .map((p) => {
        const clinic = p.clinic!;
        const branch = clinic.branches[0];
        return {
          id: clinic.id,
          name: clinic.name,
          city: branch.city,
          neighborhood: branch.address,
          latitude: branch.latitude,
          longitude: branch.longitude,
          services: clinic.services.map((s) => SERVICE_LABELS[s.category] ?? s.name),
          rating: 0,
          distanceKm: 0,
          openNow: false,
          image: clinic.logo ?? '',
          description: clinic.description ?? '',
          phone: clinic.phone ?? branch.phone ?? '',
          source: 'platform' as const,
        };
      });

    const independents: IndependentVetItem[] = profiles
      .filter((p) => p.veterinaryType === 'INDEPENDENT')
      .map((p) => ({
        id: p.id,
        ownerName: p.user.fullName,
        serviceArea: p.serviceArea ?? '',
        homeVisits: p.homeVisits,
        coverageRadius: p.coverageRadius ?? undefined,
      }));

    return { clinics, independents };
  }
}
