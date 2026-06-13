import { Controller, Get, Query, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { SearchClinicsResponse } from './types';

@Controller('clinics')
export class ClinicsController {
  private readonly logger = new Logger(ClinicsController.name);

  constructor(private readonly clinicsService: ClinicsService) {}

  /**
   * Test endpoint - devuelve datos de prueba
   * GET /clinics/test
   */
  @Get('test')
  @HttpCode(HttpStatus.OK)
  async testEndpoint() {
    this.logger.log('Test endpoint llamado');
    return {
      status: 'ok',
      message: 'Endpoint de clínicas está funcionando',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Busca veterinarias en una ciudad específica
   * GET /clinics/search?city=Bogota
   */
  @Get('search')
  @HttpCode(HttpStatus.OK)
  async searchClinics(@Query('city') city: string): Promise<SearchClinicsResponse> {
    this.logger.log(`🔍 Buscando clínicas en ${city}`);
    
    if (!city) {
      this.logger.error('city parameter is required');
      throw new Error('city parameter is required');
    }

    try {
      const clinics = await this.clinicsService.searchClinicsByCity(city);
      this.logger.log(`✅ Encontradas ${clinics.length} clínicas en ${city}`);

      return {
        city,
        clinics,
        timestamp: new Date().toISOString(),
        source: 'google_places',
      };
    } catch (error) {
      this.logger.error(`❌ Error buscando clínicas: ${error}`);
      throw error;
    }
  }

  /**
   * Búsqueda múltiple para varias ciudades
   * GET /clinics/search-all
   */
  @Get('search-all')
  @HttpCode(HttpStatus.OK)
  async searchAllCities(): Promise<{
    results: SearchClinicsResponse[];
    totalClinics: number;
  }> {
    this.logger.log('🌍 Buscando clínicas en todas las ciudades');
    
    const cities = ['Bogota', 'Medellin', 'Cali'];
    
    try {
      const results = await Promise.all(
        cities.map(async (city) => {
          this.logger.log(`Procesando ${city}...`);
          const clinics = await this.clinicsService.searchClinicsByCity(city);
          this.logger.log(`✅ ${city}: ${clinics.length} clínicas`);
          
          return {
            city,
            clinics,
            timestamp: new Date().toISOString(),
            source: 'google_places' as const,
          };
        }),
      );

      const totalClinics = results.reduce((sum, r) => sum + r.clinics.length, 0);
      
      this.logger.log(`✅ Total: ${totalClinics} clínicas encontradas`);

      return {
        results,
        totalClinics,
      };
    } catch (error) {
      this.logger.error(`❌ Error en búsqueda múltiple: ${error}`);
      throw error;
    }
  }

  /**
   * Busca veterinarias cercanas por ubicación GPS
   * GET /clinics/nearby?lat=4.7110&lng=-74.0055&radius=5
   */
  @Get('nearby')
  @HttpCode(HttpStatus.OK)
  async searchNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string = '5',
  ): Promise<SearchClinicsResponse> {
    this.logger.log(`📍 Buscando clínicas cercanas: lat=${lat}, lng=${lng}, radius=${radius}km`);

    if (!lat || !lng) {
      throw new Error('lat y lng son requeridos');
    }

    try {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radiusNum = parseFloat(radius);

      const clinics = await this.clinicsService.searchClinicsByCoordinates(
        latNum,
        lngNum,
        radiusNum,
      );

      this.logger.log(`✅ Encontradas ${clinics.length} clínicas cercanas`);

      return {
        city: `Cercanas a (${latNum}, ${lngNum})`,
        clinics,
        timestamp: new Date().toISOString(),
        source: 'google_places',
      };
    } catch (error) {
      this.logger.error(`❌ Error buscando clínicas cercanas: ${error}`);
      throw error;
    }
  }
}
